import { IRelativeTime } from '../interfaces/time.interface';
import RelativeTime from "../models/time.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/time.dtos';
import debug, {IDebugger } from 'debug';
import { merge } from 'lodash';
import { availableFilters } from '../controllers/time.controller'

const log: IDebugger = debug('app:time-dao');

export const relativeTimeFormatTypes = [
  'standard',
  'short',
  'narrow'
];

class RelativeTimeDAO {

  constructor() {
    log('Created new instance of CurrenciesDAO');
  }

  async listRelativeTimeFormats(formatTypes: string[] = relativeTimeFormatTypes, locales: string[], filters: string[], limit, page): Promise<IRelativeTime[]> {
    const paths = filters.map(filter => {
      if (availableFilters.includes(filter)) {
        return formatTypes.map(type => {
          return `main.${filter}.${type}`;
        });            
      }
    }).flat();

    return RelativeTime
      .find({tag: { $in: locales }})
      .select(`tag _id identity moduleType main.code ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();
  } 

  async createRelativeTimeFormats(fields: ICreateDTO): Promise<string> {
    const relativeTimeFormats = new RelativeTime(fields);
    const system = await relativeTimeFormats.save();
    return system._id.toString();
  } 

  async getRelativeTimeFormatsById(id: string): Promise<IRelativeTime | null> {
    return  RelativeTime.findById(id).exec();
  }

  async updateRelativeTimeFormatsById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<IRelativeTime | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await RelativeTime.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return RelativeTime.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeRelativeTimeFormatsById(id: string): Promise<IRelativeTime | null> {
    return RelativeTime.findByIdAndRemove(id);
  }

  async listRelativeTimeFormatsByFormat(
    format: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<IRelativeTime[] | null> {
    const paths = filters.map(filter => {
      if (availableFilters.includes(filter)) {
        return `main.${filter}.${format}`;
      }
    });

    return RelativeTime
      .find({ tag: { $in: locales }})
      .select(`_id tag identity moduleType ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();
  }

  async getTags(): Promise<string[]> {
    return relativeTimeFormatTypes;
  }

  async getLocales(): Promise<string[]> {
    return RelativeTime.distinct('tag').exec();
  }

} 

export default new RelativeTimeDAO();