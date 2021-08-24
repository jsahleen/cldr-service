import UsersGenerator from "../src/users/generators/users.generator";
import NumberSystemGenerator from "../src/numbers/generators/numbers.generator";
import CurrencyGenerator from "../src/currencies/generators/currencies.generator";
import LanguagesGenerator from "../src/languages/generators/languages.generator";
import ScriptsGenerator from '../src/scripts/generators/scripts.generator';
import TerritoriesGenerator from '../src/territories/generators/territories.generator';
import VariantsGenerator from "../src/variants/generators/variants.generator";
import debug, { IDebugger} from 'debug';

import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

const log: IDebugger = debug('app:seed');

async function seed(module) {
  const r: string[] = [];
  const u = new UsersGenerator();
  const n = new NumberSystemGenerator();
  const c = new CurrencyGenerator();
  const l = new LanguagesGenerator();
  const s = new ScriptsGenerator();
  const t = new TerritoriesGenerator();
  const v = new VariantsGenerator();
  switch (module) {
    case 'users':
      r.push(await u.generate()); 
      break;
  
    case 'numbers':
      r.push(await n.generate()); 
      break;
  
    case 'currencies':
      r.push(await c.generate()); 
      break;
  
    case 'languages':
      r.push(await l.generate()); 
      break;
  
    case 'scripts':
      r.push(await s.generate()); 
      break;
  
    case 'territories':
      r.push(await t.generate()); 
      break;
  
    case 'variants':
      r.push(await v.generate()); 
      break;
  
    default:
      r.push(await u.generate()); 
      r.push(await n.generate());
      r.push(await c.generate());
      r.push(await l.generate());
      r.push(await s.generate());
      r.push(await t.generate());
      r.push(await v.generate());
      break;
  }
  return r.join('\n');
}

log('Starting database seed');

function init() {
  seed(process.argv[2]).then((r) => {
    console.log(r);
    process.exit(0);
  }).catch(e => {
    console.log(e);
    process.exit(1)
  });
}

init();