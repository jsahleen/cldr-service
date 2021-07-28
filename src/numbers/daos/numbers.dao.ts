import { INumberSystem } from '../interfaces/numbers.interface';
import NumberSystem from "../models/numbers.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/numbers.dtos';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:numbersystem-dao');

class NumbersSystemsDAO {

  constructor() {
    log('Created new instance of NumberSystemsDAO');
  }

  async listNumberSystems(locales: string[], filters: string[], limit: number, page: number): Promise<INumberSystem[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return NumberSystem
      .find({tag: {"$in": locales}})
      .select(`tag _id moduleType ${paths.join(' ')}`)
      .limit(limit)
      .skip(limit * page)
      .exec();
  } 

  async createNumberSystem(fields: ICreateDTO): Promise<string> {
    const ns = new NumberSystem(fields);
    const system = await ns.save();
    return system._id;
  } 

  async getNumberSystemById(id: string): Promise<INumberSystem | null> {
    return  NumberSystem.findOne({_id: id}).exec();
  }

  async updateNumberSystemById(id: string, fields: IPatchDTO): Promise<void> {
    NumberSystem.findByIdAndUpdate( 
        { _id: id },
        { $set: fields },
        { new: true }
    ).exec();
  }

  async replaceNumberSystemById(id: string, fields: IPutDTO): Promise<void> {
    NumberSystem.findByIdAndUpdate( 
      { _id: id },
      { $set: fields },
      { new: true }
    ).exec();
  }

  async removeNumberSystemById(id: string): Promise<void> {
   NumberSystem.findByIdAndRemove({_id: id});
  }

  async listNumberSystemsByCategory(category: string, locales: string[], filters: string[], limit: number, page: number): Promise<INumberSystem[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    switch (category) {
      case 'default':
        return NumberSystem.find({'main.isDefault': true, tag: {"$in": locales}})
          .select(`_id tag identity moduleType ${paths.join(' ')}`)
          .limit(limit)
          .skip(limit * page)
          .exec();    
    
      case 'native':
        return NumberSystem.find({'main.isNative': true, tag: {"$in": locales}})
          .select(`_id tag identity moduleType ${paths.join(' ')}`)
          .limit(limit)
          .skip(limit * page)
          .exec();    
    
      default:
        return NumberSystem.find({'main.name': category, tag: {"$in": locales}})
          .select(`_id tag identity moduleType ${paths.join(' ')}`)
          .limit(limit)
          .skip(limit * page)
          .exec();
    }
    
  }

  async getNumberSystemByCategoryAndLocale(category: string, locale: string, filters: string[]): Promise<INumberSystem | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    switch (category) {
      case 'default':
        return NumberSystem.findOne({'main.isDefault': true, tag: locale})
          .select(`_id identity moduleType ${paths.join(' ')}`)
          .exec();    
    
      case 'native':
        return NumberSystem.findOne({'main.isNative': true, tag: locale})
          .select(`_id identity moduleType ${paths.join(' ')}`)
          .exec();    
    
      default:
        return NumberSystem.findOne({'main.name': category, tag:locale})
          .select(`_id identity moduleType ${paths.join(' ')}`)
          .exec();
    }
  }

} 

export default new NumbersSystemsDAO();