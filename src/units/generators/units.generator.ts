import debug, { IDebugger } from 'debug';
import Unit from '../models/units.model'
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IGenerate } from '../../common/interfaces/generate.interace';
import { IUnit, IUnitCoordinatePatterns, IUnitCoordinatePatternSets, IUnitData, IUnitDisplayNames, IUnitPatterns, IUnitPer, IUnitPluralPatternSets, IUnitPower2, IUnitPrefixPatterns, IUnitPrefixPatternSets, IUnitSubtags, IUnitTimes } from '../interfaces/units.interface';
import ProgressBar from 'progress';
import CLDRUTIL from '../../common/util/common.util';
import { stringify } from 'querystring';
import { listenerCount } from 'process';
import { IPluralKeys } from '../../common/interfaces/pluralkeys.interface';
import { PathWithTypePropertyBaseType } from 'mongoose/types/inferschematype';

const log: IDebugger = debug('app:units-generator');

const availableLocales: string[] = CLDRUTIL.getAvailableLocales();

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: availableLocales.length * 2})

enum STYLES {
  LONG = 'long',
  SHORT = 'short',
  NARROW = 'narrow'
}

enum POWERS {
  p2 = 'power2',
  p3 = 'power3'
}

export default class UnitsGenerator implements IGenerate {
  constructor(){
    log('Created instance of UnitsGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'units';

    log('Seeding units modules...');
    if (Unit.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Unit.db.dropCollection(collection).catch(e => log(e.message));
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
    return `Units: ${inserted} documents inserted.`;
  }

  private async insert(localeData: IUnit[]): Promise<string[]> {
    const insertions = await Unit.insertMany(localeData);
    return insertions.map(record => {
      return record._id.toString();
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

  private getUnitTags(data): string[] {
    return Object.keys(data.long).filter(tag => {
      if ( 
        tag !== 'per' &&
        tag !== 'times' &&
        tag !== 'coordinateUnit' &&
        tag !== 'power2' &&
        tag !== 'power3' &&
        tag !== 'duration-day-person' &&
        !tag.startsWith('10')
      ) {
        return true;
      } else {
        return false;
      }
    })
  }

  private getUnitDisplayNames(data: any, tag: string): IUnitDisplayNames {
    return {
      long: data.long[tag]?.displayName,
      short: data.short[tag]?.displayName,
      narrow: data.narrow[tag]?.displayName
    };
  }

  private getUnitSubtags(data: any, tag: string): IUnitSubtags | void {
    const unitTags = this.getUnitTags(data);
    if(unitTags.includes(tag)) {
      const segments = tag.split('-');
      const category = segments.shift() || 'unknown';
      const unit = segments.join('-');
      return {category, unit};
    } else {
      return 
    }
  }

  private getUnitGender(data, tag): string {
    return data[STYLES.LONG][tag].gender;
  }

  private getUnitPrefixPatterns(data: any, style: STYLES): IUnitPrefixPatterns {
    const tags = Object.keys(data[style]).filter(key => key.startsWith('10'));
    const map: Record<keyof IUnitPrefixPatterns, string> = tags.map(tag => {
      const val: string = data[style][tag].unitPrefixPattern || "";  
      const output: Record<string, string> = {};
      output[tag] = val;
      return output;
    }).reduce((previous, current, index) => {
      return Object.assign({}, previous, current);
    });

    return map;
  }

  private getUnitPrefixPatternSets(data: any, tag: string): IUnitPrefixPatternSets {
    return {
      long: this.getUnitPrefixPatterns(data, STYLES.LONG),
      short: this.getUnitPrefixPatterns(data, STYLES.SHORT),
      narrow: this.getUnitPrefixPatterns(data, STYLES.NARROW),
    }

  }

  private getUnitPerPatterns(data: any): IUnitPer {
    return {
      long: data[STYLES.LONG].per.compoundUnitPattern,
      short: data[STYLES.SHORT].per.compoundUnitPattern,
      narrow: data[STYLES.NARROW].per.compoundUnitPattern
    };
  }

  private getUnitTimesPatterns(data: any): IUnitTimes {
    return {
      long: data[STYLES.LONG].times.compoundUnitPattern,
      short: data[STYLES.SHORT].times.compoundUnitPattern,
      narrow: data[STYLES.NARROW].times.compoundUnitPattern
    };
  }

  private getPowerPatterns(data, gender: string, p: POWERS, style: STYLES): IPluralKeys {
    return {
      zero: gender === 'feminine' 
        ? data[style][p]['compoundUnitPattern1-gender-feminine-cout-zero'] 
        : data[style][p]['compoundUnitPattern1-count-zero'],
      one: gender === 'feminine' 
        ? data[style][p]['compoundUnitPattern1-gender-feminine-cout-one'] 
        : data[style][p]['compoundUnitPattern1-count-one'],
      two: gender === 'feminine' 
        ? data[style][p]['compoundUnitPattern1-gender-feminine-cout-two'] 
        : data[style][p]['compoundUnitPattern1-count-two'],
      few: gender === 'feminine' 
        ? data[style][p]['compoundUnitPattern1-gender-feminine-cout-few'] 
        : data[style][p]['compoundUnitPattern1-count-few'],
      many: gender === 'feminine' 
        ? data[style][p]['compoundUnitPattern1-gender-feminine-cout-many'] 
        : data[style][p]['compoundUnitPattern1-count-many'],
      other: gender === 'feminine' 
        ? data[style][p]['compoundUnitPattern1-gender-feminine-cout-other'] 
        : data[style][p]['compoundUnitPattern1-count-other'],
    }
  }

  private getPower2PatternSets(data, tag): IUnitPower2 {
    const g = this.getUnitGender(data, tag);
    return {
      long: this.getPowerPatterns(data, g, POWERS.p2, STYLES.LONG),
      short: this.getPowerPatterns(data, g, POWERS.p2, STYLES.SHORT),
      narrow: this.getPowerPatterns(data, g, POWERS.p2, STYLES.NARROW),
    };
  }

  private getPower3PatternSets(data, tag): IUnitPower2 {
    const g = this.getUnitGender(data, tag);
    return {
      long: this.getPowerPatterns(data, g, POWERS.p3, STYLES.LONG),
      short: this.getPowerPatterns(data, g, POWERS.p3, STYLES.SHORT),
      narrow: this.getPowerPatterns(data, g, POWERS.p3, STYLES.NARROW),
    };
  }

  private getCoordinatePatterns(data, style): IUnitCoordinatePatterns {
    return {
      displayName: data[style].coordinateUnit.displayName,
      north: data[style].coordinateUnit.north,
      south: data[style].coordinateUnit.south,
      east: data[style].coordinateUnit.east,
      west: data[style].coordinateUnit.west,
    }
  }

  private getCoordinatePatternSets(data): IUnitCoordinatePatternSets {
    return {
      long: this.getCoordinatePatterns(data, STYLES.LONG),
      short: this.getCoordinatePatterns(data, STYLES.SHORT),
      narrow: this.getCoordinatePatterns(data, STYLES.NARROW)
    };
  }

  private getUnitPluralPattern(data, tag, style): IPluralKeys {
    tag = tag === 'duration-day-person' ? 'duration-day': tag;
    return {
      zero: data[style][tag] && data[style][tag]['unitPattern-count-zero'],
      one: data[style][tag] && data[style][tag]['unitPattern-count-one'],
      two: data[style][tag] && data[style][tag]['unitPattern-count-two'],
      few: data[style][tag] && data[style][tag]['unitPattern-count-few'],
      many: data[style][tag] && data[style][tag]['unitPattern-count-many'],
      other: data[style][tag] && data[style][tag]['unitPattern-count-other'],
    }
  }

  private getUnitPluralPatternSets(data, tag): IUnitPluralPatternSets {
    return {
      long: this.getUnitPluralPattern(data, tag, STYLES.LONG),
      short: this.getUnitPluralPattern(data, tag, STYLES.SHORT),
      narrow: this.getUnitPluralPattern(data, tag, STYLES.NARROW),
    }
  }

  private getUnitPatterns(data: any, tag: string): IUnitPatterns {
    return {
      prefixes: this.getUnitPrefixPatternSets(data, tag),
      per: this.getUnitPerPatterns(data),
      times: this.getUnitTimesPatterns(data),
      power2: this.getPower2PatternSets(data, tag),
      power3: this.getPower3PatternSets(data, tag),
      coordinates: this.getCoordinatePatternSets(data),
      plurals: this.getUnitPluralPatternSets(data, tag)
    }
  } 

  private getUnitTag(unit: string): string {
    return unit;
  }

  private getMain(data, unit): IUnitData {
    return {
      tag: this.getUnitTag(unit),
      subtags: this.getUnitSubtags(data, unit),
      gender: this.getUnitGender(data, unit),
      displayNames: this.getUnitDisplayNames(data, unit),
      patterns: this.getUnitPatterns(data, unit)
    }
  }

  async generateLocaleData(locale: string): Promise<IUnit[]> {
    const unitsData = CLDRUTIL.getLocaleData('units', 'units', locale);        
    const data = unitsData.main[locale].units;
    const units = this.getUnitTags(data);

    const output: IUnit[] = units.map(unit => {
      return {
        tag: locale,
        identity: this.getIdentity(unitsData, locale),
        moduleType: ModuleTypes.UNITS,
        main: this.getMain(data, unit)
      }
    });
    return output;
  }
}