import { IScript } from '../interfaces/scripts.interface';
import Script from "../models/scripts.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/scripts.dtos';
import { merge } from 'lodash';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:scripts-dao');

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

class ScriptsDAO {

  constructor() {
    log('Created new instance of ScriptsDAO');
  }

  async listScripts(tags: string[], locales: string[], filters: string[], limit, page): Promise<IScript[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Script
      .find({$and: [{tag: { $in: locales }},{'main.tag': tags}]})
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc', 'main.tag': 'asc'})
      .exec();
  } 

  async createScript(fields: ICreateDTO): Promise<string> {
    const script = new Script(fields);
    const scr = await script.save();
    return scr._id;
  } 

  async getScriptById(id: string): Promise<IScript | null> {
    return  Script.findById(id).exec();
  }

  async updateScriptById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<IScript | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Script.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Script.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeScriptById(id: string): Promise<void> {
    Script.findByIdAndRemove(id);
  }

  async listScriptsByTagOrType(
    tag: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<IScript[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Script
      .find({$and: [{'main.tag': tag},{ tag: { $in: locales } }]})
      .select(`_id tag identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();    
  }

  async getTags(): Promise<string[]> {
    const results = await Script.find().select('main.tag').exec();
    return  results.map(result => {
      return result.main.tag;
    }).filter(onlyUnique);
  }

  async getLocales(): Promise<string[]> {
    const results = await Script.find().select('tag').exec();
    return  results.map(result => {
      return result.tag;
    }).filter(onlyUnique);
  }

} 

export default new ScriptsDAO();