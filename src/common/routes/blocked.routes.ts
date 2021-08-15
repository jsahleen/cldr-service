import { CommonRoutesConfig } from "./common.routes"; 
import express from 'express';

export class BlockedRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'Blocked');
  }

  configureRoutes(): express.Application {

    this.app.route('/').all((req: express.Request, res: express.Response) => {
      res.status(404).send();
    });
    this.app.route('/public').all((req: express.Request, res: express.Response) => {
      res.status(404).send();
    });
    this.app.route('/public/users').all((req: express.Request, res: express.Response) => {
      res.status(404).send();
    });
    this.app.route('/admin').all((req: express.Request, res: express.Response) => {
      res.status(404).send();
    });

    return this.app;
    
  }

}