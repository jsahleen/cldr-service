import { ITerritory } from '../interfaces/territories.interface';
import Territory from "../models/territories.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/territories.dtos';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:territories-dao');

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

class TerritoriesDAO {

  constructor() {
    log('Created new instance of TerritoriesDAO');
  }

  async listTerritories(locales: string[], filters: string[], limit, page): Promise<ITerritory[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Territory
      .find({ tag: { $in: locales } })
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
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

  async updateTerritoryById(id: string, fields: IPatchDTO | IPutDTO): Promise<void> {
    Territory.findByIdAndUpdate(id, fields, { new: true }).exec();
  }

  async removeTerritoryById(id: string): Promise<void> {
    Territory.findByIdAndRemove(id);
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

  async getTerritoryTags(): Promise<string[]> {
    const results = await Territory.find().select('main.tag').exec();
    return  results.map(result => {
      return result.main.tag;
    }).filter(onlyUnique);
  }

} 

export default new TerritoriesDAO();