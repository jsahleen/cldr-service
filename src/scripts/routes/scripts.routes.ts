import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import scriptsController from "../controllers/scripts.controller";
import scriptsMiddleware from "../middleware/scripts.middleware"
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class ScriptsRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'ScriptsRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/scripts')
      .get(scriptsController.listScripts)

    this.app.route('/public/scripts/:tag')
      .get([
        scriptsMiddleware.validateNameOrTypeParameter,
        scriptsController.listScriptsByTagOrType
      ]);

    this.app.route('/admin/scripts')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(scriptsController.listScripts)
      .post([
        scriptsMiddleware.validatePostBody,
        scriptsMiddleware.ensureDocumentDoesNotExist,
        scriptsController.createScript
      ]);

    this.app.route('/admin/scripts/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        scriptsMiddleware.ensureDocumentExists
      ])
      .get(scriptsController.getScriptById)
      .put([
        scriptsMiddleware.validatePutBody,
        scriptsController.updateScriptById
      ])
      .patch([
        scriptsMiddleware.validatePatchBody,
        scriptsController.updateScriptById
      ])
      .delete(scriptsController.removeScriptById)

    return this.app
  }
}
