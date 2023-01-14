import { ServerResponse } from 'http';
import { User } from '../model/user';
import { StatusCode } from '../util/constants';

export const sendErrorResponse = (res: ServerResponse, statusCode: StatusCode, message: string) => {
  res.writeHead(statusCode);
  res.end(message);
};

export const sendSuccessResponse = (res: ServerResponse, statusCode: StatusCode, body?: User | User[] | any) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};
