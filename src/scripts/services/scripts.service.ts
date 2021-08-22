import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import scriptsDAO from "../daos/scripts.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/scripts.dtos";
import { IScript } from "../interfaces/scripts.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:currencies-service');

class ScriptsService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of ScriptsService');
  }
  
  async list(locales: string[], filters: string[], limit, page): Promise<IScript[]> {
    return scriptsDAO.listScripts(locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return scriptsDAO.createScript(fields);
  }

  async getById(id: string): Promise<IScript | null> {
    return scriptsDAO.getScriptById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<void> {
    return scriptsDAO.updateScriptById(id, fields);
  }

  async removeById(id: string): Promise<void> {
    return scriptsDAO.removeScriptById(id);
  }

  async listByNameOrType(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<IScript[] | null> {
    return scriptsDAO.listScriptsByTagOrType(category, locales, filters, limit, page);
  }

  async getScriptTags() {
    return scriptsDAO.getScriptTags();
  }

}

export default new ScriptsService();