import { IncomingMessage, METHODS, ServerResponse } from 'http';
import { User } from '../model/user';
import { sendErrorResponse, sendSuccessResponse } from './sendResponse';
import { StatusCode, ResponseMessage, Method } from '../util/constants';
import { validate } from 'uuid';
import { UserRepository } from '../repository/user.repository';
import { UserDTO } from '../dto/user.dto';

const userRepository = new UserRepository();

export const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    if (!req.url?.startsWith('/api/users')) {
      return sendErrorResponse(res, StatusCode.NOT_FOUND, ResponseMessage.NOT_FOUND);
    }

    const id = req.url?.match(/\/api\/users\/\w+/) ? req.url.split('/')[3] : '';

    if (id && !validate(id)) {
      return sendErrorResponse(res, StatusCode.BAD_REQUEST, ResponseMessage.USER_INVALID);
    }

    if (id && req.method === Method.POST) {
      return sendErrorResponse(res, StatusCode.BAD_REQUEST, ResponseMessage.REQUEST_FORMAT_INVALID);
    }

    let body: any;
    switch (req.method) {
      case Method.GET:
        if (id) {
          const user = userRepository.getById(id);
          if (user) {
            return sendSuccessResponse(res, StatusCode.OK, user);
          }
          return sendErrorResponse(res, StatusCode.NOT_FOUND, ResponseMessage.USER_NOT_FOUND);
        }
        const users = userRepository.getAll();
        sendSuccessResponse(res, StatusCode.OK, users);
        break;
      case Method.POST:
        try {
          body = await getRequestBody(req);
        } catch (err) {
          return sendErrorResponse(res, StatusCode.SERVER_ERROR, ResponseMessage.SERVER_ERROR);
        }

        if (validateRequestBody(body)) {
          const user = userRepository.create(body as UserDTO);
          return sendSuccessResponse(res, StatusCode.CREATED, user);
        }
        sendErrorResponse(res, StatusCode.BAD_REQUEST, ResponseMessage.REQUEST_FORMAT_INVALID);
        break;
      case Method.PUT:
        try {
          body = await getRequestBody(req);
        } catch (err) {
          return sendErrorResponse(res, StatusCode.SERVER_ERROR, ResponseMessage.SERVER_ERROR);
        }

        if (validateRequestBody(body)) {
          const user = userRepository.update(id, body as UserDTO);
          if (user) {
            return sendSuccessResponse(res, StatusCode.OK, user);
          }
          return sendErrorResponse(res, StatusCode.NOT_FOUND, ResponseMessage.USER_NOT_FOUND);
        }
        sendErrorResponse(res, StatusCode.BAD_REQUEST, ResponseMessage.REQUEST_FORMAT_INVALID);
        break;
      case Method.DELETE:
        const result = userRepository.delete(id);
        if (result) {
          return sendSuccessResponse(res, StatusCode.NO_CONTENT, {});
        }
        sendErrorResponse(res, StatusCode.NOT_FOUND, ResponseMessage.USER_NOT_FOUND);
        break;
      default:
        sendErrorResponse(res, StatusCode.METHOD_NOT_ALLOWED, ResponseMessage.METHOD_NOT_ALLOWED);
    }
  } catch (err) {
    sendErrorResponse(res, StatusCode.SERVER_ERROR, ResponseMessage.SERVER_ERROR);
  }
};

const getRequestBody = (req: IncomingMessage) => {
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
