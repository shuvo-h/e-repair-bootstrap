# Electric Gadgets Management Dashboard(Assignment 6)

This project is a comprehensive Electric Gadgets Management Dashboard designed to streamline inventory management, track sales, and analyze sales history for electric gadgets. Users can perform CRUD operations, manage sales, and filter electric gadgets based on various criteria.

Module based project has been structured and Eslint and Prettier has been used to ensure the code formatting and code cleanup. 

<!-- 
## Full Documentation URL 
Click here to read [Full API Documentation](https://documenter.getpostman.com/view/20475660/2s9YkuXx9P) 
-->

## Live URL 
Click here to visit the root of the server [Electric Gadgets Management API](https://el-gadget-mgt.vercel.app)

## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (Node Package Manager)

## Installation

```bash
git clone https://github.com/Porgramming-Hero-web-course/l2-b2-assignment-6-backend-shuvo-h.git
cd l2-b2-assignment-6-backend-shuvo-h
npm install
```
## App Configuration(.env)
Add your environment variable values like database url, saltround for bycript, production env etc to the .env file.


Environment Variables:
- [NODE_ENV](): ```development (development || production)```
- [PORT](): ```5000```
- [FRONTEND_BASE_URL](): ```http://localhost:3000```
- [FRONTEND_BASE_PRODUCTION_URL](): ```https://glistening-hotteok-f0e6c3.netlify.app```
- [MONGO_URL](): ```mongodb+srv://username:password@clasternumber/?```
- [DB_NAME](): ```your-db-name```
- [BCRYPT_SALT_ROUNDS](): ```12```

JWT Configuration:
- [JWT_ACCESS_SECRET](): ```your-jwt-access-secret```
- [JWT_REFRESH_SECRET](): ```your-jwt-secret```
- [JWT_ACCESS_TOKEN_EXPIRE_IN](): ```1d```
- [JWT_REFRESH_TOKEN_EXPIRE_IN](): ```365d```


## Run the Server

```bash
npm run build
npm run start
```


<!-- ## API list -->