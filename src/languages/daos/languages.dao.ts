import { ILanguage } from '../interfaces/languages.interface';
import Language from "../models/languages.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/languages.dtos';
import { merge } from 'lodash';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:languages-dao');

class LanguageDAO {

  constructor() {
    log('Created new instance of LanguagesDAO');
  }

  async listLanguages(tags: string[], locales: string[], filters: string[], limit, page): Promise<ILanguage[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Language
      .find({$and: [{tag: { $in: locales }},{'main.tag': tags}]})
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc', 'main.tag': 'asc'})
      .exec();
  } 

  async createLanguage(fields: ICreateDTO): Promise<string> {
    const language = new Language(fields);
    const lang = await language.save();
    return lang._id;
  } 

  async getLanguageById(id: string): Promise<ILanguage | null> {
    return  Language.findById(id).exec();
  }

  async updateLanguageById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<ILanguage | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Language.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Language.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeLanguageById(id: string): Promise<ILanguage | null> {
    return Language.findByIdAndRemove(id);
  }

  async listLanguagesByTagOrFamily(
    tag: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<ILanguage[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Language
      .find({$and: [{'main.tag': tag},{ tag: { $in: locales } }]})
      .select(`_id tag identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();    
  }

  async getTags(): Promise<string[]> {
    return Language.distinct('main.tag').exec();
  }

  async getLocales(): Promise<string[]> {
    return Language.distinct('tag').exec();
  }

} 

export default new LanguageDAO();