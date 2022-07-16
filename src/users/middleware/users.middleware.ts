import usersService from "../services/users.service";
import express from 'express';

class UsersMiddleware {

  async validateSameEmailDoesntExist(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await usersService.getByEmail(req.body.email);
    if (user) {
        res.status(400).send({ error: `User email already exists` });
    } else {
        next();
    }
  }

  async validateSameEmailBelongToSameUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (res.locals.user._id.toString() === req.params.id) {
      next();
    } else {
      res.status(400).send({ error: `Invalid email` });
    }
  }

  async validateUserExists(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await usersService.getById(req.params.id);
    if (user) {
        res.locals.user = user;
        next();
    } else {
        res.status(404).send({
            error: `User ${req.params.userId} not found`,
        });
    }
  }

  async userCantChangePermission(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (
      'permissionsFlag' in req.body &&
      req.body.permissionsFlag !== res.locals.user.permissionsFlag
    ) {
      res.status(400).send({
        errors: ['User cannot change permission flags'],
      });
    } else {
      next();
    }
  }

}

export default new UsersMiddleware();