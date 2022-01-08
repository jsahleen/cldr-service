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
  
  async list(tags: string[], locales: string[], filters: string[], limit, page): Promise<ITerritory[]> {
    return territoriesDAO.listTerritories(tags, locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return territoriesDAO.createTerritory(fields);
  }

  async getById(id: string): Promise<ITerritory | null> {
    return territoriesDAO.getTerritoryById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<ITerritory | null> {
    return territoriesDAO.updateTerritoryById(id, fields, true);
  }

  async replaceById(id: string, fields: IPutDTO | IPatchDTO): Promise<ITerritory | null> {
    return territoriesDAO.updateTerritoryById(id, fields);
  }

  async removeById(id: string): Promise<ITerritory | null> {
    return territoriesDAO.removeTerritoryById(id);
  }

  async listByNameOrType(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<ITerritory[] | null> {
    return territoriesDAO.listTerritoriesByTagOrType(category, locales, filters, limit, page);
  }

  async getTags() {
    return territoriesDAO.getTags();
  }

  async getLocales() {
    return territoriesDAO.getLocales();
  }

}

export default new TerritoriesService();