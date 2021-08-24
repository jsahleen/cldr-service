import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import variantsDao from "../daos/variants.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/variants.dtos";
import { IVariant } from "../interfaces/variants.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:variants-service');

class VariantsService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of VariantsService');
  }
  
  async list(locales: string[], filters: string[], limit, page): Promise<IVariant[]> {
    return variantsDao.listVariants(locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return variantsDao.createVariant(fields);
  }

  async getById(id: string): Promise<IVariant | null> {
    return variantsDao.getVariantById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<void> {
    return variantsDao.updateVariantById(id, fields);
  }

  async removeById(id: string): Promise<void> {
    return variantsDao.removeVariantById(id);
  }

  async listByNameOrType(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<IVariant[] | null> {
    return variantsDao.listVariantsByTagOrType(category, locales, filters, limit, page);
  }

  async getVariantTags() {
    return variantsDao.getVariantTags();
  }

}

export default new VariantsService();