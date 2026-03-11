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

## Leads

### Get Saved Leads
- **URL**: `/leads`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: `Array<SavedLead>`

### Save Lead
- **URL**: `/leads`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "id": "uuid (optional)",
    "companyName": "string",
    "industry": "string (optional)",
    "website": "string (optional)",
    "email": "string (optional)",
    "linkedin": "string (optional)",
    "generatedEmail": "string (optional)",
    "generatedLinkedin": "string (optional)"
  }
  ```
- **Response**: `SavedLead`

### Update Lead
- **URL**: `/leads/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Request Body**: Same as Save Lead (partial updates supported)
- **Response**: `SavedLead`

### Remove Lead
- **URL**: `/leads/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**: `{ message: "Lead removed successfully" }`
