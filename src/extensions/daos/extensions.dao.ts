import { IExtension } from '../interfaces/extensions.interface';
import Extension from "../models/extensions.model";
import { ICreateDTO, IPutDTO, IPatchDTO } from '../dtos/extensions.dtos';
import debug, {IDebugger } from 'debug';

const log: IDebugger = debug('app:scripts-dao');

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

class ExtensionsDAO {

  constructor() {
    log('Created new instance of ExensionsDAO');
  }

  async listExtensions(locales: string[], filters: string[], limit, page): Promise<IExtension[]> {
    const paths = filters.map(filter => {
      return `main.${filter}`;
    });

    return Extension
      .find({ tag: { $in: locales } })
      .select(`tag _id identity moduleType main.key ${paths.join(' ')}`)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({tag: 'asc'})
      .exec();
  } 

  async createExtension(fields: ICreateDTO): Promise<string> {
    const script = new Extension(fields);
    const scr = await script.save();
    return scr._id;
  } 

  async getExtensionById(id: string): Promise<IExtension | null> {
    return  Extension.findById(id).exec();
  }

  async updateExtensionById(id: string, fields: IPatchDTO | IPutDTO): Promise<void> {
    Extension.findByIdAndUpdate(id, fields, { new: true }).exec();
  }

  async removeExtensionById(id: string): Promise<void> {
    Extension.findByIdAndRemove(id);
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

  async getExtensionKeys(): Promise<string[]> {
    const results = await Extension.find().select('main.key').exec();
    return  results.map(result => {
      return result.main.key;
    }).filter(onlyUnique);
  }

} 

export default new ExtensionsDAO();