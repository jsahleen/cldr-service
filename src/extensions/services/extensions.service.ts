import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import extensionsDAO from "../daos/extensions.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/extensions.dtos";
import { IExtension } from "../interfaces/extensions.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:extensions-service');

class ExtensionsService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of ExtensionsService');
  }
  
  async list(keys: string[], locales: string[], filters: string[], limit, page): Promise<IExtension[]> {
    return extensionsDAO.listExtensions(keys, locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return extensionsDAO.createExtension(fields);
  }

  async getById(id: string): Promise<IExtension | null> {
    return extensionsDAO.getExtensionById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<void> {
    return extensionsDAO.updateExtensionById(id, fields);
  }

  async removeById(id: string): Promise<void> {
    return extensionsDAO.removeExtensionById(id);
  }

  async listByNameOrType(key: string, locales: string[], filters: string[], limit: number, page: number): Promise<IExtension[] | null> {
    return extensionsDAO.listExtensionsByKeyOrType(key, locales, filters, limit, page);
  }

  async getExtensionKeys() {
    return extensionsDAO.getExtensionKeys();
  }

}

export default new ExtensionsService();