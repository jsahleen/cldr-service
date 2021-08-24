import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import territoriesDAO from "../daos/territories.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/territories.dtos";
import { ITerritory } from "../interfaces/territories.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:territories-service');

class TerritoriesService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of TerritoriesService');
  }
  
  async list(locales: string[], filters: string[], limit, page): Promise<ITerritory[]> {
    return territoriesDAO.listTerritories(locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return territoriesDAO.createTerritory(fields);
  }

  async getById(id: string): Promise<ITerritory | null> {
    return territoriesDAO.getTerritoryById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<void> {
    return territoriesDAO.updateTerritoryById(id, fields);
  }

  async removeById(id: string): Promise<void> {
    return territoriesDAO.removeTerritoryById(id);
  }

  async listByNameOrType(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<ITerritory[] | null> {
    return territoriesDAO.listTerritoriesByTagOrType(category, locales, filters, limit, page);
  }

  async getScriptTags() {
    return territoriesDAO.getTerritoryTags();
  }

}

export default new TerritoriesService();