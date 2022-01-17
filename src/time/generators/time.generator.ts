import debug, { IDebugger } from 'debug';
import RelativeTime from '../models/time.model';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IPluralKeys } from '../../common/interfaces/pluralkeys.interface';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { IRelativeTime, IRelativeTimeData, IRelativeTimeFormats, IRelativeTimeFields } from '../interfaces/time.interface';
import ProgressBar from 'progress';
import CLDRUTIL from '../../common/util/common.util';

const log: IDebugger = debug('app:relative-time-generator');

const availableLocales: string[] = CLDRUTIL.getAvailableLocales();

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: availableLocales.length * 2})

export default class RelativeTimeGenerator implements IGenerate {
  constructor(){
    log('Created instance of RelativeTimeGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'relativetimes';

    log('Seeding relative time modules...');
    if (RelativeTime.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await RelativeTime.db.dropCollection(collection).catch(e => log(e.message));
    }
    
    const results: string[][] = [];

    for (let i = 0; i < availableLocales.length; i++) {
      const locale = availableLocales[i];
      const data = await this.generateLocaleData(locale)
      bar.tick({
        module: collection,
        locale: locale,
        mode: 'generated'
      });
      results.push(await this.insert(data));  
      bar.tick({
        module: collection,
        locale: locale,
        mode: 'inserted'
      });
    }

    const inserted = results.reduce((acc, val) => acc.concat(val), []).length;
    return `Relative Time Formats: ${inserted} documents inserted.`;
  }

  private async insert(localeData: IRelativeTime[]): Promise<string[]> {
    const insertions = await RelativeTime.insertMany(localeData);
    return insertions.map(record => {
      return record._id;
    });
  }

  private getIdentity(data, locale): IIdentity {
    const identityData = data.main[locale].identity;

    return {
      language: identityData.language,
      script: identityData.script,
      territory: identityData.territory,
      variant: identityData.variant,
      versions: {
        cldr: identityData.version._cldrVersion,
        unicode: identityData.version._unicodeVersion
      }
    };
  }

  private getPlurals(data): IPluralKeys {
    return {
      zero: data['relativeTimePattern-count-zero'],
      one: data['relativeTimePattern-count-one'],
      two: data['relativeTimePattern-count-two'],
      few: data['relativeTimePattern-count-few'],
      many: data['relativeTimePattern-count-many'],
      other: data['relativeTimePattern-count-other']
    }
  }

  private getFormats(data): IRelativeTimeFields {
    return {
      displayName: data.displayName,
      altDisplayName: data['displayName-alt-variant'],
      previous1: data['relative-type--1'],
      previous2: data['relative-type--2'],
      current: data['relative-type-0'],
      next1: data['relative-type-1'],
      next2: data['relative-type-2'],
      past: data['relativeTime-type-past'] ? this.getPlurals(data['relativeTime-type-past']) : undefined,
      future: data['relativeTime-type-future'] ? this.getPlurals(data['relativeTime-type-future']): undefined
    }
  }
  
  private getRelativeTimeFormats(key: string, data): IRelativeTimeFormats {
    return {
      standard: this.getFormats(data[key]),
      short: this.getFormats(data[`${key}-short`]),
      narrow: this.getFormats(data[`${key}-narrow`])
    }
  }

  private getMain(fieldsData): IRelativeTimeData {
    return {
      era: this.getRelativeTimeFormats('era', fieldsData),
      year: this.getRelativeTimeFormats('year', fieldsData),
      quarter: this.getRelativeTimeFormats('quarter', fieldsData),
      month: this.getRelativeTimeFormats('month', fieldsData),
      week: this.getRelativeTimeFormats('week', fieldsData),
      weekOfMonth: this.getRelativeTimeFormats('weekOfMonth', fieldsData),
      day: this.getRelativeTimeFormats('day', fieldsData),
      dayOfYear: this.getRelativeTimeFormats('dayOfYear', fieldsData),
      weekday: this.getRelativeTimeFormats('weekday', fieldsData),
      weekdayOfMonth: this.getRelativeTimeFormats('weekdayOfMonth', fieldsData),
      sun: this.getRelativeTimeFormats('sun', fieldsData),
      mon: this.getRelativeTimeFormats('mon', fieldsData),
      tue: this.getRelativeTimeFormats('tue', fieldsData),
      wed: this.getRelativeTimeFormats('wed', fieldsData),
      thu: this.getRelativeTimeFormats('thu', fieldsData),
      fri: this.getRelativeTimeFormats('fri', fieldsData),
      sat: this.getRelativeTimeFormats('sat', fieldsData),
      dayPeriod: this.getRelativeTimeFormats('dayperiod', fieldsData),
      hour: this.getRelativeTimeFormats('hour', fieldsData),
      minute: this.getRelativeTimeFormats('minute', fieldsData),
      second: this.getRelativeTimeFormats('second', fieldsData),
      zone: this.getRelativeTimeFormats('zone', fieldsData),
    };
  }

  async generateLocaleData(locale: string): Promise<IRelativeTime[]> {
    const dateFieldsData = CLDRUTIL.getLocaleData('dates', 'dateFields', locale);
    const fieldsData = dateFieldsData.main[locale].dates.fields;
    return [{
        tag: locale,
        identity: this.getIdentity(dateFieldsData, locale),
        moduleType: ModuleTypes.TIME,
        main: this.getMain(fieldsData)
    }];
  }
}