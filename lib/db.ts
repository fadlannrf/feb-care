import path from 'node:path';
import {mkdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import postgres from 'postgres';
import {categories} from './shared.ts';
import {digest,passwordHash} from './security.ts';
import {runJobs} from './jobs.ts';
import {schemaSql} from './schema.ts';
export type Row=Record<string,any>;
export interface Database{q<T=Row>(sql:string,params?:any[]):Promise<T[]>;tx<T>(fn:(db:Database)=>Promise<T>):Promise<T>}
export const dataDir=()=>path.resolve(process.env.DATA_DIR||'./data');
export const demoEnabled=()=>process.env.NODE_ENV!=='production'&&process.env.DISABLE_DEMO!=='true';
export const demoAccounts=[{id:'demo-student',name:'Nadia Putri',role:'student',unit:null},{id:'demo-triage',name:'Rani Wulandari',role:'triage',unit:null},{id:'demo-unit',name:'Aditya Pratama',role:'unit',unit:'akademik'},{id:'demo-specialist',name:'Dina Safitri',role:'specialist',unit:'perlindungan'},{id:'demo-leader',name:'Pimpinan FEB',role:'leader',unit:null},{id:'demo-admin',name:'Admin FEB CARE',role:'admin',unit:null}];
const productionAccounts=[
 {name:'Mahasiswa FEB CARE',email:'mahasiswa@febcare.id',role:'student',unit:null},
 {name:'Petugas FEB CARE',email:'petugas.febcare@febcare.id',role:'triage',unit:null},
 {name:'Petugas Layanan Akademik',email:'petugas.akademik@febcare.id',role:'unit',unit:'akademik'},
 {name:'Petugas Keuangan & Beasiswa',email:'petugas.keuangan@febcare.id',role:'unit',unit:'keuangan'},
 {name:'Petugas Teknologi Informasi',email:'petugas.it@febcare.id',role:'unit',unit:'it'},
 {name:'Petugas Sarana & Layanan Umum',email:'petugas.umum@febcare.id',role:'unit',unit:'umum'},
 {name:'Petugas Perlindungan Mahasiswa',email:'petugas.perlindungan@febcare.id',role:'specialist',unit:'perlindungan'},
 {name:'Pimpinan FEB',email:'pimpinan@febcare.id',role:'leader',unit:null},
 {name:'Administrator FEB CARE',email:'admin@febcare.id',role:'admin',unit:null}
];
async function connect():Promise<Database>{let db:Database;
 if(process.env.DATABASE_URL){const sql=postgres(process.env.DATABASE_URL,{max:10,idle_timeout:20,connect_timeout:10});const wrap=(connection:any):Database=>({q:async(s,p=[])=>Array.from(await connection.unsafe(s,p)),tx:async(fn)=>connection.begin((trx:any)=>fn(wrap(trx)))});db=wrap(sql);}
 else{if(process.env.NODE_ENV==='production')throw Error('DATABASE_URL PostgreSQL wajib untuk production.');await mkdir(dataDir(),{recursive:true});const lite=new PGlite(path.join(dataDir(),'postgres'));await lite.waitReady;const wrap=(connection:any):Database=>({q:async(s,p=[])=>{const result=await connection.query(s,p);return result.rows;},tx:async(fn)=>connection.transaction((trx:any)=>fn(wrap(trx)))});db=wrap(lite);}
 await db.tx(async trx=>{for(const sql of schemaSql.split(';').map(s=>s.trim()).filter(Boolean))await trx.q(sql);});
 await db.tx(async trx=>{const seeded=await trx.q("INSERT INTO app_meta(key,value) VALUES('foundation','1') ON CONFLICT DO NOTHING RETURNING key");if(!seeded.length)return;
 for(const [id,name] of [['akademik','Layanan Akademik'],['keuangan','Keuangan & Beasiswa'],['umum','Sarana & Layanan Umum'],['it','Teknologi Informasi'],['mahasiswa','Kemahasiswaan'],['perlindungan','Tim Perlindungan Mahasiswa']])await trx.q('INSERT INTO units(id,name) VALUES($1,$2)',[id,name]);
 for(const c of categories){const unit=['akademik','pembelajaran','studi'].includes(c.id)?'akademik':c.id==='keuangan'?'keuangan':c.id==='teknologi'?'it':c.id==='etika'?'perlindungan':['kemahasiswaan','aspirasi'].includes(c.id)?'mahasiswa':'umum';await trx.q('INSERT INTO categories(id,name,icon,description,unit_id,sla_hours,sensitive) VALUES($1,$2,$3,$4,$5,$6,$7)',[c.id,c.name,c.icon,c.description,unit,c.id==='mendesak'?24:72,c.id==='etika']);}
 });
 if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD){if(process.env.ADMIN_PASSWORD.length<12)throw Error('ADMIN_PASSWORD minimal 12 karakter.');await db.q("INSERT INTO users(id,name,email,password_hash,role) VALUES($1,'Administrator',$2,$3,'admin') ON CONFLICT(email) DO NOTHING",[randomUUID(),process.env.ADMIN_EMAIL.toLowerCase(),passwordHash(process.env.ADMIN_PASSWORD)]);}
 await seedProductionAccounts(db);
 if(demoEnabled())await seedDemo(db);
 if(!process.env.DATABASE_URL){let running=false;setInterval(async()=>{if(running)return;running=true;try{await runJobs(db);}catch(e){console.error('Background jobs:',(e as Error).message);}finally{running=false;}},60000).unref();}
 return db;
}
async function seedProductionAccounts(db:Database){
 const password=process.env.STAFF_BOOTSTRAP_PASSWORD||'111111111111';
 if(password.length<12)return;
 await db.tx(async trx=>{for(const account of productionAccounts)await trx.q('INSERT INTO users(id,name,email,password_hash,role,unit_id) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(email) DO NOTHING',[randomUUID(),account.name,account.email,passwordHash(password),account.role,account.unit]);});
}
async function seedDemo(db:Database){await db.tx(async trx=>{const inserted=await trx.q("INSERT INTO app_meta(key,value) VALUES('demo_v1','1') ON CONFLICT DO NOTHING RETURNING key");if(!inserted.length)return;for(const u of demoAccounts)await trx.q('INSERT INTO users(id,name,email,role,unit_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[u.id,u.name,`${u.role}@demo.febcare.local`,u.role,u.unit]);
 const samples=[['Perubahan jadwal kelas Ekonomi Makro','akademik','in_progress'],['Pengajuan keringanan UKT semester ganjil','keuangan','received'],['Wi-Fi perpustakaan sering terputus','teknologi','resolved'],['Nilai mata kuliah belum muncul di KHS','studi','needs_info'],['Usulan ruang diskusi untuk mahasiswa','aspirasi','verified'],['Proyektor ruang B.204 tidak menyala','fasilitas','assigned'],['Surat pengantar magang belum diterima','administrasi','resolved'],['Konsultasi jadwal bimbingan skripsi','studi','awaiting_confirmation'],['Akses lift gedung perkuliahan','sarana','in_progress'],['Pendaftaran kegiatan organisasi mahasiswa','kemahasiswaan','resolved'],['Jadwal kuliah bertabrakan dengan praktikum','akademik','received'],['Permintaan pendampingan yang bersifat rahasia','etika','received'],['Usulan peminjaman buku digital','aspirasi','resolved'],['Verifikasi berkas KIP Kuliah','keuangan','assigned'],['Ketersediaan materi pembelajaran','pembelajaran','resolved'],['Penanganan kebocoran plafon ruang kelas','mendesak','in_progress']];
 for(let i=0;i<samples.length;i++){const [title,category,status]=samples[i];const [cat]=await trx.q('SELECT * FROM categories WHERE id=$1',[category]);const [seq]=await trx.q("SELECT nextval('ticket_sequence') AS value");const id=randomUUID(),created=new Date(Date.now()-(i+1)*21*3600000),due=new Date(created.getTime()+cat.sla_hours*3600000);const resolved=status==='resolved'?new Date(created.getTime()+18*3600000):null;const reporter=i===11?null:'demo-student';await trx.q('INSERT INTO tickets(id,number,access_hash,reporter_id,title,description,category_id,unit_id,status,priority,sensitive,confidential,location,created_at,updated_at,due_at,resolved_at,rating) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)',[id,`FEB-${new Date().getFullYear()}-${String(seq.value).padStart(6,'0')}`,digest('DEMO-CARE-2026'),reporter,title,`[Data simulasi] ${title}. Mohon bantuan tim FEB CARE untuk meninjau kendala ini dan memberikan informasi tentang langkah penanganannya. Terima kasih atas bantuan dan tindak lanjutnya.`,category,['received','verified'].includes(status)?null:cat.unit_id,status,i===15?'urgent':'normal',cat.sensitive,i===11,'Fakultas Ekonomi dan Bisnis',created,new Date(created.getTime()+3600000),due,resolved,resolved?4+(i%2):null]);await trx.q('INSERT INTO events(id,ticket_id,actor_label,kind,body,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[randomUUID(),id,'FEB CARE','status','Laporan berhasil diterima. Tim kami akan meninjau laporan ini.','received',created]);if(status!=='received')await trx.q('INSERT INTO events(id,ticket_id,actor_label,kind,body,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[randomUUID(),id,'Tim FEB CARE','status',status==='awaiting_confirmation'?'Solusi sudah disampaikan. Silakan konfirmasi apakah kebutuhan Anda sudah terpenuhi.':status==='needs_info'?'Mohon lengkapi kode mata kuliah dan semester agar dapat kami periksa.':'Tim telah meninjau laporan dan memperbarui perkembangan penanganan.',status,new Date(created.getTime()+3600000)]);}
 await trx.q('INSERT INTO notifications(id,user_id,title,body) VALUES($1,$2,$3,$4)',[randomUUID(),'demo-student','Selamat datang di FEB CARE','Ini ruang demo Anda. Coba membuat laporan dan ikuti progresnya.']);});}
const globalDb=globalThis as typeof globalThis&{febDb?:Promise<Database>};
export function getDb(){return globalDb.febDb??=connect().catch(error=>{globalDb.febDb=undefined;throw error;});}

