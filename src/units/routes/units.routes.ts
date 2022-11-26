import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import unitsController from "../controllers/units.controller";
import unitsMiddleware from "../middleware/units.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class UnitsRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'UnitsRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/units')
      .get(unitsController.listUnits)

    this.app.route('/public/units/:tag')
      .get([
        unitsMiddleware.validateNameOrTypeParameter,
        unitsController.listUnitsByTagOrType
      ]);

    this.app.route('/admin/units')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(unitsController.listUnits)
      .post([
        unitsMiddleware.validatePostBody,
        unitsMiddleware.ensureDocumentDoesNotExist,
        unitsController.createUnit
      ]);

    this.app.route('/admin/units/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        unitsMiddleware.ensureDocumentExists
      ])
      .get(unitsController.getUnitById)
      .put([
        unitsMiddleware.validatePutBody,
        unitsController.replaceUnitById
      ])
      .patch([
        unitsMiddleware.validatePatchBody,
        unitsController.updateUnitById
      ])
      .delete(unitsController.removeUnitById)

    return this.app
  }
}
