import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import territoriesController from "../controllers/territories.controller";
import territoriesMiddleware from "../middleware/territories.middleware"
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class TerritoriesRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'TerritoriesRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/territories')
      .get(territoriesController.listTerritories)

    this.app.route('/public/territories/:tag')
      .get([
        territoriesMiddleware.validateNameOrTypeParameter,
        territoriesController.listTerritoriesByTagOrType
      ]);

    this.app.route('/admin/territories')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(territoriesController.listTerritories)
      .post([
        territoriesMiddleware.validatePostBody,
        territoriesMiddleware.ensureDocumentDoesNotExist,
        territoriesController.createTerritory
      ]);

    this.app.route('/admin/territories/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        territoriesMiddleware.ensureDocumentExists
      ])
      .get(territoriesController.getTerritoryById)
      .put([
        territoriesMiddleware.validatePutBody,
        territoriesController.updateTerritoryById
      ])
      .patch([
        territoriesMiddleware.validatePatchBody,
        territoriesController.updateTerritoryById
      ])
      .delete(territoriesController.removeTerritoryById)

    return this.app
  }
}
