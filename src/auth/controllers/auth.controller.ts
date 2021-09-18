import express from 'express';
import { IDebugger, debug } from 'debug';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const log: IDebugger = debug('app:auth-controller');

const jwtSecret: string = process.env.CLDR_JWT_SECRET || "b2upnzpr/XkBCpP";
const tokenExpirationInSeconds = 36000;


class AuthController {
  constructor() {
    log('Created instance of AuthController.');
  }

  async createJWT(req: express.Request, res: express.Response) {
    try {
      if(!jwtSecret) {
        return res.status(500).send();
      }
      const refreshId = req.body._id + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(16));
      const hash = crypto
        .createHmac('sha512', salt)
        .update(refreshId)
        .digest('base64');
      req.body.refreshKey = salt.export();
      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationInSeconds,
      });
      return res
        .status(201)
        .send({ accessToken: token, refreshToken: hash });
    } catch (err) {
      log('createJWT error: %O', err);
      return res.status(500).send();
    }
  }

}

export default new AuthController();