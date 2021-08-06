import { CommonRoutesConfig } from "../../common/routes/common.routes";
import express from 'express';
import usersController from "../controllers/users.controller";
import usersMiddleware from "../middleware/users.middleware";

export class UsersRoutes extends CommonRoutesConfig {

  constructor(app: express.Application) {
    super(app, 'Users');
  }

  configureRoutes(): express.Application {
    this.app.route('/admin/users')
      .get([
        usersController.listUsers
      ])
      .post([
        usersController.createUser
      ]);

    this.app.route('/admin/users/:id')
      .get([
        usersMiddleware.validateUserExists,
        usersController.getUserById
      ])
      .put([
        usersController.replaceUserById
      ])
      .patch([
        usersController.updateUserById
      ])
      .delete([
        usersController.deleteUserById
      ]);

    return this.app;

  }

}