import { CommonRoutesConfig } from '../../common/routes/common.routes'
import express from 'express';
import CLDRUTIL from '../../common/util/common.util';

const availableLocales = CLDRUTIL.getAvailableLocales();

export class CoreRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'CoreRoutes');
  }

  configureRoutes(): express.Application {
    this.app.route('/public/core/locales')
      .get((req: express.Request, res: express.Response) => {
        res.status(200);
        res.send({availableLocales: availableLocales});
      });
    
    this.app.route('/public/core')
      .get((req: express.Request, res: express.Response) => {
        res.status(404);
      });

    return this.app;
  }
}
