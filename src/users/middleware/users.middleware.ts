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

  async validateUserExists(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await usersService.getById(req.params.id);
    if (user) {
        next();
    } else {
        res.status(404).send({
            error: `User ${req.params.userId} not found`,
        });
    }
  }


}

export default new UsersMiddleware();