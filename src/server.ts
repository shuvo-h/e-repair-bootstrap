import mongoose, { ConnectOptions } from 'mongoose';
import { app } from './app';
import { Server } from 'http';
import { env } from './config/config';

let server: Server;

async function main() {
  try {
    // connect DB
    if (env.DB_URL) {
      await mongoose.connect(env.DB_URL, {
        dbName: env.db_name,
      } as ConnectOptions);
    }

    // listen server
    server = app.listen(env.port, () => {
      console.log(`app listening on port ${env.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

// listen event for unhandle exception error or unhandle rejection error, then shutdown the server
// handle unhandleRejection error
process.on('unhandledRejection', () => {
  // console.log(`😈 UnhandleRejection is detected, shutting down....`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
// handle uncaughtException error
process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected, shutting down....`);
  process.exit(1);
});
