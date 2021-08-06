import NumberSystemGenerator from "../src/numbers/generators/numbers.generator";
import debug, { IDebugger} from 'debug';
import UsersGenerator from "../src/users/generators/users.generator";

import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

const log: IDebugger = debug('app:seed');

const pageString = '';
const page = parseInt(pageString, 10)
log(`${page}`);

async function seed() {
  const r: string[] = [];
  const n = new NumberSystemGenerator();
  r.push(await n.generate());
  const u = new UsersGenerator();
  r.push(await u.generate()); 
  return r.join('\n');
}

log('Starting database seed');

function init() {
  seed().then((r) => {
    log(`${JSON.stringify(r, null, "  ")}`);
    process.exit(0);
  }).catch(e => {
    console.log(e.message);
    process.exit(1)
  });
}

init();