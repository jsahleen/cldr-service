import { ICurrency } from "../../currencies/interfaces/currencies.interface";
import { ILanguage } from "../../languages/interfaces/languages.interface";
import { INumberSystem } from "../../numbers/interfaces/numbers.interface";
import { IScript } from "../../scripts/interfaces/scripts.interface";
import { ITerritory } from "../../territories/interfaces/territories.interface";
import { IVariant } from "../../variants/interfaces/variants.interface";

export type Module = INumberSystem | ICurrency | ILanguage | IScript | ITerritory | IVariant;
