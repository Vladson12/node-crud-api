import request from 'supertest';
import server from '../src';
import { User } from '../src/model/user';
import { v4 as uuidv4, v4, validate } from 'uuid';
import { UserDTO } from '../src/dto/user.dto';
import { ErrorMessage, StatusCode } from '../src/util/constants';

afterAll(() => {
  server.close();
});

describe('CRUD operations', () => {
  it('Get empty users array - success 200', async () => {
    const res = await request(server).get('/api/users');
    expect(res.statusCode).toBe(StatusCode.OK);
    expect(res.body).toEqual([]);
  });

  let createdUserId: string;

  it('Create new user - success 201', async () => {
    const user: UserDTO = { username: 'Bobby', age: 30, hobbies: ['football', 'hiking', 'watching TV-shows'] };
    const res = await request(server).post('/api/users').send(user);

    expect(res.statusCode).toBe(StatusCode.CREATED);
    expect(res.body).toMatchObject(user);
    expect(validate(res.body.id)).toBe(true);
    createdUserId = res.body.id;
  });

  it('Get just created user - success 200', async () => {
    console.log(createdUserId);

    const res = await request(server).get(`/api/users/${createdUserId}`);

    expect(res.statusCode).toBe(StatusCode.OK);
    expect(res.body).toMatchObject({
      username: 'Bobby',
      age: 30,
      hobbies: ['football', 'hiking', 'watching TV-shows'],
    });
  });

  it('Update just created user - success 200', async () => {
    const updatedUser: UserDTO = { username: 'Jim', age: 22, hobbies: ['music', 'women'] };

    const res = await request(server).put(`/api/users/${createdUserId}`).send(updatedUser);

    expect(res.statusCode).toBe(StatusCode.OK);
    expect(res.body.id).toBe(createdUserId);
    expect(res.body).toMatchObject(updatedUser);
  });

  it("Delete just created user and check this user doesn't exist anymore - success 204, 404", async () => {
    const res = await request(server).delete(`/api/users/${createdUserId}`);

    expect(res.statusCode).toBe(StatusCode.NO_CONTENT);

    const newRes = await request(server).get(`/api/users/${createdUserId}`);
    expect(newRes.statusCode).toBe(StatusCode.NOT_FOUND);
    expect(newRes.body).toEqual({ error: ErrorMessage.USER_NOT_FOUND });
  });

  it('Create 3 new users and get them - success 201, 200', async () => {
    const user1: UserDTO = { username: 'Chuck', age: 70, hobbies: ['karate'] };
    const user2: UserDTO = { username: 'Jean-Claude', age: 60, hobbies: ['kickboxing'] };
    const user3: UserDTO = { username: 'Jackie', age: 65, hobbies: ['kung-fu'] };

    const res1 = await request(server).post('/api/users').send(user1);
    const res2 = await request(server).post('/api/users').send(user2);
    const res3 = await request(server).post('/api/users').send(user3);

    expect(res1.statusCode).toBe(StatusCode.CREATED);
    expect(res2.statusCode).toBe(StatusCode.CREATED);
    expect(res3.statusCode).toBe(StatusCode.CREATED);

    const res = await request(server).get('/api/users');
    expect(res.statusCode).toBe(StatusCode.OK);
    expect(res.body).toHaveLength(3);
    expect(res.body.find((user: User) => user.username === 'Chuck')).toBeTruthy();
    expect(res.body.find((user: User) => user.username === 'Jean-Claude')).toBeTruthy();
    expect(res.body.find((user: User) => user.username === 'Jackie')).toBeTruthy();
  });
});

describe('CRUD operations on non-existing user', () => {
  const someNonExistingUserId = v4();

  it('Get user - error 404 (User not found)', async () => {
    const res = await request(server).get(`/api/users/${someNonExistingUserId}`);

    expect(res.statusCode).toBe(StatusCode.NOT_FOUND);
    expect(res.body).toEqual({ error: ErrorMessage.USER_NOT_FOUND });
  });

  it('Update user - error 404 (User not found)', async () => {
    const user: UserDTO = { username: 'Bobby', age: 30, hobbies: ['football', 'hiking', 'watching TV-shows'] };
    const res = await request(server).put(`/api/users/${someNonExistingUserId}`).send(user);

    expect(res.statusCode).toBe(StatusCode.NOT_FOUND);
    expect(res.body).toEqual({ error: ErrorMessage.USER_NOT_FOUND });
  });

  it('Delete user - error 404 (User not found)', async () => {
    const res = await request(server).delete(`/api/users/${someNonExistingUserId}`);

    expect(res.statusCode).toBe(StatusCode.NOT_FOUND);
    expect(res.body).toEqual({ error: ErrorMessage.USER_NOT_FOUND });
  });
});

describe('CRUD operations on invalid request url format, invalid request body format or non-existing endpoints', () => {
  const invalidId = v4().slice(0, -1);

  it('Get user - error 400 (User id invalid)', async () => {
    const res = await request(server).get(`/api/users/${invalidId}`);

    expect(res.statusCode).toBe(StatusCode.BAD_REQUEST);
    expect(res.body).toEqual({ error: ErrorMessage.USER_ID_INVALID });
  });

  it('Create user - error 400 (Request url format invalid)', async () => {
    const user: UserDTO = { username: 'Bobby', age: 35, hobbies: ['Jogging', 'TV-shows'] };

    const res = await request(server).post(`/api/users/some-extra`).send(user);
    expect(res.statusCode).toBe(StatusCode.BAD_REQUEST);
    expect(res.body).toEqual({ error: ErrorMessage.REQUEST_URL_FORMAT_INVALID });
  });

  it('Create user - error 400 (Request body format invalid)', async () => {
    const user1 = {};
    const user2 = { username: 'Bobby' };
    const user3 = { username: 'Bobby', age: 30 };
    const user4 = { username: 'Bobby', hobbies: ['Jogging', 'TV-shows'] };

    const res1 = await request(server).post(`/api/users`).send(user1);
    expect(res1.statusCode).toBe(StatusCode.BAD_REQUEST);
    expect(res1.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });

    const res2 = await request(server).post(`/api/users`).send(user2);
    expect(res2.statusCode).toBe(StatusCode.BAD_REQUEST);
    expect(res2.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });

    const res3 = await request(server).post(`/api/users`).send(user3);
    expect(res3.statusCode).toBe(StatusCode.BAD_REQUEST);
    expect(res3.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });

    const res4 = await request(server).put(`/api/users`).send(user4);
    expect(res4.statusCode).toBe(StatusCode.BAD_REQUEST);
    expect(res4.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
  });

  it('Update user - error 400 (User id invalid)', async () => {
    const user: UserDTO = { username: 'Bobby', age: 30, hobbies: ['football', 'hiking', 'watching TV-shows'] };
    const res = await request(server).put(`/api/users/${invalidId}`).send(user);

    expect(res.statusCode).toBe(StatusCode.BAD_REQUEST);
    expect(res.body).toEqual({ error: ErrorMessage.USER_ID_INVALID });
  });

  it('Delete user - error 400 (User id invalid)', async () => {
    const res = await request(server).delete(`/api/users/${invalidId}`);

    expect(res.statusCode).toBe(StatusCode.BAD_REQUEST);
    expect(res.body).toEqual({ error: ErrorMessage.USER_ID_INVALID });
  });

  it('Send request to non-existing endpoint - error 404 (Requested page/resource not found)', async () => {
    const res = await request(server).get('/some/non-existing/path');

    expect(res.statusCode).toBe(StatusCode.NOT_FOUND);
    expect(res.body).toEqual({ error: ErrorMessage.NOT_FOUND });
  });
});
