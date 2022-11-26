// Import app elements
import express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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
import { VariantsRoutes } from './variants/routes/variants.routes'
import { ExtensionsRoutes } from './extensions/routes/extensions.routes'
import { LocalesRoutes } from './locales/routes/locales.routes'
import { CalendarsRoutes } from './calendars/routes/calendars.routes';
import { RelativeTimeRoutes } from './time/routes/time.routes';
import { ZonesRoutes } from './zones/routes/zones.routes'
import { UnitsRoutes } from './units/routes/units.routes'

// App configuration
const app: express.Application = express();

const log: debug.IDebugger = debug('app');

const certPath = process.env.CLDR_CERT_PATH || '../cert/cldr-service.pem';
const keyPath = process.env.CLDR_KEY_PATH || '../cert/cldr-service-key.pem';

let cert: string | null = null;
let key: string | null = null;

try {
  cert = readFileSync(resolve(__dirname, certPath), 'utf-8');
} catch(e) {
  log(e)
} 
try {
  key = readFileSync(resolve(__dirname, keyPath), 'utf-8');
} catch(e) {
  log(e)
}

const credentials = (key && cert) ? {key: key, cert: cert}: {};

const server: http.Server | https.Server = (key && cert) ? https.createServer(credentials, app) : http.createServer(app);
const port = (key && cert) ? (process.env.CLDR_SSL_PORT || 8000) : (process.env.CLDR_PORT || 3000);
const protocol = (key && cert) ? 'https' : 'http';

app.use(cors());
app.use(helmet());
app.use(express.json());

// Logging
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
routes.push(new CalendarsRoutes(app));
routes.push(new RelativeTimeRoutes(app));
routes.push(new ZonesRoutes(app));
routes.push(new UnitsRoutes(app));

// Server startup code
const runningMessage = `Server running at ${protocol}://localhost:${port}`;
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
