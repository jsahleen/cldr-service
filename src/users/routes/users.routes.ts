import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import usersController from "../controllers/users.controller";
import usersMiddleware from "../middleware/users.middleware";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import permissionsMiddleware from "../../common/middleware/common.permissions.middleware";
import { Permissions } from "../../common/enums/permissions.enum";

export class UsersRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'Users');
  }

  configureRoutes(): express.Application {
    this.app.route('/admin/users')
      .get([
        jwtMiddleware.validJWTNeeded,
        permissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        usersController.listUsers
      ])
      .post([
        jwtMiddleware.validJWTNeeded,
        permissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        usersController.createUser
      ]);

    this.app.route('/admin/users/:id')
      .all([
        usersMiddleware.validateUserExists,
        jwtMiddleware.validJWTNeeded,
        permissionsMiddleware.onlySameUserOrAdminCanDoThisAction
      ])
      .get([
        usersController.getUserById
      ])
      .put([
        usersMiddleware.userCantChangePermission,
        permissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        usersController.replaceUserById
      ])
      .patch([
        usersMiddleware.userCantChangePermission,
        permissionsMiddleware.permissionsFlagRequired(
          Permissions.ADMIN_PERMISSIONS
        ),
        usersController.updateUserById
      ])
      .delete([
        usersController.deleteUserById
      ]);

    return this.app;

  }

}