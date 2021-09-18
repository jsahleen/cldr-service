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

    const rEmail = process.env.CLDR_ROOT_USER_EMAIL || 'root@example.com';
    const rPass = process.env.CLDR_ROOT_USER_PASSWORD || 'P@$sW0rD';

    const adminUser = await usersDao.getUserByEmail(rEmail);
    log(adminUser);

    if (!adminUser) {
      const adminUserData: ICreateDTO = {
        firstName: 'root',
        lastName: 'user',
        email: rEmail,
        password: await argon2.hash(rPass),
        permissionsFlag: Permissions.ALL_PERMISSIONS
      };
      await UsersService.add(adminUserData);
      return 'Created root user.';
    }
    return 'Root user already exists';
  }
}
