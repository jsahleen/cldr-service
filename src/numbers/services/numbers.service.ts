import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import NumbersSystemsDAO from "../daos/numbers.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/numbers.dtos";
import { INumberSystem } from "../interfaces/numbers.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:numbersystem-service');

class NumberSystemsService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of NumberSystemsService');
  }
  
  async list(locales: string[], filters: string[], limit, page): Promise<INumberSystem[]> {
    return NumbersSystemsDAO.listNumberSystems(locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return NumbersSystemsDAO.createNumberSystem(fields);
  }

  async getById(id: string): Promise<INumberSystem | null> {
    return NumbersSystemsDAO.getNumberSystemById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<void> {
    return NumbersSystemsDAO.updateNumberSystemById(id, fields);
  }

  async removeById(id: string): Promise<void> {
    return NumbersSystemsDAO.removeNumberSystemById(id);
  }

  async listByNameOrType(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<INumberSystem[] | null> {
    return NumbersSystemsDAO.listNumberSystemsByNameOrType(category, locales, filters, limit, page);
  }

  async getNumberSystemNames() {
    return NumbersSystemsDAO.getNumberSystemNames();
  }

}

export default new NumberSystemsService();