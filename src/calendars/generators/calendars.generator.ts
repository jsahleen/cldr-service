import debug, { IDebugger } from 'debug';
import Calendar from '../../calendars/models/calendars.model';
import { IIdentity } from '../../common/interfaces/identity.interface';
import { ModuleTypes } from '../../common/enums/module.enum';
import { IGenerate } from '../../common/interfaces/generate.interace';
import ProgressBar from 'progress';
import CLDRUTIL from '../../common/util/common.util';
import * as bcp47 from 'bcp47';
import { IAppendItems, IAvailableFormats, ICalendar, ICalendarData, ICalendarFormats,
  ICalendarNames, ICalendarPatterns, ICalendarSkeletons, ICyclical, IDayPeriods, IDays, IEraNames, IEras, IFormats,
  IIntervals, IMonths, IQuarters, ISkeletons } from '../interfaces/calendars.interface';

const log: IDebugger = debug('app:currency-generator');

const availableLocales: string[] = CLDRUTIL.getAvailableLocales();

const bar = new ProgressBar(':module: :locale :mode :current/:total', { total: availableLocales.length * 2})

import calendarPreferenceData from 'cldr-core/supplemental/calendarPreferenceData.json';
import calendarData from 'cldr-core/supplemental/calendarData.json';

const preferredCalendars = calendarPreferenceData.supplemental.calendarPreferenceData;
const calendarInfo = calendarData.supplemental.calendarData;

export default class CalendarGenerator implements IGenerate {
  constructor(){
    log('Created instance of CalendarGenerator');
  }

  public async generate(): Promise<string> {
    const collection = 'calendars';

    log('Seeding calendar modules...');
    if (Calendar.db.collections[collection]) {
      log(`Dropping collection ${collection}`);
      await Calendar.db.dropCollection(collection).catch(e => log(e.message));
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
    return `Calendar: ${inserted} documents inserted.`;
  }

  private async insert(localeData: ICalendar[]): Promise<string[]> {
    const insertions = await Calendar.insertMany(localeData);
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

  private getCyclicalNames(calendarData, calendar, locale): ICyclical | undefined {
    const cyclicalData = calendarData.main[locale].dates.calendars[calendar].cyclicNameSets;
    if (!cyclicalData) {
      return undefined;
    }
    return {
      dayParts: { format: cyclicalData.dayParts.format },
      years: { format: cyclicalData.years.format },
      months: { format: cyclicalData.months.format },
      days: { format: cyclicalData.days.format },
      solarTerms: { format: cyclicalData.solarTerms.format },
      zodiacs: { format: cyclicalData.zodiacs.format }
    };
  }

  private getDayPeriodNames(calendarData, calendar, locale): IDayPeriods {
    const dayPeriodNamesData = calendarData.main[locale].dates.calendars[calendar].dayPeriods;
    return {
      format: dayPeriodNamesData.format,
      standAlone: dayPeriodNamesData['stand-alone']
    }
  }

  private getDayNames(calendarData, calendar, locale): IDays {
    const daysData = calendarData.main[locale].dates.calendars[calendar].days;
    return {
      format: daysData.format,
      standAlone: daysData['stand-alone']
    }
  }

  private getMonthNames(calendarData, calendar, locale): IMonths {
    const monthsData = calendarData.main[locale].dates.calendars[calendar].months;
    return {
      format: monthsData.format,
      standAlone: monthsData['stand-alone']
    }
  }

  private getQuarterNames(calendarData, calendar, locale): IQuarters {
    const quartersData = calendarData.main[locale].dates.calendars[calendar].quarters;
    return {
      format: quartersData.format,
      standAlone: quartersData['stand-alone']
    }
  }

  private getEraNames(calendarData, calendar, locale): IEras | undefined {
    const erasData = calendarData.main[locale].dates.calendars[calendar].eras;
    const erasInfo = calendarInfo[calendar].eras;

    if (!erasData) {
      return undefined;
    }

    const output = Object.keys(erasData.eraNames).map(key => {
      if(key.endsWith('-alt-variant')) {
        return {};
      }

      const standardNames: IEraNames = {
        wide: erasData.eraNames[key],
        abbreviated: erasData.eraAbbr[key],
        narrow: erasData.eraNarrow[key]
      };

      const altKey = `${key}-alt-variant`;

      let altNames: IEraNames | undefined;
      if(Object.keys(erasData.eraNames).includes(altKey)) {
        altNames = {
          wide: erasData.eraNames[altKey],
          abbreviated: erasData.eraAbbr[altKey],
          narrow: erasData.eraNarrow[altKey]
        }
      }

      let start, end;
      if (erasInfo && erasInfo[key]) {
        start = erasInfo[key]._start;
        end = erasInfo[key]._end;
      }

      const entry = {
        names: {
          standard: standardNames,
          alt: altNames
        },
        start: start,
        end: end
      };

      const tmp = {
        [key]: entry
      }
      
      return tmp;
    });

    return Object.assign({}, ...output);
    
  }

  private getNames(calendarData, calendar, locale): ICalendarNames {
    return {
      dayPeriods: this.getDayPeriodNames(calendarData, calendar, locale),
      days: this.getDayNames(calendarData, calendar, locale),
      months: this.getMonthNames(calendarData, calendar, locale),
      quarters: this.getQuarterNames(calendarData, calendar, locale),
      eras: this.getEraNames(calendarData, calendar, locale),
      cyclical: this.getCyclicalNames(calendarData, calendar, locale)
    }
  }

  private getDateFormats(calendarData, calendar, locale): IFormats {
    const formats = calendarData.main[locale].dates.calendars[calendar].dateFormats;
    return {
      full: typeof formats.full !== 'string' ? formats.full._value : formats.full,
      long: typeof formats.long !== 'string' ? formats.full._value : formats.long,
      medium: typeof formats.medium !== 'string' ? formats.full._value : formats.medium ,
      short: typeof formats.short !== 'string' ? formats.full._value : formats.short
    }
  }

  private getTimeFormats(calendarData, calendar, locale): IFormats {
    return calendarData.main[locale].dates.calendars[calendar].timeFormats;
  }

  private getJoinFormats(calendarData, calendar, locale): IFormats {
    return {
      full: calendarData.main[locale].dates.calendars[calendar].dateTimeFormats.full,
      long: calendarData.main[locale].dates.calendars[calendar].dateTimeFormats.long,
      medium: calendarData.main[locale].dates.calendars[calendar].dateTimeFormats.medium,
      short: calendarData.main[locale].dates.calendars[calendar].dateTimeFormats.short,
    }
  }

  private getAvailableFormats(calendarData, calendar, locale): IAvailableFormats {
    return calendarData.main[locale].dates.calendars[calendar].dateTimeFormats.availableFormats;
  }

  private getAppendItems(calendarData, calendar, locale): IAppendItems {
    return calendarData.main[locale].dates.calendars[calendar].dateTimeFormats.appendItems;
  }

  private getIntervalFormats(calendarData, calendar, locale): IIntervals {
    const data = calendarData.main[locale].dates.calendars[calendar].dateTimeFormats.intervalFormats;
    const fallback = data.intervalFormatFallback;
    const clone = Object.assign({}, data);
    delete clone.intervalFormatFallback;
    return {
      fallback: fallback,
      formats: clone
    }
  }

  private getCalendarFormats(calendarData, calendar, locale): ICalendarFormats {
    return {
      date: this.getDateFormats(calendarData, calendar, locale),
      time: this.getTimeFormats(calendarData, calendar, locale),
      join: this.getJoinFormats(calendarData, calendar, locale),
      available: this.getAvailableFormats(calendarData, calendar, locale),
      appendItems: this.getAppendItems(calendarData, calendar, locale),
      intervals: this.getIntervalFormats(calendarData, calendar, locale)
    };
  }

  private getCalendarPatterns(calendarData, calendar, locale): ICalendarPatterns | undefined {
    const patternsData = calendarData.main[locale].dates.calendars[calendar].monthPatterns;
    if (!patternsData) {
      return undefined;
    }
    return {
      months: {
        format: patternsData.format,
        standAlone: patternsData['stand-alone'],
        numeric: patternsData.numeric
      }
    };
  }

  private getDateSkeletons(calendarData, calendar, locale): ISkeletons {
    const skeletons = calendarData.main[locale].dates.calendars[calendar].dateSkeletons;
    return {
      full: typeof skeletons.full !== 'string' ? skeletons.full._value : skeletons.full,
      long: typeof skeletons.long !== 'string' ? skeletons.full._value : skeletons.long,
      medium: typeof skeletons.medium !== 'string' ? skeletons.full._value : skeletons.medium ,
      short: typeof skeletons.short !== 'string' ? skeletons.full._value : skeletons.short
    }

  }
  private getTimeSkeletons(calendarData, calendar, locale): ISkeletons {
    return calendarData.main[locale].dates.calendars[calendar].timeSkeletons;
  }

  private getCalendarSkeletons(calendarData, calendar, locale): ICalendarSkeletons {
    return {
      date: this.getDateSkeletons(calendarData, calendar, locale),
      time: this.getTimeSkeletons(calendarData, calendar, locale)      
    }
  }

  private getIsPreferred(preferredCalendars, calendar, locale): boolean {
    const territory = bcp47.parse(locale).langtag.region;
    if (preferredCalendars[territory] !== undefined) {
      return preferredCalendars[territory].includes(calendar);
    } else {
      return calendar === 'gregorian';
    }
  }

  private getCalendarSystem(calendar): string {
    return calendarInfo[calendar].calendarSystem;
  }

  private getNumberSystem(calendar, locale): string {
    return calendar === 'hebrew' && locale === 'he' ? 'hebr' : 'latn';
  }

  private getMain(calendarData, localeNamesData, calendar, locale): ICalendarData {
    let calendarName: string;
    if (calendar === 'generic') {
      calendarName = 'iso8601';
    } else {
      calendarName = calendar;
    }

    return {
      tag: calendarName,
      displayName: localeNamesData[calendarName],
      dateNumberSystem: this.getNumberSystem(calendar, locale),
      names: this.getNames(calendarData, calendar, locale),
      formats: this.getCalendarFormats(calendarData, calendar, locale),
      patterns: this.getCalendarPatterns(calendarData, calendar, locale),
      skeletons: this.getCalendarSkeletons(calendarData, calendar, locale),
      isPreferred: this.getIsPreferred(preferredCalendars, calendar, locale),
      calendarSystem: this.getCalendarSystem(calendar)
    }
  }

  private getCalendarData(calendar: string, locale: string) {
    let calendarData;
    const pkg = calendar.split('-')[0];
    switch(calendar) {
      case 'gregorian':
      case 'generic':
        calendarData = CLDRUTIL.getLocaleData('dates', `ca-${calendar}`, locale);
        break;
        
      default:
        calendarData = CLDRUTIL.getLocaleData(`cal-${pkg}`, `ca-${calendar}`, locale);
        break;
    }

    return calendarData
  }


  async generateLocaleData(locale: string): Promise<ICalendar[]> {
    const availableCalendarsData = CLDRUTIL.getRootLocaleData('localenames', 'localeDisplayNames');
    const localeNamesData = availableCalendarsData.main[CLDRUTIL.rootLocale].localeDisplayNames.types.calendar;
    const availableCalendars = Object.keys(localeNamesData);

    const output: ICalendar[] = availableCalendars.map(calendar => {
      if (calendar === 'iso8601') {
        calendar = 'generic';
      }
      const calendarData = this.getCalendarData(calendar, locale);

      return {
        tag: locale,
        identity: this.getIdentity(calendarData, locale),
        moduleType: ModuleTypes.CALENDARS,
        main: this.getMain(calendarData, localeNamesData, calendar, locale)
      }
    });
    return output;
  }
}