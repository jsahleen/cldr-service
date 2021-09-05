import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import localesController from "../controllers/locales.controller";
import localesMiddleware from "../middleware/locales.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class LocalesRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'LocalesRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/locales')
      .get(localesController.listLocales)

    this.app.route('/public/locales/:tag')
      .get([
        localesMiddleware.validateNameOrTypeParameter,
        localesController.listLocalesByTagOrType
      ]);

    this.app.route('/admin/locales')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(localesController.listLocales)
      .post([
        localesMiddleware.validatePostBody,
        localesMiddleware.ensureDocumentDoesNotExist,
        localesController.createLocale
      ]);

    this.app.route('/admin/locales/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        localesMiddleware.ensureDocumentExists
      ])
      .get(localesController.getLocaleById)
      .put([
        localesMiddleware.validatePutBody,
        localesController.updateLocaleById
      ])
      .patch([
        localesMiddleware.validatePatchBody,
        localesController.updateLocaleById
      ])
      .delete(localesController.removeLocaleById)

    return this.app
  }
}
