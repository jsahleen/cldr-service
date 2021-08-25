import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import extensionsController from "../controllers/extensions.controller";
import extensionsMiddleware from "../middleware/extensions.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class ExtensionsRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'ExtensionsRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/extensions')
      .get(extensionsController.listExtensions)

    this.app.route('/public/extensions/:key')
      .get([
        extensionsMiddleware.validateNameOrTypeParameter,
        extensionsController.listExtensionsByKeyOrType
      ]);

    this.app.route('/admin/extensions')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(extensionsController.listExtensions)
      .post([
        extensionsMiddleware.validatePostBody,
        extensionsMiddleware.ensureDocumentDoesNotExist,
        extensionsController.createExtension
      ]);

    this.app.route('/admin/extensions/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        extensionsMiddleware.ensureDocumentExists
      ])
      .get(extensionsController.getExtensionById)
      .put([
        extensionsMiddleware.validatePutBody,
        extensionsController.updateExtensionById
      ])
      .patch([
        extensionsMiddleware.validatePatchBody,
        extensionsController.updateExtensionById
      ])
      .delete(extensionsController.removeExtensionById)

    return this.app
  }
}
