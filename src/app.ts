// Import app elements
import express from 'express';
import * as http from 'http';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import helmet from 'helmet';
import debug from 'debug';

// Import service routes
import { CommonRoutesConfig } from './common/routes/common.routes';
import { CoreRoutes } from './core/routes/core.routes';
import { BlockedRoutes } from './common/routes/blocked.routes';
import { AuthRoutes } from './auth/routes/auth.routes';
import { UsersRoutes } from './users/routes/users.routes';
import { NumberSystemsRoutes } from './numbers/routes/numbers.routes';
import { CurrencyRoutes } from './currencies/routes/currencies.routes';
import { LanguageRoutes } from './languages/routes/languages.routes';
import { ScriptsRoutes } from './scripts/routes/scripts.routes';
import { TerritoriesRoutes } from './territories/routes/territories.routes';
import { VariantsRoutes} from './variants/routes/variants.routes'
import { ExtensionsRoutes} from './extensions/routes/extensions.routes'
import { LocalesRoutes} from './locales/routes/locales.routes'

// App configuration
const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

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
routes.push(new CoreRoutes(app));
routes.push(new BlockedRoutes(app));
routes.push(new UsersRoutes(app));
routes.push(new AuthRoutes(app));
routes.push(new NumberSystemsRoutes(app));
routes.push(new CurrencyRoutes(app));
routes.push(new LanguageRoutes(app));
routes.push(new ScriptsRoutes(app));
routes.push(new TerritoriesRoutes(app));
routes.push(new VariantsRoutes(app));
routes.push(new ExtensionsRoutes(app));
routes.push(new LocalesRoutes(app));

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
