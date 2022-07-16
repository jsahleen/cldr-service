import express from 'express';
import usersService from '../../users/services/users.service';
import argon2 from 'argon2';
import { body, validationResult } from 'express-validator';

class AuthMiddleware {

  async verifyUserPassword(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await usersService.getUserByEmailWithPassword(
      req.body.email
    );
    if (user) {
      const passwordHash = user.password;
      if (await argon2.verify(passwordHash, req.body.password)) {
        req.body = {
          _id: user._id.toString(),
          email: user.email,
          permissionsFlag: user.permissionsFlag,
        };
        return next();
      }
    }
    
    res.status(400).send({ errors: ['Invalid email and/or password'] });
  }

  async verifyPostBody(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    body('email').isEmail();
    body('password').isString();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      next();
    }
  }
}

export default new AuthMiddleware();
