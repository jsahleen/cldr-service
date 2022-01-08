import { IVariant } from '../interfaces/variants.interface';
import Variant from "../models/variants.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/variants.dtos';
import { merge } from 'lodash';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:scripts-dao');

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

class VariantsDAO {

  constructor() {
    log('Created new instance of VariantsDAO');
  }

  async listVariants(tags: string[], locales: string[], filters: string[], limit, page): Promise<IVariant[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Variant
      .find({$and: [{tag: { $in: locales }},{'main.tag': tags}]})
      .select(`tag _id identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc', 'main.tag': 'asc'})
      .exec();
  } 

  async createVariant(fields: ICreateDTO): Promise<string> {
    const variant = new Variant(fields);
    const v = await variant.save();
    return v._id;
  } 

  async getVariantById(id: string): Promise<IVariant | null> {
    return  Variant.findById(id).exec();
  }

  async updateVariantById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<IVariant | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Variant.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Variant.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeVariantById(id: string): Promise<IVariant | null> {
    return Variant.findByIdAndRemove(id);
  }

  async listVariantsByTagOrType(
    tag: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<IVariant[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Variant
      .find({$and: [{'main.tag': tag},{ tag: { $in: locales } }]})
      .select(`_id tag identity moduleType main.tag ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();    
  }

  async getTags(): Promise<string[]> {
    const results = await Variant.find().select('main.tag').exec();
    return  results.map(result => {
      return result.main.tag;
    }).filter(onlyUnique);
  }

  async getLocales(): Promise<string[]> {
    const results = await Variant.find().select('tag').exec();
    return  results.map(result => {
      return result.tag;
    }).filter(onlyUnique);
  }

} 

export default new VariantsDAO();