import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/users.dtos'
import debug, { IDebugger } from 'debug';
import { IUser } from '../interfaces/users.interface';
import User from '../models/users.model';

const log: IDebugger  = debug('app:users-dao');

class UsersDAO {

  constructor() {
    log('Created instance of UsersDAO');
  }

  async listUsers(limit: number, page: number): Promise<IUser[]> {
    const users = await User.find().limit(limit).skip((page - 1) * limit).exec();
    return users;
  }

  async addUser(data: ICreateDTO): Promise<string> {
    const user = new User({ ...data});
    await user.save();
    return user._id;
  }

  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id).populate('User').exec();
  }

  async getUserByEmail(email: string) {
    return User.findOne({ email: email }).exec();
  }

  async updateUserById(id: string, fields: IPutDTO | IPatchDTO): Promise<IUser | null> {
    const existingUser = await User.findOneAndUpdate(
      { _id: id },
      { $set: fields },
      { new: true }
    ).exec();

    return existingUser;
  }

  async getUserByEmailWithPassword(email: string) {
    return User.findOne({ email: email })
      .select('_id email permissionsFlag +password')
      .exec();
  }

  async removeUserById(userId: string) {
    return User.deleteOne({ _id: userId }).exec();
  }

}

export default new UsersDAO();