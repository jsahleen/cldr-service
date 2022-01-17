import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import relativeTimeController from "../controllers/time.controller";
import relativeTimeMiddleware from "../middleware/time.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class RelativeTimeRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'RelativeTimeRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/relative-time')
      .get(relativeTimeController.listRelativeTimeFormats)

    this.app.route('/public/relative-time/:format')
      .get([
        relativeTimeMiddleware.validateNameOrTypeParameter,
        relativeTimeController.listRelativeTimeFormatsByFormat
      ]);

    this.app.route('/admin/relative-time')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(relativeTimeController.listRelativeTimeFormats)
      .post([
        relativeTimeMiddleware.validatePostBody,
        relativeTimeMiddleware.ensureDocumentDoesNotExist,
        relativeTimeController.createRelativeTimeFormats
      ]);

    this.app.route('/admin/relative-time/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        relativeTimeMiddleware.ensureDocumentExists
      ])
      .get(relativeTimeController.getRelativeTimeFormatsById)
      .put([
        relativeTimeMiddleware.validatePutBody,
        relativeTimeController.replaceRelativeTimeFormatsById
      ])
      .patch([
        relativeTimeMiddleware.validatePatchBody,
        relativeTimeController.updateRelativeTimeFormatsById
      ])
      .delete(relativeTimeController.removeRelativeTimeFormatsById)

    return this.app
  }
}
