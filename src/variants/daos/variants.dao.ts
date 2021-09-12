import { IVariant } from '../interfaces/variants.interface';
import Variant from "../models/variants.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/variants.dtos';
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
      .sort({tag: 'asc'})
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

  async updateVariantById(id: string, fields: IPatchDTO | IPutDTO): Promise<void> {
    Variant.findByIdAndUpdate(id, fields, { new: true }).exec();
  }

  async removeVariantById(id: string): Promise<void> {
    Variant.findByIdAndRemove(id);
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

  async getVariantTags(): Promise<string[]> {
    const results = await Variant.find().select('main.tag').exec();
    return  results.map(result => {
      return result.main.tag;
    }).filter(onlyUnique);
  }

} 

export default new VariantsDAO();