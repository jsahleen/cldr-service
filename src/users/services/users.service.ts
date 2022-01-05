import UsersDAO from "../dao/users.dao";
import { IUser } from "../interfaces/users.interface";
import { ICRUD } from "../../common/interfaces/crud.interface";

class UsersService implements ICRUD {
  
  async list(limit, page): Promise<IUser[]> {
    return UsersDAO.listUsers(limit, page);
  }

  async add(fields): Promise<string> {
    return UsersDAO.addUser(fields);
  }

  async getById(id: string): Promise<IUser | null> {
    return UsersDAO.getUserById(id);
  }

  async getByEmail(email: string): Promise<IUser | null> {
    return UsersDAO.getUserByEmail(email);
  }

  async getUserByEmailWithPassword(email: string) {
    return UsersDAO.getUserByEmailWithPassword(email);
  }

  async updateById(id: string, fields): Promise<IUser | null> {
    return UsersDAO.updateUserById(id, fields, true);
  }

  async replaceById(id: string, fields): Promise<IUser | null> {
    return UsersDAO.updateUserById(id, fields);
  }

  async removeById(id: string): Promise<void> {
    await UsersDAO.removeUserById(id);
  }
  
}

export default new UsersService();
