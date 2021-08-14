import express from 'express';
import jwt from 'jsonwebtoken';
import { Jwt } from '../../common/types/jwt.type';
import crypto from 'crypto';
import usersService from '../../users/services/users.service';
import debug, { IDebugger } from 'debug';

const jwtSecret: string | undefined = process.env.JWT_SECRET;

const log: IDebugger = debug('app:jwt-middleware');

class JwtMiddleware {

  constructor() {
    log('Created an instance of JwtMiddleware.');
  }

  async verifyRefreshBodyField(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.body && req.body.refreshToken) {
      return next();
    } else {
      return res
        .status(400)
        .send({ errors: ['Missing required field: refreshToken'] });
    }
  }

  async validRefreshNeeded(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await usersService.getUserByEmailWithPassword(res.locals.jwt.email);
    const salt = crypto.createSecretKey(
      Buffer.from(res.locals.jwt.refreshKey.data)
    );
    const hash = crypto
      .createHmac('sha512', salt)
      .update(res.locals.jwt._id + jwtSecret)
      .digest('base64');
    if (hash === req.body.refreshToken) {
      req.body = {
        _id: user?._id,
        email: user?.email,
        permissionsFlag: user?.permissionsFlag,
      };
      return next();
    } else {
      return res.status(400).send({ errors: ['Invalid refresh token'] });
    }
  }

  async validJWTNeeded(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.headers['authorization']) {
      try {
        const authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
          return res.status(401).send();
        } else if (typeof jwtSecret !== 'string') {
          return res.status(500).send();
        } else {
          res.locals.jwt = jwt.verify(
            authorization[1],
            jwtSecret
          ) as Jwt;
        }
        next();
      } catch (err) {
        return res.status(403).send();
      }
    } else {
      return res.status(401).send();
    }
  }
}

export default new JwtMiddleware();