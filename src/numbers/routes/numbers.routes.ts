import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import NumberSystemController from "../controllers/numbers.controller";
import NumberSystemsMiddleware from "../middleware/numbers.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

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

    this.app.route('/public/numbers/:system')
      .get([
        NumberSystemsMiddleware.validateNameOrTypeParameter,
        NumberSystemController.listNumberSystemsByNameOrType
      ]);

    this.app.route('/admin/numbers')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(NumberSystemController.listNumberSystems)
      .post([
        NumberSystemsMiddleware.validatePostBody,
        NumberSystemsMiddleware.ensureDocumentDoesNotExist,
        NumberSystemController.createNumberSystem
      ]);

    this.app.route('/admin/numbers/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        NumberSystemsMiddleware.ensureDocumentExists
      ])
      .get(NumberSystemController.getNumberSystemById)
      .put([
        NumberSystemsMiddleware.validatePutBody,
        NumberSystemController.updateNumberSystemById
      ])
      .patch([
        NumberSystemsMiddleware.validatePatchBody,
        NumberSystemController.updateNumberSystemById
      ])
      .delete(NumberSystemController.removeNumberSystemById)

    return this.app
  }
}
