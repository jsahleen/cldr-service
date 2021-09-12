import { IAdmin } from "../../common/interfaces/admin.interface";
import { IPublic } from "../../common/interfaces/public.interface";
import CurrenciesDAO from "../daos/currencies.dao";
import { ICreateDTO, IPatchDTO, IPutDTO } from "../dtos/currencies.dtos";
import { ICurrency } from "../interfaces/currencies.interface";
import debug, {IDebugger } from 'debug';
const log: IDebugger = debug('app:currencies-service');

class NumberSystemsService implements IAdmin, IPublic {

  constructor() {
    log('Created new instance of CurrencyService');
  }
  
  async list(codes: string[], locales: string[], filters: string[], limit, page): Promise<ICurrency[]> {
    return CurrenciesDAO.listCurrencies(codes, locales, filters, limit, page);
  }

  async create(fields: ICreateDTO): Promise<string> {
    return CurrenciesDAO.createCurrency(fields);
  }

  async getById(id: string): Promise<ICurrency | null> {
    return CurrenciesDAO.getCurrencyById(id);
  }

  async updateById(id: string, fields: IPutDTO | IPatchDTO): Promise<void> {
    return CurrenciesDAO.updateCurrencyById(id, fields);
  }

  async removeById(id: string): Promise<void> {
    return CurrenciesDAO.removeCurrencyById(id);
  }

  async listByNameOrType(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<ICurrency[] | null> {
    return CurrenciesDAO.listCurrenciesByCodeOrType(category, locales, filters, limit, page);
  }

  async getCurrencyCodes() {
    return CurrenciesDAO.getCurrencyCodes();
  }

}

export default new NumberSystemsService();