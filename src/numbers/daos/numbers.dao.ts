import { INumberSystem } from '../interfaces/numbers.interface';
import NumberSystem from "../models/numbers.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/numbers.dtos';
import { merge } from 'lodash';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:numbersystem-dao');

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

class NumbersSystemsDAO {

  constructor() {
    log('Created new instance of NumberSystemsDAO');
  }

  async listNumberSystems(systems: string[], locales: string[], filters: string[], limit, page): Promise<INumberSystem[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return NumberSystem
      .find({$and: [{tag: { $in: locales }},{'main.name': systems}]})
      .select(`tag _id identity moduleType main.name ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();
  } 

  async createNumberSystem(fields: ICreateDTO): Promise<string> {
    const ns = new NumberSystem(fields);
    const system = await ns.save();
    return system._id;
  } 

  async getNumberSystemById(id: string): Promise<INumberSystem | null> {
    return  NumberSystem.findById(id).exec();
  }

  async updateNumberSystemById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<INumberSystem | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await NumberSystem.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return NumberSystem.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeNumberSystemById(id: string): Promise<INumberSystem | null> {
    return NumberSystem.findByIdAndRemove(id);
  }

  async listNumberSystemsByNameOrType(
    system: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<INumberSystem[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    switch (system) {
      case 'default':
        return NumberSystem
          .find({$and: [{'main.isDefault': true},{ tag: { $in: locales } }]})
          .select(`tag _id identity moduleType main.name ${paths.join(' ')}`)
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({tag: 'asc'})
          .exec();    
    
      case 'native':
        return NumberSystem
          .find({$and: [{'main.isNative': true},{ tag: { $in: locales } }]})
          .select(`tag _id identity moduleType main.name ${paths.join(' ')}`)
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({tag: 'asc'})
          .exec();    
    
      default:
        return NumberSystem
          .find({$and: [{'main.name': system},{ tag: { $in: locales } }]})
          .select(`_id tag identity moduleType main.name ${paths.join(' ')}`)
          .limit(limit)
          .skip((page - 1) * limit)
          .sort({tag: 'asc'})
          .exec();
    }
    
  }

  async getTags(): Promise<string[]> {
    const results = await NumberSystem.find().select('main.name').exec();
    return  results.map(result => {
      return result.main.name;
    }).filter(onlyUnique);
  }

  async getLocales(): Promise<string[]> {
    const results = await NumberSystem.find().select('tag').exec();
    return  results.map(result => {
      return result.tag;
    }).filter(onlyUnique);
  }

} 

export default new NumbersSystemsDAO();