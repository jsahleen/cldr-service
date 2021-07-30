import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

import express from 'express';
import * as http from 'http';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import {CommonRoutesConfig} from './src/common/routes/common.routes';
import {NumberSystemRoutes} from './src/numbers/routes/numbers.routes';
import debug from 'debug';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3000;
const routes: Array<CommonRoutesConfig> = [];
const log: debug.IDebugger = debug('app');

app.use(express.json());
app.use(cors());

const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
      winston.format.json(),
      winston.format.prettyPrint(),
      winston.format.colorize({ all: true })
  ),
};

if (!process.env.DEBUG) {
  loggerOptions.meta = false; // when not debugging, log requests as one-liners
}

app.use(expressWinston.logger(loggerOptions));

routes.push(new NumberSystemRoutes(app));

const runningMessage = `Server running at http://localhost:${port}`;

const p = server.listen(port, () => {
  routes.forEach((route: CommonRoutesConfig) => {
      log(`Routes configured for ${route.getName()}`);
  });
  console.log(runningMessage);
});

function handleShutdownGracefully() {
  console.info("\nClosing server gracefully...");
  p.close(() => {
    console.info("Server closed.");
    process.exit(0);
  });
}

process.on('SIGTERM', handleShutdownGracefully);
process.on('SIGINT', handleShutdownGracefully);
process.on('SIGHUP', handleShutdownGracefully);
