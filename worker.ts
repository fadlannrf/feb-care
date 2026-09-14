import {getDb} from './lib/db.ts';
import {runJobs} from './lib/jobs.ts';
if(!process.env.DATABASE_URL)throw Error('Worker terpisah memerlukan PostgreSQL server. Preview lokal memproses SLA dalam proses web.');
const db=await getDb();
async function tick(){try{console.log(new Date().toISOString(),await runJobs(db));}catch(e){console.error(e);}setTimeout(tick,60000);}
await tick();
