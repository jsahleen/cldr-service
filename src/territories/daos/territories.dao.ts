import { ITerritory } from '../interfaces/territories.interface';
import Territory from "../models/territories.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/territories.dtos';
import { merge } from 'lodash';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:territories-dao');

class TerritoriesDAO {

  constructor() {
    log('Created new instance of TerritoriesDAO');
  }

  async listTerritories(tags: string[], locales: string[], filters: string[], limit, page): Promise<ITerritory[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Territory
      .find({$and: [{tag: { $in: locales }},{'main.tag': tags}]})
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc', 'main.tag': 'asc'})
      .exec();
  } 

  async createTerritory(fields: ICreateDTO): Promise<string> {
    const territory = new Territory(fields);
    const terr = await territory.save();
    return terr._id;
  } 

  async getTerritoryById(id: string): Promise<ITerritory | null> {
    return  Territory.findById(id).exec();
  }

  async updateTerritoryById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<ITerritory | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Territory.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Territory.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeTerritoryById(id: string): Promise<ITerritory | null> {
    return Territory.findByIdAndRemove(id);
  }

  async listTerritoriesByTagOrType(
    tag: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<ITerritory[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Territory
      .find({$and: [{'main.tag': tag},{ tag: { $in: locales } }]})
      .select(`_id tag identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();    
  }

  async getTags(): Promise<string[]> {
    return Territory.distinct('main.tag').exec();
  }

  async getLocales(): Promise<string[]> {
    return Territory.distinct('tag').exec();
  }

} 

export default new TerritoriesDAO();