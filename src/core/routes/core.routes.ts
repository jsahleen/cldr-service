import { CommonRoutesConfig } from '../../common/routes/common.routes'
import express from 'express';

import availableLocales from 'cldr-core/availableLocales.json';

const modernLocales = availableLocales.availableLocales.modern;

export class CoreRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'CoreRoutes');
  }

  configureRoutes(): express.Application {
    this.app.route('/public/core/locales')
      .get((req: express.Request, res: express.Response) => {
        res.status(200);
        res.send({availableLocales: modernLocales});
      });
    
    this.app.route('/public/core')
      .get((req: express.Request, res: express.Response) => {
        res.status(404);
      });

    return this.app;
  }
}
