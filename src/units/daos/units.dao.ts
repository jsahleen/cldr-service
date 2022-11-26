import { IUnit } from '../interfaces/units.interface';
import Unit from "../models/units.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/units.dtos';
import { merge } from 'lodash';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:units-dao');

class VariantsDAO {

  constructor() {
    log('Created new instance of UnitsDAO');
  }

  async listUnits(tags: string[], locales: string[], filters: string[], limit, page): Promise<IUnit[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Unit
      .find({$and: [{tag: { $in: locales }},{'main.tag': tags}]})
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc', 'main.tag': 'asc'})
      .exec();
  } 

  async createUnit(fields: ICreateDTO): Promise<string> {
    const unit = new Unit(fields);
    const v = await unit.save();
    return v._id.toString();
  } 

  async getUnitById(id: string): Promise<IUnit | null> {
    return  Unit.findById(id).exec();
  }

  async updateUnitById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<IUnit | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Unit.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Unit.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeUnitById(id: string): Promise<IUnit | null> {
    return Unit.findByIdAndRemove(id);
  }

  async listUnitsByTagOrType(
    tag: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<IUnit[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Unit
      .find({$and: [{'main.tag': tag},{ tag: { $in: locales } }]})
      .select(`_id tag identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();    
  }

  async getTags(): Promise<string[]> {
    return Unit.distinct('main.tag').exec();
  }

  async getLocales(): Promise<string[]> {
    return Unit.distinct('tag').exec();
  }

} 

export default new VariantsDAO();