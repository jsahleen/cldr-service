import path from "path";
import fs from 'fs';
import * as semver from 'semver';

const cldrTier = process.env.CLDR_TIER || 'modern';
const cldrVersion = process.env.CLDR_VERSION || '40.0.0';
const CORE_PATH = path.resolve(__dirname, path.join('..', '..', '..', 'node_modules', 'cldr-core'));
const version = semver.major(cldrVersion);

class CLDRUTIL {

  public rootLocale = version >= 40 ? 'und' : 'root';

  public getAvailableLocales(): string[] {
    try {
      const contents = fs.readFileSync(path.join(CORE_PATH, 'availableLocales.json'), 'utf-8')
      const data = JSON.parse(contents);
      return data.availableLocales[cldrTier];
    } catch (e) {
      return [];
    }
  }
  
  public getLocaleData(pkg: string, fileName: string, locale: string = this.rootLocale): Record<string, string> {
    const localeDataPath = path.resolve(__dirname, 
      path.join('..', '..', '..', 'node_modules', `cldr-${pkg}-${cldrTier}`, 'main', `${locale}`, `${fileName}.json`));
    try {
      const contents = fs.readFileSync(localeDataPath, 'utf-8')
      return JSON.parse(contents)
    } catch (e) {
      return {};
    }
  }

  public getRootLocaleData(pkg: string, fileName: string): Record<string, string> {
    const localeDataPath = path.resolve(__dirname, 
      path.join('..', '..', '..', 'node_modules', `cldr-${pkg}-${cldrTier}`, 'main', `${this.rootLocale}`, `${fileName}.json`));
    try {
      const contents = fs.readFileSync(localeDataPath, 'utf-8')
      return JSON.parse(contents)
    } catch (e) {
      return {};
    }
  }

}

export default new CLDRUTIL();