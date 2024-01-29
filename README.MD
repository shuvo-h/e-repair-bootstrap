# Electric Gadgets Management Dashboard(Assignment 5)

This project is a comprehensive Electric Gadgets Management Dashboard designed to streamline inventory management, track sales, and analyze sales history for electric gadgets. Users can perform CRUD operations, manage sales, and filter electric gadgets based on various criteria.

Module based project has been structured and Eslint and Prettier has been used to ensure the code formatting and code cleanup. 

<!-- 
## Full Documentation URL 
Click here to read [Full API Documentation](https://documenter.getpostman.com/view/20475660/2s9YkuXx9P) 
-->

## Live URL 
Click here to visit the root of the server [Electric Gadgets Management](https://assignment-4-pink.vercel.app)

## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (Node Package Manager)

## Installation

```bash
git clone https://github.com/Porgramming-Hero-web-course/l2b2-full-stack-a5-server-side-shuvo-h.git
cd l2b2-full-stack-a5-server-side-shuvo-h
npm install
```
## App Configuration(.env)
Add your environment variable values like database url, saltround for bycript, production env etc to the .env file.


Environment Variables:
- [NODE_ENV](): development (development || production)
- [PORT](): 5000
- [FRONTEND_BASE_URL](): http://localhost:3000
- [MONGO_URL](): mongodb+srv://username:password@clasternumber/?
- [DB_NAME](): assignfive
- [BCRYPT_SALT_ROUNDS](): 12

JWT Configuration:
- [JWT_ACCESS_SECRET](): your-jwt-access-secret
- [JWT_REFRESH_SECRET](): your-jwt-secret
- [JWT_ACCESS_TOKEN_EXPIRE_IN](): 1d
- [JWT_REFRESH_TOKEN_EXPIRE_IN](): 365d


## Run the Server

```bash
npm run build
npm run start
```

