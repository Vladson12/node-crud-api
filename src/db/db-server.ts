import http from 'http';
import { requestHandler } from '../controller/requestHandler';

const pid = process.pid;

const port = process.env.PORT ?? 4000 - 1;

const dbServer = http
  .createServer(async (req, res) => {
    requestHandler(req, res);
  })
  .listen(port, () => {
    console.log(`DB server started on port ${port}. PID: ${pid}`);
  });

export default dbServer;
