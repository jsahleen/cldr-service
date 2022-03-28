import debug, { IDebugger } from 'debug';
import Zone from '../models/zones.model'
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IGenerate } from '../../common/interfaces/generate.interace';
import ProgressBar from 'progress';
import CLDRUTIL from '../../common/util/common.util';
import { IMetaZone, IZone, IZoneData, IZoneFormats } from '../interfaces/zones.interface';

import * as metaZoneData from 'cldr-core/supplemental/metaZones.json';

const log: IDebugger = debug('app:zones-generator');

const availableLocales: string[] = CLDRUTIL.getAvailableLocales();

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: availableLocales.length * 2})

interface IMetaZonesData {
  usesMetazone: {
    _mzone: string
    _from?: string
    _to?: string
  }
}

export default class ZonesGenerator implements IGenerate {
  constructor(){
    log('Created instance of ZonesGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'zones';

    log('Seeding zones modules...');
    if (Zone.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Zone.db.dropCollection(collection).catch(e => log(e.message));
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
    return `Zones: ${inserted} documents inserted.`;
  }

  private async insert(localeData: IZone[]): Promise<string[]> {
    const insertions = await Zone.insertMany(localeData);
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

  private getTimeZoneIdentifiers(data): string[] {
    const identifiers: string[] = [];
    const macroRegions = Object.keys(data);

    for (let i = 0; i < macroRegions.length; i++) {
      const macroRegion = macroRegions[i];
      const subEntries = Object.keys(data[macroRegion]);
      for (let j = 0; j < subEntries.length; j++) {
        const subEntry = subEntries[j];
        if (data[macroRegion][subEntry].exemplarCity || subEntry === 'UTC') {
          identifiers.push([macroRegion,subEntry].join('/'));
        } else {
          const subSubEntries = Object.keys(data[macroRegion][subEntry])
          for (let k = 0; k < subSubEntries.length; k++) {
            const subSubEntry = subSubEntries[k];
            identifiers.push([macroRegion, subEntry, subSubEntry].join('/'))
          }
        }
      }
    }

    return identifiers.flat(3);
  }

  private getFormats(formatsData): IZoneFormats {
    return {
      hour: formatsData.hourFormat,
      gmt: formatsData.gmtFormat,
      gmtZero: formatsData.gmtZeroFormat,
      fallback: formatsData.fallback,
      region: {
        generic: formatsData.regionFormat,
        standard: formatsData['regionFormat-type-standard'],
        daylight: formatsData['regionFormat-type-daylight']
      }
    }
  }

  private getMetaZones(metaZones: IMetaZonesData[]  = [], metaZoneNamesData = {}): IMetaZone[] {
    return metaZones.map(metaZone => {
      const identifier = metaZone.usesMetazone._mzone;
      return {
        identifier: metaZone.usesMetazone._mzone,
        from: metaZone.usesMetazone._from,
        to: metaZone.usesMetazone._to,
        displayNames: {
          long: metaZoneNamesData[identifier]?.long,
          short: metaZoneNamesData[identifier]?.short,
        },
        current: metaZone.usesMetazone._to ? false : true
      }
    })
  }

  private getMain(timeZonesNamesData, metaZoneData, identifier, locale): IZoneData {
    const [macro, sub, subSub] = identifier.split('/')
    const zoneNameData = subSub
    ? timeZonesNamesData.main[locale].dates.timeZoneNames.zone[macro][sub][subSub]
    : timeZonesNamesData.main[locale].dates.timeZoneNames.zone[macro][sub];
    const metaZones = subSub
    ? metaZoneData.supplemental.metaZones.metazoneInfo.timezone[macro][sub][subSub]
    : metaZoneData.supplemental.metaZones.metazoneInfo.timezone[macro][sub];
    const metaZoneNamesData = timeZonesNamesData.main[locale].dates.timeZoneNames.metazone;

    return {
      identifier: identifier,
      components: {
        macroRegion: macro,
        territory: subSub ? sub : undefined,
        exemplarCity: subSub ? subSub : sub
      },
      exemplarCityName: identifier === 'Etc/UTC' ? zoneNameData.short.standard : zoneNameData.exemplarCity,
      formats: this.getFormats(timeZonesNamesData.main[locale].dates.timeZoneNames),
      metaZones: this.getMetaZones(metaZones, metaZoneNamesData)
    };

  }

  async generateLocaleData(locale: string): Promise<IZone[]> {
    const timeZoneNamesData = CLDRUTIL.getLocaleData('dates', 'timeZoneNames', locale);
    const identifiers = this.getTimeZoneIdentifiers(timeZoneNamesData.main[locale].dates.timeZoneNames.zone);
    return identifiers. map(identifier => {
      return {
        tag: locale,
        identity: this.getIdentity(timeZoneNamesData, locale),
        moduleType: ModuleTypes.ZONES,
        main: this.getMain(timeZoneNamesData, metaZoneData, identifier, locale)
      }
    });
  }
}