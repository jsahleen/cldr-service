import debug, { IDebugger } from "debug";
import UsersService from "../services/users.service";
import express from 'express';

const log: IDebugger = debug('app:users-controller');

class UsersController {

  constructor() {
    log('Created an instance of UsersController');
  }

  async listUsers(req: express.Request, res: express.Response) {
    const {limit = 25, page = 1} = req.query;
    const users = await UsersService.list(limit, page);
    res.status(200).send({users: users});
  }

  async getUserById(req: express.Request, res: express.Response) {
    const user = await UsersService.getById(req.params.id);
    if (!user) {
      res.status(404).send();
    }
    res.status(200).send(user);
  }

  async createUser(req: express.Request, res: express.Response) {
    const id = await UsersService.add(req.body);
    res.status(204).send({_id: id});
  }

  async updateUserById(req: express.Request, res: express.Response) {
    await UsersService.updateById(req.params.id, req.body);
    res.status(204).send();
  }

  async replaceUserById(req: express.Request, res: express.Response) {
    log(await UsersService.updateById(req.params.id, req.body));
    res.status(204).send();
  }

  async deleteUserById(req: express.Request, res: express.Response) {
    log(await UsersService.removeById(req.params.id));
    res.status(204).send();
  }
  
}

export default new UsersController();