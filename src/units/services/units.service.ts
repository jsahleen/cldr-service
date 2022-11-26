import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import variantsDao from "../daos/units.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/units.dtos";
import { IUnit } from "../interfaces/units.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:units-service');

class UnitsService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of UnitsService');
  }
  
  async list(tags: string[], locales: string[], filters: string[], limit, page): Promise<IUnit[]> {
    return variantsDao.listUnits(tags, locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return variantsDao.createUnit(fields);
  }

  async getById(id: string): Promise<IUnit | null> {
    return variantsDao.getUnitById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<IUnit | null> {
    return variantsDao.updateUnitById(id, fields, true);
  }

  async replaceById(id: string, fields: IPutDTO | IPatchDTO): Promise<IUnit | null> {
    return variantsDao.updateUnitById(id, fields);
  }

  async removeById(id: string): Promise<IUnit | null> {
    return variantsDao.removeUnitById(id);
  }

  async listByNameOrType(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<IUnit[] | null> {
    return variantsDao.listUnitsByTagOrType(category, locales, filters, limit, page);
  }

  async getTags() {
    return variantsDao.getTags();
  }

  async getLocales() {
    return variantsDao.getLocales();
  }

}

export default new UnitsService();