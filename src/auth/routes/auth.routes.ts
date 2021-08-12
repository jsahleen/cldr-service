import { CommonRoutesConfig } from '../../common/routes/common.routes';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';
import express from 'express';
import jwtMiddleware from '../middleware/jwt.middleware';

export class AuthRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'AuthRoutes');
  }

  configureRoutes(): express.Application {
    this.app.post(`/auth`, [
      authMiddleware.verifyPostBody,
      authMiddleware.verifyUserPassword,
      authController.createJWT,
    ]);

    this.app.post(`/auth/refresh-token`, [
      jwtMiddleware.validJWTNeeded,
      jwtMiddleware.verifyRefreshBodyField,
      jwtMiddleware.validRefreshNeeded,
      authController.createJWT,
    ]);

    return this.app;
    
  }
}
