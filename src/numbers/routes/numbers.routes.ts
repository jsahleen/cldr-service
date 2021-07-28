import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import NumberSystemController from "../controllers/numbers.controller";

export class NumberSystemRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'NumberSystemRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/numbers')
      .get(NumberSystemController.listNumberSystems)

    this.app.route('/public/numbers/category/:category')
      .get(NumberSystemController.listNumberSystemsByCategory);

    this.app.route('/public/numbers/category/:category/locale/:locale')
      .get(NumberSystemController.getNumberSystemByCategoryAndLocale);

    this.app.route('/admin/numbers')
      .get(NumberSystemController.listNumberSystems)
      .post(NumberSystemController.createNumberSystem);

    this.app.route('/admin/numbers/:id')
      .get(NumberSystemController.getNumberSystemById)
      .put(NumberSystemController.replaceNumberSystemById)
      .patch(NumberSystemController.updateNumberSystemById)
      .delete(NumberSystemController.removeNumberSystemById)

   return this.app
  }
}
