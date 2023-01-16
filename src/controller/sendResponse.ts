import { ServerResponse } from 'http';
import { User } from '../model/user';
import { StatusCode } from '../util/constants';

export const sendError = (res: ServerResponse, statusCode: StatusCode, message: string) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
};

export const sendResponse = (res: ServerResponse, statusCode: StatusCode, body?: User | User[] | any) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};
