# Express API

**Project**
- **Description**: Simple Express REST API with token generation and CRUD for users.
- **Server file**: [server.js](server.js#L1-L400)
- **Auth logic**: [auth/auth.js](auth/auth.js#L1-L200) and credentials in [auth/auth.json](auth/auth.json#L1-L50)
- **Data store**: [dataBase/data.json](dataBase/data.json#L1-L200)

**Requirements**
- Node.js 18+ (or any Node supporting `express` dependency)
- Install dependencies: `npm install`

**Run**
- Start the server: `node server.js or direcly execute start-server.bat file by double clicking or run from cmd`
- Default port: `3000` (http://localhost:3000)

**Auth / Token**
- **Endpoint**: `POST /auth/token`
- **Purpose**: Generate a token for a valid username/password pair (tokens stored in memory).
- **Request headers**: `Content-Type: application/json`
- **Request body**:
```
{
  "username": "admin",
  "password": "admin123"
}
```
- **Success response (200)**:
```
{
  "message": "Token generated successfully",
  "token": "<generated_token_here>"
}
```
- **Errors**:
- 400 if `username` or `password` missing
- 401 if credentials invalid

Note: Valid credentials are defined in [auth/auth.json](auth/auth.json#L1-L50). Example users: `admin/admin123`, `shrinivas/shree123`, `tester/test123`.

Usage example (curl):
```
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

After you receive the token, include it on subsequent requests as an Authorization header:
```
Authorization: Bearer <token>
```

**Users API (CRUD)**
All `/users` endpoints require the `Authorization` header: `Bearer <token>`.

- **Get all users**
  - Method: `GET`
  - URL: `/users`
  - Response (200): array of users (example from dataBase/data.json):
```
[
  { "id": 1, "name": "Shrinivas", "age": 30, "city": "Pune" },
  { "id": 2, "name": "Rahul", "age": 28, "city": "Mumbai" }
]
```

- **Get user by id**
  - Method: `GET`
  - URL: `/users/:id`
  - Success response (200): single user object
```
{
  "id": 1,
  "name": "Shrinivas",
  "age": 30,
  "city": "Pune"
}
```
  - Error: 404 if user not found

- **Create user**
  - Method: `POST`
  - URL: `/users`
  - Request body (JSON):
```
{
  "name": "Alice",
  "age": 25,
  "city": "Delhi"
}
```
  - Success response (201):
```
{
  "message": "User created successfully",
  "user": {
    "id": 3,
    "name": "Alice",
    "age": 25,
    "city": "Delhi"
  }
}
```

- **Update user**
  - Method: `PUT`
  - URL: `/users/:id`
  - Request body (JSON): (all fields replaced)
```
{
  "name": "Alice Updated",
  "age": 26,
  "city": "Pune"
}
```
  - Success response (200):
```
{
  "message": "User updated successfully",
  "user": {
    "id": 3,
    "name": "Alice Updated",
    "age": 26,
    "city": "Pune"
  }
}
```
  - Error: 404 if user not found

- **Delete user**
  - Method: `DELETE`
  - URL: `/users/:id`
  - Success response (200):
```
{
  "message": "User deleted successfully",
  "user": {
    "id": 3,
    "name": "Alice Updated",
    "age": 26,
    "city": "Pune"
  }
}
```
  - Error: 404 if user not found

Example curl sequence (get token, then list users):
```
# 1) Get token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r .token)

# 2) Use token to list users
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/users
```

Notes and caveats
- Tokens are stored in memory in the running server process (`activeTokens` in auth/auth.js). Restarting the server will invalidate previously issued tokens.
- The database is a JSON file at [dataBase/data.json](dataBase/data.json#L1-L200). Concurrent writes are not protected—this is a simple demo, not production-ready.

If you want, I can also:
- add a `start` script to `package.json` (e.g., `node server.js`)
- add persistence for tokens or integrate a proper DB
