import { IZone } from '../interfaces/zones.interface';
import Zone from "../models/zones.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/zones.dtos';
import debug, {IDebugger } from 'debug';
import { merge } from 'lodash';

const log: IDebugger = debug('app:zones-dao');

class ZoneDAO {

  constructor() {
    log('Created new instance of ZonesDAO');
  }

  async listZones(zones: string[], locales: string[], filters: string[], limit, page): Promise<IZone[]> {

    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Zone
      .find({$and: [{tag: { $in: locales }}, {'main.identifier': { $in: zones}}]})
      .select(`tag _id identity moduleType main.identifier ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();
  } 

  async createZone(fields: ICreateDTO): Promise<string> {
    const zone = new Zone(fields);
    const system = await zone.save();
    return system._id;
  } 

  async getZoneById(id: string): Promise<IZone | null> {
    return  Zone.findById(id).exec();
  }

  async updateZoneById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<IZone | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Zone.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Zone.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeZoneById(id: string): Promise<IZone | null> {
    return Zone.findByIdAndRemove(id);
  }

  async listZoneByIdentifier(
    identifier: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<IZone[] | null> {

    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Zone
      .find( { $and: [ { tag: { $in: locales } } , { 'main.identifier': identifier } ] } )
      .select(`_id tag identity moduleType main.identifier ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();
  }

  async getTags(): Promise<string[]> {
    return Zone.distinct('main.identifier').exec();
  }

  async getLocales(): Promise<string[]> {
    return Zone.distinct('tag').exec();
  }

} 

export default new ZoneDAO();