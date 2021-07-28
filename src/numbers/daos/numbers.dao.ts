import { INumberSystem } from '../interfaces/numbers.interface';
import NumberSystem from "../models/numbers.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/numbers.dtos';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:numbersystem-dao');

class NumbersSystemsDAO {

  constructor() {
    log('Created new instance of NumberSystemsDAO');
  }

  async listNumberSystems(locales: string[], filters: string[]): Promise<INumberSystem[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return NumberSystem
      .find({ tag: { $in: locales } })
      .select(`tag _id identity moduleType ${paths.join(' ')}`)
      .sort({tag: 'asc'})
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

  async listNumberSystemsByNameOrType(system: string, locales: string[], filters: string[]): Promise<INumberSystem[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    switch (system) {
      case 'default':
        return NumberSystem
          .find({$and: [{'main.isDefault': true},{ tag: { $in: locales } }]})
          .select(`tag _id identity moduleType ${paths.join(' ')}`)
          .sort({tag: 'asc'})
          .exec();    
    
      case 'native':
        return NumberSystem.find({$and: [{'main.isDefault': true},{ tag: { $in: locales } }]})
          .select(`tag _id identity moduleType ${paths.join(' ')}`)
          .sort({tag: 'asc'})
          .exec();    
    
      default:
        return NumberSystem.find({$and: [{'main.name': system},{ tag: { $in: locales } }]})
          .select(`_id tag identity moduleType ${paths.join(' ')}`)
          .sort({tag: 'asc'})
          .exec();
    }
    
  }

} 

export default new NumbersSystemsDAO();