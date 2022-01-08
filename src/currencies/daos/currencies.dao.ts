import { ICurrency } from '../interfaces/currencies.interface';
import Currency from "../models/currencies.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/currencies.dtos';
import debug, {IDebugger } from 'debug';
import { merge } from 'lodash';

const log: IDebugger = debug('app:currencies-dao');

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

class CurrenciesDAO {

  constructor() {
    log('Created new instance of CurrenciesDAO');
  }

  async listCurrencies(codes: string[], locales: string[], filters: string[], limit, page): Promise<ICurrency[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Currency
      .find({$and: [{tag: { $in: locales }},{'main.code': codes}]})
      .select(`tag _id identity moduleType main.code ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();
  } 

  async createCurrency(fields: ICreateDTO): Promise<string> {
    const currency = new Currency(fields);
    const system = await currency.save();
    return system._id;
  } 

  async getCurrencyById(id: string): Promise<ICurrency | null> {
    return  Currency.findById(id).exec();
  }

  async updateCurrencyById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<ICurrency | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Currency.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Currency.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeCurrencyById(id: string): Promise<ICurrency | null> {
    return Currency.findByIdAndRemove(id);
  }

  async listCurrenciesByCodeOrType(
    code: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<ICurrency[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    switch (code) {
      case 'current':
        return Currency
          .find({$and: [{'main.isCurrent': true},{ tag: { $in: locales } }]})
          .select(`tag _id identity moduleType main.code ${paths.join(' ')}`)
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({tag: 'asc'})
          .exec();    
    
      case 'historical':
        return Currency
          .find({$and: [{'main.isCurrent': false},{ tag: { $in: locales } }]})
          .select(`tag _id identity moduleType main.code ${paths.join(' ')}`)
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({tag: 'asc'})
          .exec();    
        
      default:
        return Currency
          .find({$and: [{'main.code': code},{ tag: { $in: locales } }]})
          .select(`_id tag identity moduleType main.code ${paths.join(' ')}`)
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({tag: 'asc'})
          .exec();
    }
    
  }

  async getTags(): Promise<string[]> {
    const results = await Currency.find().select('main.code').exec();
    return  results.map(result => {
      return result.main.code;
    }).filter(onlyUnique);
  }

  async getLocales(): Promise<string[]> {
    const results = await Currency.find().select('tag').exec();
    return  results.map(result => {
      return result.tag;
    }).filter(onlyUnique);
  }

} 

export default new CurrenciesDAO();