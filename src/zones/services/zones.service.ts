import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import ZonesDAO from "../daos/zones.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/zones.dtos";
import { IZone } from "../interfaces/zones.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:zones-service');

class ZonesService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of ZonesService');
  }
  
  async list(zones: string[], locales: string[], filters: string[], limit, page): Promise<IZone[]> {
    return ZonesDAO.listZones(zones, locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return ZonesDAO.createZone(fields);
  }

  async getById(id: string): Promise<IZone | null> {
    return ZonesDAO.getZoneById(id);
  }

  async replaceById (id: string, fields: IPutDTO | IPatchDTO): Promise<IZone | null> {
    return ZonesDAO.updateZoneById(id, fields);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<IZone | null> {
    return ZonesDAO.updateZoneById(id, fields, true);
  }

  async removeById(id: string): Promise<IZone | null> {
    return ZonesDAO.removeZoneById(id);
  }

  async listByNameOrType(identifier: string, locales: string[], filters: string[], limit: number, page: number): Promise<IZone[] | null> {
    return ZonesDAO.listZoneByIdentifier(identifier, locales, filters, limit, page);
  }

  async getTags() {
    return ZonesDAO.getTags();
  }

  async getLocales() {
    return ZonesDAO.getLocales();
  }

}

export default new ZonesService();