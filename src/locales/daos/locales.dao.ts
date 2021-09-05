import { ILocale } from '../interfaces/locales.interface';
import Locale from "../models/locales.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/locales.dtos';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:locales-dao');

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

class LocalesDTO {

  constructor() {
    log('Created new instance of LocalesDTO');
  }

  async listLocales(locales: string[], filters: string[], limit, page): Promise<ILocale[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    const query = Locale
      .find({ tag: { $in: locales } })
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'});
    
    if(filters.includes('language')){
      query.populate('main.language');
    }
    if(filters.includes('script')){
      query.populate('main.script');
    }
    if(filters.includes('territory')){
      query.populate('main.territory');
    }
    if(filters.includes('variant')){
      query.populate('main.variant');
    }
    return query.exec();
  } 

  async createLocale(fields: ICreateDTO): Promise<string> {
    const locale = new Locale(fields);
    const loc = await locale.save();
    return loc._id;
  } 

  async getLocaleById(id: string): Promise<ILocale | null> {
    return Locale.findById(id)
      .populate('main.language')
      .populate('main.script')
      .populate('main.territory')
      .populate('main.variant')
      .exec();
  }

  async updateLocaleById(id: string, fields: IPatchDTO | IPutDTO): Promise<void> {
    Locale.findByIdAndUpdate(id, fields, { new: true }).exec();
  }

  async removeLocaleById(id: string): Promise<void> {
    Locale.findByIdAndRemove(id);
  }

  async listLocalesByTagOrType(
    tag: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<ILocale[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    const query = Locale
      .find({$and: [{'main.tag': tag},{ tag: { $in: locales } }]})
      .select(`_id tag identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'});

    if(filters.includes('language')){
      query.populate('main.language');
    }
    if(filters.includes('script')){
      query.populate('main.script');
    }
    if(filters.includes('territory')){
      query.populate('main.territory');
    }
    if(filters.includes('variant')){
      query.populate('main.variant');
    }
    return query.exec();
  }

  async getLocaleTags(): Promise<string[]> {
    const results = await Locale.find().select('main.tag')
      .exec();
    return  results.map(result => {
      return result.main.tag;
    }).filter(onlyUnique);
  }

} 

export default new LocalesDTO();