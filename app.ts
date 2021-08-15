// Environment variables
import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

// Import app elements
import express from 'express';
import * as http from 'http';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import helmet from 'helmet';
import debug from 'debug';

// Import service routes
import { CommonRoutesConfig } from './src/common/routes/common.routes';
import { BlockedRoutes } from './src/common/routes/blocked.routes';
import { AuthRoutes } from './src/auth/routes/auth.routes';
import { UsersRoutes } from './src/users/routes/users.routes';
import { NumberSystemsRoutes } from './src/numbers/routes/numbers.routes';

// App configuration
const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.use(helmet());

// Logging
const log: debug.IDebugger = debug('app');
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

// Route configuration
const routes: Array<CommonRoutesConfig> = [];
routes.push(new BlockedRoutes(app));
routes.push(new UsersRoutes(app));
routes.push(new AuthRoutes(app));
routes.push(new NumberSystemsRoutes(app));

// Server startup code
const runningMessage = `Server running at http://localhost:${port}`;
const p = server.listen(port, () => {
  routes.forEach((route: CommonRoutesConfig) => {
      log(`Routes configured for ${route.getName()}`);
  });
  console.log(runningMessage);
});

// Graceful shutdown
function handleShutdownGracefully() {
  console.info("\nClosing server gracefully...");
  p.close(() => {
    console.info("Server closed.");
    process.exit(0);
  });
}

// Shutdown listeners
process.on('SIGTERM', handleShutdownGracefully);
process.on('SIGINT', handleShutdownGracefully);
process.on('SIGHUP', handleShutdownGracefully);
