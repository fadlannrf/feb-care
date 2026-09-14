import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {runJobs} from '../lib/jobs.ts';
import type {Database} from '../lib/db.ts';
test('SLA worker escalates overdue tickets once and notifies authorized roles',async()=>{
 const lite=new PGlite();await lite.waitReady;
 const wrap=(c:any):Database=>({q:async(s,p=[])=>{const result=await c.query(s,p);return result.rows;},tx:fn=>c.transaction((tx:any)=>fn(wrap(tx)))});
 const db=wrap(lite);
 try{await lite.exec(await readFile(new URL('../db/schema.sql',import.meta.url),'utf8'));
 await db.q("INSERT INTO units(id,name) VALUES('unit','Test unit')");
 await db.q("INSERT INTO categories(id,name,icon,description,unit_id,sla_hours) VALUES('category','Test','book','Test','unit',24)");
 await db.q("INSERT INTO users(id,name,email,role) VALUES('triage','Test Triage','triage@example.test','triage'),('leader','Test Leader','leader@example.test','leader')");
 await db.q("INSERT INTO tickets(id,number,access_hash,title,description,category_id,due_at) VALUES('test','FEB-QA','hash','Test report','Not a real report','category',now()-interval '2 days')");
 const first=await runJobs(db);assert.equal(first.escalated,1);const second=await runJobs(db);assert.equal(second.escalated,0);
 const notices=await db.q('SELECT user_id FROM notifications');assert.deepEqual(notices.map(n=>n.user_id),['triage']);
 const events=await db.q('SELECT internal FROM events');assert.equal(events.length,1);assert.equal(events[0].internal,true);
 }finally{await lite.close();}
});
