import dotenv from 'dotenv';
import path from 'path';

// initialize dotenv
const currentWorkingDir = process.cwd();
const envFilePath = path.join(currentWorkingDir, '.env');
dotenv.config({
  path: envFilePath,
});

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// env list
export const env = {
  isProduction,
  node_env: process.env.NODE_ENV,
  frontend_base_url: process.env.FRONTEND_BASE_URL,
  port: process.env.PORT || 5001,
  DB_URL: process.env.MONGO_URL,
  db_name: process.env.DB_NAME,
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET, 
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET, // console.log(require("crypto").randomBytes(64).toString('hex'));
  jwt_access_token_expire_in: process.env.JWT_ACCESS_TOKEN_EXPIRE_IN,
  jwt_refresh_token_expire_in: process.env.JWT_REFRESH_TOKEN_EXPIRE_IN,

};
