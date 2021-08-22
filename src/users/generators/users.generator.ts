import argon2 from "argon2";
import debug, { IDebugger } from "debug";
import { Permissions } from "../../common/enums/permissions.enum";
import usersDao from "../dao/users.dao";
import { ICreateDTO } from "../dtos/users.dtos";
import UsersService from "../services/users.service";

const log: IDebugger = debug('app:users-generator');

export default class UsersGenerator {

  constructor() {
    log('Created instance of UsersGenerator.');
  }

  public async generate(): Promise<string> {
    // If root user does not exist, create root user
    // Root user can create other users
    // Root user email and pass defined in .env filt

    if (!process.env.ROOT_USER_EMAIL || !process.env.ROOT_USER_PASSWORD) {
      log('Root user email or password not defined.');
      process.exit(1);
    }
    const adminUser = await usersDao.getUserByEmail(process.env.ROOT_USER_EMAIL);
    if (!adminUser || process.env.DEBUG) {
      const adminUserData: ICreateDTO = {
        firstName: 'root',
        lastName: 'user',
        email: process.env.ROOT_USER_EMAIL,
        password: await argon2.hash(process.env.ROOT_USER_PASSWORD),
        permissionsFlag: Permissions.ALL_PERMISSIONS
      };
      await UsersService.add(adminUserData);
      return 'Created root user.';
    }
    return 'Root user already exists';
  }
}
