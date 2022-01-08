import { ILocale } from '../interfaces/locales.interface';
import Locale from "../models/locales.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/locales.dtos';
import { merge } from 'lodash';
import debug, {IDebugger } from 'debug';
import languagesModel from '../../languages/models/languages.model';
import * as bcp47 from 'bcp47';
import scriptsModel from '../../scripts/models/scripts.model';
import territoriesModel from '../../territories/models/territories.model';
import variantsModel from '../../variants/models/variants.model';

import CLDRUtil from '../../common/util/common.util';

const availableLocales = CLDRUtil.getAvailableLocales();

import likelySubtagsData from 'cldr-core/supplemental/likelySubtags.json';
import parentLocalesData from 'cldr-core/supplemental/parentLocales.json';

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
      .find({tag: { $in: locales }})
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit / tags.length)
      .skip(((page - 1) * (limit / tags.length)))
      .sort({tag: 'asc'})
      .exec();

    return Promise.all(localeDocs.map(async doc => {
      return Promise.all(tags.map(async tag => {
        const cDoc = JSON.parse(JSON.stringify(doc)); // makes a copy of the doc

        const parsed = bcp47.parse(tag);

        const langTag = parsed.langtag.language.language;
        const scriptTag = parsed.langtag.script;
        const territoryTag = parsed.langtag.region;
        const variantTags = parsed.langtag.variant;

        if (filters.includes('language') && langTag) {
          const languageDoc = await languagesModel.findOne({$and: [{'main.tag': langTag},{tag: cDoc.tag}]});
          cDoc.main.language = languageDoc?.main;
        }

        if (filters.includes('script') && scriptTag) {
          const scriptDoc = await scriptsModel.findOne({$and: [{'main.tag': scriptTag},{tag: cDoc.tag}]});
          cDoc.main.script = scriptDoc?.main;
        }

        if (filters.includes('territory') && territoryTag) {
          const territoryDoc = await territoriesModel.findOne({$and: [{'main.tag': territoryTag},{tag: cDoc.tag}]});
          cDoc.main.territory = territoryDoc?.main;
        }

        if (filters.includes('variants') && variantTags) {
          const variantDocs = await variantsModel.find({$and: [{'main.tag': {$in: variantTags}},{tag: cDoc.tag}]});
          cDoc.main.variants = variantDocs?.map(vDoc => vDoc.main);
        }

        cDoc.main.tag = tag;
        cDoc.main.parentLocale = this.getParentLocale(tag);
        cDoc.main.likelySubtags = this.getLikelySubtags(tag);

        return cDoc;

      }));
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

  async updateLocaleById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<ILocale | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Locale.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Locale.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeLocaleById(id: string): Promise<ILocale | null> {
    return Locale.findByIdAndRemove(id);
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
      .find({tag: { $in: locales }})
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();

    return Promise.all(localeDocs.map(async doc => {
      const parsed = bcp47.parse(tag)
      const langTag = parsed.langtag.language.language;
      const scriptTag = parsed.langtag.script;
      const territoryTag = parsed.langtag.region;
      const variantTags = parsed.langtag.variant;

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

      if (filters.includes('variants') && variantTags) {
        const variantDocs = await variantsModel.find({$and: [{'main.tag': {$in: variantTags}},{tag: doc.tag}]});
        doc.main.variants = variantDocs?.map(vDoc => vDoc.main);
      }

      return doc;
    }));
  }

  async getTags(): Promise<string[]> {
    return availableLocales;
  }

  async getLocales(): Promise<string[]> {
    const results = await Locale.find().select('tag').exec();
    return  results.map(result => {
      return result.tag;
    }).filter(onlyUnique);
  }

  private getLikelySubtags(tag) {
    let lst = likelySubtagsData.supplemental.likelySubtags[tag];

    if (!lst) {
      const parsed = bcp47.parse(tag);
      const language = parsed.langtag.language.language;
      let script = parsed.langtag.script;
      let territory = parsed.langtag.region;

      const lst2 = likelySubtagsData.supplemental.likelySubtags[language];
      
      if (!script) {
        script = bcp47.parse(lst2).langtag.script;
      }

      if (!territory) {
        territory = bcp47.parse(lst2).langtag.region;
      }

      lst = [language, script, territory].join('-');
    }

    return lst;
  }

  private getParentLocale(tag): string {
    let pLocale = parentLocalesData.supplemental.parentLocales.parentLocale[tag];
    if (!pLocale) {
      const likelySubtags = this.getLikelySubtags(tag).split('-') || [];
      while (likelySubtags.length > 0) {
        const candidate = likelySubtags.join('-');
        if (parentLocalesData.supplemental.parentLocales.parentLocale[candidate]) {
          pLocale = parentLocalesData.supplemental.parentLocales.parentLocale[candidate];
          break;
        }
        likelySubtags.pop();
      }
    }
    return pLocale || CLDRUtil.rootLocale;
  }

} 

export default new LocalesDAO();