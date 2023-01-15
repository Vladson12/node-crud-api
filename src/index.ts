import http from 'http';
import { UserRepository } from './repository/user.repository';
import { config } from 'dotenv';
import { requestHandler } from './controller/requestHandler';

config();

const userRepository = new UserRepository();

const server = http.createServer((req, res) => {
  requestHandler(req, res);
});

const port = process.env.PORT ?? 4000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
