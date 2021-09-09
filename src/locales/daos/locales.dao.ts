import { ILocale } from '../interfaces/locales.interface';
import Locale from "../models/locales.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/locales.dtos';
import debug, {IDebugger } from 'debug';
import languagesModel from '../../languages/models/languages.model';
import * as bcp47 from 'bcp47';
import scriptsModel from '../../scripts/models/scripts.model';
import territoriesModel from '../../territories/models/territories.model';
import variantsModel from '../../variants/models/variants.model';

const log: IDebugger = debug('app:locales-dao');

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

class LocalesDAO {

  constructor() {
    log('Created new instance of LocalesDAO');
  }

  async listLocales(tags: string[], locales: string[], filters: string[], limit, page): Promise<ILocale[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    const localeDocs = await Locale
      .find({$and: [{tag: { $in: locales }}, {'main.tag': {$in: tags}}]})
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc', 'main.tag': 'asc'})
      .exec();

    return Promise.all(localeDocs.map(async doc => {
      const parsed = bcp47.parse(doc.main.tag);

      const langTag = parsed.langtag.language.language;
      const scriptTag = parsed.langtag.script;
      const territoryTag = parsed.langtag.region;
      const variantTag = parsed.langtag.variant[0];

      if (filters.includes('language') && langTag) {
        const languageDoc = await languagesModel.findOne({$and: [{'main.tag': langTag},{tag: doc.tag}]});
        doc.main.language = languageDoc?.main;
      }

      if (filters.includes('script') && scriptTag) {
        const scriptDoc = await scriptsModel.findOne({$and: [{'main.tag': scriptTag},{tag: doc.tag}]});
        doc.main.script = scriptDoc?.main;
      }

      if (filters.includes('territory') && territoryTag) {
        const territoryDoc = await territoriesModel.findOne({$and: [{'main.tag': territoryTag},{tag: doc.tag}]});
        doc.main.territory = territoryDoc?.main;
      }

      if (filters.includes('variant') && variantTag) {
        const variantDoc = await variantsModel.findOne({$and: [{'main.tag': variantTag},{tag: doc.tag}]});
        doc.main.variant = variantDoc?.main;
      }

      return doc;

    })).then(arr => {
      return arr.flat();
    });

  } 

  async createLocale(fields: ICreateDTO): Promise<string> {
    const locale = new Locale(fields);
    const loc = await locale.save();
    return loc._id;
  } 

  async getLocaleById(id: string): Promise<ILocale | null> {
    return Locale.findById(id).exec();
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

    const localeDocs = await Locale
      .find({$and: [{tag: { $in: locales }, 'main.tag': tag}]})
      .select(`_id tag identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc', 'main.tag': 'asc'})
      .exec();

    return Promise.all(localeDocs.map(async doc => {
      doc.main.tag = tag;
      const parsed = bcp47.parse(tag)
      const langTag = parsed.langtag.language.language;
      const scriptTag = parsed.langtag.script;
      const territoryTag = parsed.langtag.territory;
      const variantTag = parsed.langtag.variant[0];

      if (filters.includes('language') && langTag) {
        const languageDoc = await languagesModel.findOne({$and: [{'main.tag': langTag},{tag: doc.tag}]});
        doc.main.language = languageDoc?.main;
      }

      if (filters.includes('script') && scriptTag) {
        const scriptDoc = await scriptsModel.findOne({$and: [{'main.tag': scriptTag},{tag: doc.tag}]});
        doc.main.script = scriptDoc?.main;
      }

      if (filters.includes('territory') && territoryTag) {
        const territoryDoc = await territoriesModel.findOne({$and: [{'main.tag': territoryTag},{tag: doc.tag}]});
        doc.main.territory = territoryDoc?.main;
      }

      if (filters.includes('variant') && variantTag) {
        const variantDoc = await variantsModel.findOne({$and: [{'main.tag': variantTag},{tag: doc.tag}]});
        doc.main.variant = variantDoc?.main;
      }

      return doc;
    }));
  }

  async getLocaleTags(): Promise<string[]> {
    const results = await Locale.find().select('main.tag')
      .exec();
    return  results.map(result => {
      return result.main.tag;
    }).filter(onlyUnique);
  }

} 

export default new LocalesDAO();