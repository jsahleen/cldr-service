import { ICurrency } from "../../currencies/interfaces/currencies.interface";
import { IExtension } from "../../extensions/interfaces/extensions.interface";
import { ILanguage } from "../../languages/interfaces/languages.interface";
import { ILocale } from "../../locales/interfaces/locales.interface";
import { INumberSystem } from "../../numbers/interfaces/numbers.interface";
import { IScript } from "../../scripts/interfaces/scripts.interface";
import { ITerritory } from "../../territories/interfaces/territories.interface";
import { IVariant } from "../../variants/interfaces/variants.interface";
import { ICalendar } from "../../calendars/interfaces/calendars.interface";
import { IRelativeTime } from "../../time/interfaces/time.interface";
import { IZone } from "../../zones/interfaces/zones.interface";
import { IUnit } from '../../units/interfaces/units.interface';

export type Module = INumberSystem | ICurrency | ILanguage |
                     IScript | ITerritory | IVariant | IExtension | 
                     ILocale | ICalendar | IRelativeTime | IZone |
                     IUnit;
