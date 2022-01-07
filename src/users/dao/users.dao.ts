import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/users.dtos'
import debug, { IDebugger } from 'debug';
import { IUser } from '../interfaces/users.interface';
import User from '../models/users.model';
import { merge } from 'lodash';

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
    const user = new User(data);
    await user.save();
    return user._id;
  }

  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id).populate('User').exec();
  }

  async getUserByEmail(email: string) {
    return User.findOne({ email: email }).exec();
  }

  async updateUserById(id: string, fields: IPutDTO | IPatchDTO, mergeFields = false): Promise<IUser | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await User.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return User.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async getUserByEmailWithPassword(email: string) {
    return User.findOne({ email: email })
      .select('_id email permissionsFlag +password')
      .exec();
  }

  async removeUserById(id: string) {
    return User.deleteOne({ _id: id }).exec();
  }

}

export default new UsersDAO();