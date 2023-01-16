# node-crud-api

Simple CRUD-API with Node.js.

## Table of contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)
- [API](#api)

## General info

This project is simple CRUD-API.

## Technologies

Project is created with:

- Node.js version: 18 LTS

## Setup

To setup the project, please follow these steps:

1. clone this repo to your machine using 'git clone'

2. open project folder

3. go to develop branch using 'git checkout dev'

4. install packages using 'npm install'

Now you can start the application:

1. In development mode:

`npm run start:dev`

2. In production mode:

`npm run start:prod`

3. In cluster mode:

`npm run start:multi`

3. Run tests:

`npm test`

## API

1. Implemented endpoint `api/users`:
   - **GET** `api/users` is used to get all users
     - Server answers with `status code` **200** and all users records
   - **GET** `api/users/{userId}` is used to get certain user
     - Server answers with `status code` **200** and record with `id === userId` if it exists
     - Server answers with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
     - Server answers with `status code` **404** and corresponding message if record with `id === userId` doesn't exist
   - **POST** `api/users` is used to create record about new user and store it in database
     - Server answers with `status code` **201** and newly created record
     - Server answers with `status code` **400** and corresponding message if request `body` does not contain **required** fields
   - **PUT** `api/users/{userId}` is used to update existing user
     - Server answers with` status code` **200** and updated record
     - Server answers with` status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
     - Server answers with` status code` **404** and corresponding message if record with `id === userId` doesn't exist
   - **DELETE** `api/users/{userId}` is used to delete existing user from database
     - Server answers with `status code` **204** if the record is found and deleted
     - Server answers with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
     - Server answers with `status code` **404** and corresponding message if record with `id === userId` doesn't exist
2. Users are stored as `objects` that have following properties:
   - `id` — unique identifier (`string`, `uuid`) generated on server side
   - `username` — user's name (`string`, **required**)
   - `age` — user's age (`number`, **required**)
   - `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)
3. Requests to non-existing endpoints (e.g. `some-non/existing/resource`) handled with `status code` **404** and corresponding human-friendly message)
4. Errors on the server side that occur during the processing of a request handled with `status code` **500** and corresponding human-friendly message)
