import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import currenciesController from "../controllers/currencies.controller";
import currenciesMiddleware from "../middleware/currencies.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class CurrencyRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'CurrencyRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/currencies')
      .get(currenciesController.listCurrencies)

    this.app.route('/public/currencies/:code')
      .get([
        currenciesMiddleware.validateNameOrTypeParameter,
        currenciesController.listCurrenciesByNameOrType
      ]);

    this.app.route('/admin/currencies')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(currenciesController.listCurrencies)
      .post([
        currenciesMiddleware.validatePostBody,
        currenciesMiddleware.ensureDocumentDoesNotExist,
        currenciesController.createCurrency
      ]);

    this.app.route('/admin/currencies/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        currenciesMiddleware.ensureDocumentExists
      ])
      .get(currenciesController.getCurrencyById)
      .put([
        currenciesMiddleware.validatePutBody,
        currenciesController.updateCurrencyById
      ])
      .patch([
        currenciesMiddleware.validatePatchBody,
        currenciesController.updateCurrencyById
      ])
      .delete(currenciesController.removeCurrencyById)

    return this.app
  }
}
