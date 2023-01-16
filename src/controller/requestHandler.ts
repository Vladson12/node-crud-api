import { IncomingMessage, METHODS, ServerResponse } from 'http';
import { sendError, sendResponse } from './sendResponse';
import { StatusCode, ErrorMessage, Method } from '../util/constants';
import { validate } from 'uuid';
import { UserRepository } from '../repository/user.repository';
import { UserDTO } from '../dto/user.dto';
import { userTable } from '../db/db';

const userRepository = new UserRepository(userTable);

export const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
  //--------------------------------------------------------
  console.log(`Handler working on PID: ${process.pid}`);
  //--------------------------------------------------------

  try {
    if (!req.url?.startsWith('/api/users')) {
      return sendError(res, StatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
    }

    const id = req.url?.match(/\/api\/users\/\w+/) ? req.url.split('/')[3] : '';

    if (id && req.method === Method.POST) {
      return sendError(res, StatusCode.BAD_REQUEST, ErrorMessage.REQUEST_URL_FORMAT_INVALID);
    }

    if (id && !validate(id)) {
      return sendError(res, StatusCode.BAD_REQUEST, ErrorMessage.USER_ID_INVALID);
    }

    let body: any;
    switch (req.method) {
      case Method.GET:
        if (id) {
          const user = userRepository.getById(id);
          if (user) {
            return sendResponse(res, StatusCode.OK, user);
          }
          return sendError(res, StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
        }
        const users = userRepository.getAll();
        sendResponse(res, StatusCode.OK, users);
        break;
      case Method.POST:
        try {
          body = await getRequestBody(req);
        } catch (err) {
          return sendError(res, StatusCode.SERVER_ERROR, ErrorMessage.SERVER_ERROR);
        }

        if (validateRequestBody(body)) {
          const user = userRepository.create(body as UserDTO);
          return sendResponse(res, StatusCode.CREATED, user);
        }
        sendError(res, StatusCode.BAD_REQUEST, ErrorMessage.REQUEST_BODY_FORMAT_INVALID);
        break;
      case Method.PUT:
        try {
          body = await getRequestBody(req);
        } catch (err) {
          return sendError(res, StatusCode.SERVER_ERROR, ErrorMessage.SERVER_ERROR);
        }

        if (validateRequestBody(body)) {
          const user = userRepository.update(id, body as UserDTO);
          if (user) {
            return sendResponse(res, StatusCode.OK, user);
          }
          return sendError(res, StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
        }
        sendError(res, StatusCode.BAD_REQUEST, ErrorMessage.REQUEST_BODY_FORMAT_INVALID);
        break;
      case Method.DELETE:
        const result = userRepository.delete(id);
        if (result) {
          return sendResponse(res, StatusCode.NO_CONTENT, {});
        }
        sendError(res, StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
        break;
      default:
        sendError(res, StatusCode.METHOD_NOT_ALLOWED, ErrorMessage.METHOD_NOT_ALLOWED);
    }
  } catch (err) {
    sendError(res, StatusCode.SERVER_ERROR, ErrorMessage.SERVER_ERROR);
  }
};

export const getRequestBody = async (req: IncomingMessage) => {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      resolve(JSON.parse(body));
    });
    req.on('error', (err) => reject(err));
  });
};

const validateRequestBody = (body: any) => {
  const { username, age, hobbies } = body as UserDTO;

  if (!username || !age || !hobbies) {
    return false;
  }
  return true;
};
