# API Specification

## Auth

### Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **Response**: `{ accessToken, refreshToken, user }`

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: `{ accessToken, refreshToken, user }`

### Refresh Token
- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**: `{ refreshToken: "string" }`
- **Response**: `{ accessToken }`

### Get Current User
- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: `{ user }`
