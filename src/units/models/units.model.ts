import mongooseService from "../../common/services/mongoose.service";
import { IdentitySchema } from "../../common/schemas/identity.schema";
import { IUnitSubtags, IUnitDisplayNames, IUnitPer, IUnitTimes, 
  IUnitPower2, IUnitPower3, IUnitPrefixPatterns, IUnitPrefixPatternSets, 
  IUnitCoordinatePatterns, IUnitCoordinatePatternSets, IUnitPluralPatternSets, IUnitPatterns, IUnitData, IUnit} from "../interfaces/units.interface";
import { PluralKeysSchema } from "../../common/schemas/pluralKeys.schema";

const { Schema, model } = mongooseService.getMongoose();

const UnitSubtagsSchema = new Schema<IUnitSubtags>({
  category: String,
  unit: String
}, {_id: false});

const UnitDisplayNamesSchema = new Schema<IUnitDisplayNames>({
  long: String,
  short: String,
  narrow: String
}, {_id: false});

const UnitPerUnitSchema = new Schema<IUnitPer>({
  long: String,
  short: String,
  narrow: String
}, {_id: false});

const UnitTimesUnitSchema = new Schema<IUnitTimes>({
  long: String,
  short: String,
  narrow: String
}, {_id: false});

const UnitPower2Schema = new Schema<IUnitPower2>({
  long: PluralKeysSchema,
  short: PluralKeysSchema,
  narrow: PluralKeysSchema
}, {_id: false});

const UnitPower3Schema = new Schema<IUnitPower3>({
  long: PluralKeysSchema,
  short: PluralKeysSchema,
  narrow: PluralKeysSchema
}, {_id: false});


const UnitPrefixPatternsSchema = new Schema<IUnitPrefixPatterns>({
  "10p-1": String,
  "10p-2": String,
  "10p-3": String,
  "10p-6": String,
  "10p-9": String,
  "10p-12": String,
  "10p-15": String,
  "10p-18": String,
  "10p-21": String,
  "10p-24": String,
  "10p1": String,
  "10p2": String,
  "10p3": String,
  "10p6": String,
  "10p9": String,
  "10p12": String,
  "10p15": String,
  "10p18": String,
  "10p21": String,
  "10p24": String,
  "1024": String,
  "1024p1": String,
  "1024p2": String,
  "1024p3": String,
  "1024p4": String,
  "1024p5": String,
  "1024p6": String,
  "1024p7": String,
  "1024p8": String
}, {_id: false});

const UnitPrefixPatternSets = new Schema<IUnitPrefixPatternSets>({
  long: UnitPrefixPatternsSchema,
  short: UnitPrefixPatternsSchema,
  narrow: UnitPrefixPatternsSchema
}, {_id: false});

const UnitCoordinatePatternsSchema = new Schema<IUnitCoordinatePatterns>({
  displayName: String,
  north: String,
  south: String,
  east: String,
  west: String
}, {_id: false});

const UnitCoordinatePatternSetsSchema = new Schema<IUnitCoordinatePatternSets>({
  long: UnitCoordinatePatternsSchema,
  short: UnitCoordinatePatternsSchema,
  narrow: UnitCoordinatePatternsSchema
}, {_id: false});

const UnitPluralPatternsSchema = new Schema<IUnitPluralPatternSets>({
  long: PluralKeysSchema,
  short: PluralKeysSchema,
  narrow: PluralKeysSchema
}, {_id: false});


const UnitPatternsSchema = new Schema<IUnitPatterns>({
  prefixes: UnitPrefixPatternSets,
  per: UnitPerUnitSchema,
  times: UnitTimesUnitSchema,
  power2: UnitPower2Schema,
  power3: UnitPower3Schema,
  coordinates: UnitCoordinatePatternSetsSchema,
  plurals: UnitPluralPatternsSchema
}, {_id: false});


const UnitDataSchema = new Schema<IUnitData>({
  tag: String,
  subtags: UnitSubtagsSchema,
  gender: String,
  displayNames: UnitDisplayNamesSchema,
  patterns: UnitPatternsSchema
}, {_id: false});

const UnitSchema = new Schema<IUnit>({
  tag: {type: String, required: true},
  identity: {type: IdentitySchema, required: true},
  moduleType: {
    type: String,
    required: true
  },
  main: UnitDataSchema
});

export default model<IUnit>("Unit", UnitSchema);
