import http from 'http';

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  SERVER_ERROR = 500,
}

export enum ErrorMessage {
  NOT_FOUND = 'Requested page/resource not found',
  SERVER_ERROR = 'Internal server error',
  USER_NOT_FOUND = 'User not found',
  USER_ID_INVALID = 'User id invalid',
  REQUEST_URL_FORMAT_INVALID = 'Request URL format invalid',
  REQUEST_BODY_FORMAT_INVALID = 'Request body format invalid',
  METHOD_NOT_ALLOWED = 'Method not allowed',
}
