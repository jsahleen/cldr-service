import { IExtension } from '../interfaces/extensions.interface';
import Extension from "../models/extensions.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/extensions.dtos';
import debug, {IDebugger } from 'debug';
import { merge } from 'lodash'; 

const log: IDebugger = debug('app:scripts-dao');

class ExtensionsDAO {

  constructor() {
    log('Created new instance of ExensionsDAO');
  }

  async listExtensions(keys: string[], locales: string[], filters: string[], limit, page): Promise<IExtension[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Extension
      .find({$and: [{tag: { $in: locales }},{'main.key': keys}]})
      .select(`tag _id identity moduleType main.key ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();
  } 

  async createExtension(fields: ICreateDTO): Promise<string> {
    const extension = new Extension(fields);
    const ext = await extension.save();
    return ext._id;
  } 

  async getExtensionById(id: string): Promise<IExtension | null> {
    return  Extension.findById(id).exec();
  }

  async updateExtensionById(id: string, fields: IPatchDTO | IPutDTO, mergeFields = false): Promise<IExtension | null> {
    let input: IPatchDTO | IPutDTO;
    if (mergeFields === true) {
      const existing = await Extension.findById(id);
      input = merge({}, existing, fields);
    } else {
      input = fields;
    }
    return Extension.findByIdAndUpdate(id, input, { new: true }).exec();
  }

  async removeExtensionById(id: string): Promise<IExtension | null> {
    return Extension.findByIdAndRemove(id);
  }

  async listExtensionsByKeyOrType(
    key: string,
    locales: string[],
    filters: string[],
    limit: number,
    page: number
  ): Promise<IExtension[] | null> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Extension
      .find({$and: [{'main.key': key},{ tag: { $in: locales } }]})
      .select(`_id tag identity moduleType main.key ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();    
  }

  async getTags(): Promise<string[]> {
    return Extension.distinct('main.key').exec();
  }

  async getLocales(): Promise<string[]> {
    return Extension.distinct('tag').exec();
  }

} 

export default new ExtensionsDAO();