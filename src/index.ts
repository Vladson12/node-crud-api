import http from 'http';
import { UserRepository } from './repository/user.repository';
import { config } from 'dotenv';

config();

const userRepository = new UserRepository();

const server = http.createServer((req, res) => {
  const { url, method } = req;
  console.log(url);
  console.log(method);
  if (url == '/get' && method == 'GET') {
    const users = userRepository.getAll();
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(users));
  } else if (url?.startsWith('/get') && method == 'GET') {
    const id = url.slice(url.indexOf('id')).split('=')[1];
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(userRepository.getById(id)));
  }
});

console.log(process.env);
const port = process.env.PORT ?? 3030;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
