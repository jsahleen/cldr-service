import express from 'express';
import { Permissions } from '../enums/permissions.enum';
import debug from 'debug';

const log: debug.IDebugger = debug('app:common-permissions-middleware');

class PermissionsMiddleware {
  constructor() {
    log('Created instance of PermissionsMiddleware');
  }

  permissionsFlagRequired(requiredPermissionsFlag: Permissions) {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const userPermissionsFlag = res.locals.jwt.permissionsFlag
        if (userPermissionsFlag & requiredPermissionsFlag) {
          next();
        } else {
          res.status(403).send();
        }
      } catch (e) {
        log(e);
      }
    };
  }

  async onlySameUserOrAdminCanDoThisAction(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const userPermissionFlags = res.locals.jwt.permissionsFlag;
    if (
      req.params &&
      req.params.id &&
      req.params.id === res.locals.jwt._id
    ) {
      return next();
    } else {
      if (userPermissionFlags & Permissions.ADMIN_PERMISSIONS) {
        return next();
      } else {
        return res.status(403).send();
      }
    }
  }

  
}

export default new PermissionsMiddleware();
