import UsersGenerator from "../src/users/generators/users.generator";
import NumberSystemGenerator from "../src/numbers/generators/numbers.generator";
import CurrencyGenerator from "../src/currencies/generators/currencies.generator";
import debug, { IDebugger} from 'debug';

import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

const log: IDebugger = debug('app:seed');

async function seed() {
  const r: string[] = [];
  const n = new NumberSystemGenerator();
  r.push(await n.generate());
  const u = new UsersGenerator();
  r.push(await u.generate()); 
  const c = new CurrencyGenerator();
  r.push(await c.generate());
  return r.join('\n');
}

log('Starting database seed');

function init() {
  seed().then((r) => {
    log(r);
    process.exit(0);
  }).catch(e => {
    log(e);
    process.exit(1)
  });
}

init();