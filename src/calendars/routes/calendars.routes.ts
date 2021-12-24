import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import calendarsController from "../controllers/calendars.controller";
import calendarsMiddleware from "../middleware/calendars.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import commonPermissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class CalendarsRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'CalendarsRoutes');
  }
  
  /**
   * configureRoutes
   */
  public configureRoutes(): express.Application {
    this.app.route('/public/calendars')
      .get(calendarsController.listCalendars)

    this.app.route('/public/calendars/:calendar')
      .get([
        calendarsMiddleware.validateNameOrTypeParameter,
        calendarsController.listCalendarsByNameOrType
      ]);

    this.app.route('/admin/calendars')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        )
      ])
      .get(calendarsController.listCalendars)
      .post([
        calendarsMiddleware.validatePostBody,
        calendarsMiddleware.ensureDocumentDoesNotExist,
        calendarsController.createCalendar
      ]);

    this.app.route('/admin/calendars/:id')
      .all([
        jwtMiddleware.validJWTNeeded,
        commonPermissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        calendarsMiddleware.ensureDocumentExists
      ])
      .get(calendarsController.getCalendarById)
      .put([
        calendarsMiddleware.validatePutBody,
        calendarsController.updateCalendarById
      ])
      .patch([
        calendarsMiddleware.validatePatchBody,
        calendarsController.updateCalendarById
      ])
      .delete(calendarsController.removeCalendarById)

    return this.app
  }
}
