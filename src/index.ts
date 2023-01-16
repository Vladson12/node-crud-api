import http, { IncomingMessage, METHODS, Server } from 'http';
import { UserRepository } from './repository/user.repository';
import { config } from 'dotenv';
import { getRequestBody, requestHandler } from './controller/requestHandler';
import cluster from 'cluster';
import os from 'os';
import { Method } from './util/constants';
import { WorkerInfo } from './util/types';
import { fork } from 'child_process';
import { userTable } from './db/db';

const pid = process.pid;

config();

const port = process.env.PORT ?? 4000;

let server: Server;

if (process.env.MULTI) {
  if (cluster.isPrimary) {
    const childProcess = fork('./src/db/db-server.ts', [], {
      execArgv: ['-r', 'ts-node/register'],
      env: { PORT: (+port - 1).toString() },
    });
    const userRepository = new UserRepository(userTable);
    const workers: WorkerInfo[] = [];
    let currentWorkerIndex = 0;

    let currentPort;
    server = http
      .createServer((req, res) => {
        currentPort = workers[currentWorkerIndex].port;
        if (currentWorkerIndex === workers.length - 1) {
          currentWorkerIndex = 0;
        } else {
          currentWorkerIndex++;
        }

        return redirectRequest(req, res, currentPort);
      })
      .listen(+port, () => {
        console.log(`Load balancer is running on port ${port}. PID: ${pid}`);
      });

    for (let i = 0; i < os.cpus().length; i++) {
      const workerPort = +port + i + 1;
      const worker = cluster.fork({ PORT: workerPort });
      workers.push({ pid: worker.process.pid!, port: workerPort });
    }
    cluster.on('exit', (worker) => {
      console.log(`Worker died! Pid: ${worker.process.pid}`);
      const deadWorkerIndex = workers.findIndex((w) => w.pid === worker.process.pid);
      if (deadWorkerIndex !== -1) {
        const deadWorkerPort = workers[deadWorkerIndex].port;
        workers.splice(deadWorkerIndex, 1);
        const newWorker = cluster.fork({ PORT: deadWorkerPort });
        workers.push({ pid: newWorker.process.pid!, port: deadWorkerPort });
      }
    });
  } else {
    server = http
      .createServer(async (req, res) => {
        const options = {
          hostname: '127.0.0.1',
          port: 4000 - 1,
          path: req.url,
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const request = http.request(options, (response) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            res.setHeader('Content-type', 'application/json');
            res.end(data);
          });
        });
        if (req.method === Method.POST || req.method === Method.PUT) {
          const body = await getRequestBody(req);
          request.write(JSON.stringify(body));
        }
        request.on('error', (err) => {
          console.log(err);
        });
        request.end();
      })
      .listen(port, () => {
        console.log(`Worker is running on port ${port}. PID: ${pid}`);
      });
  }
} else {
  server = http
    .createServer(async (req, res) => {
      await requestHandler(req, res);
    })
    .listen(+port, () => {
      console.log(`Server is running on port ${port}. PID: ${pid}`);
    });
}

const redirectRequest = async (
  req: IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  },
  port: number,
): Promise<void> => {
  const options = {
    hostname: '127.0.0.1',
    port: port,
    path: req.url,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const request = http.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      res.setHeader('Content-type', 'application/json');
      res.end(data);
    });
  });
  if (req.method === Method.POST || req.method === Method.PUT) {
    const body = await getRequestBody(req);
    request.write(JSON.stringify(body));
  }
  request.on('error', (err) => {
    console.log(err);
  });
  request.end();
};

export default server;
