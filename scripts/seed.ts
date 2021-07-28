import NumberSystemGenerator from "../src/numbers/generators/numbers.generator";
import debug, { IDebugger} from 'debug';

const log: IDebugger = debug('app:seed');

const pageString = '';
const page = parseInt(pageString, 10)
log(`${page}`);

async function seed() {
  const n = new NumberSystemGenerator();
  const r = await n.generate();
  return r
}

log('Starting database seed');

function init() {
  seed().then((r) => {
    log(`${JSON.stringify(r, null, "  ")}`);
    process.exit(0);
  })
  .catch((e) => {
    log(e.message());
    process.exit(1)
  });
}

init();