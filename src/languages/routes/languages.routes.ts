import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import languagesController from "../controllers/languages.controller";
import languagesMiddleware from "../middleware/languages.middleware"
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class LanguageRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'LanguageRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/languages')
      .get(languagesController.listLanguages)

    this.app.route('/public/languages/:tag')
      .get([
        languagesMiddleware.validateNameOrTypeParameter,
        languagesController.listLanguagesByTagOrType
      ]);

    this.app.route('/admin/languages')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(languagesController.listLanguages)
      .post([
        languagesMiddleware.validatePostBody,
        languagesMiddleware.ensureDocumentDoesNotExist,
        languagesController.createLanguage
      ]);

    this.app.route('/admin/languages/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        languagesMiddleware.ensureDocumentExists
      ])
      .get(languagesController.getLanguageById)
      .put([
        languagesMiddleware.validatePutBody,
        languagesController.replaceLanguageById
      ])
      .patch([
        languagesMiddleware.validatePatchBody,
        languagesController.updateLanguageById
      ])
      .delete(languagesController.removeLanguageById)

    return this.app
  }
}
