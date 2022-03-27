import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import zonesController from "../controllers/zones.controller";
import zonesMiddleware from "../middleware/zones.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class ZonesRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'ZonesRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/zones')
      .get(zonesController.listZones)

    this.app.route('/public/zones/:seg1/:seg2/:seg3?')
      .get([
        zonesMiddleware.parseIdentifier,
        zonesMiddleware.validateNameOrTypeParameter,
        zonesController.listZoneByIdentifier
      ]);

    this.app.route('/admin/zones')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(zonesController.listZones)
      .post([
        zonesMiddleware.validatePostBody,
        zonesMiddleware.ensureDocumentDoesNotExist,
        zonesController.createZone
      ]);

    this.app.route('/admin/zones/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        zonesMiddleware.ensureDocumentExists
      ])
      .get(zonesController.getZoneById)
      .put([
        zonesMiddleware.validatePutBody,
        zonesController.replaceZoneById
      ])
      .patch([
        zonesMiddleware.validatePatchBody,
        zonesController.updateZoneById
      ])
      .delete(zonesController.removeZoneById)

    return this.app
  }
}
