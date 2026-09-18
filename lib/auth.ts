import {cookies} from 'next/headers';
import {getDb} from './db.ts';
import {digest,secret,AppError} from './security.ts';
import type {User} from './shared.ts';
export async function currentUser():Promise<User|null>{const cookie=(await cookies()).get('feb_session')?.value;if(!cookie)return null;const db=await getDb();const [u]=await db.q<User>('SELECT u.id,u.name,u.email,u.role,u.unit_id,u.student_number,u.study_program,u.cohort_year,u.phone,u.active FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active=true',[digest(cookie)]);return u||null;}
export async function requireUser(){const user=await currentUser();if(!user)throw new AppError('Silakan masuk untuk melanjutkan.',401);return user;}
export async function establishSession(userId:string){const token=secret();const db=await getDb();await db.q('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)',[digest(token),userId,new Date(Date.now()+7*86400000)]);(await cookies()).set('feb_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800});}
export async function clearSession(){const jar=await cookies(),token=jar.get('feb_session')?.value;if(token)await(await getDb()).q('DELETE FROM sessions WHERE token_hash=$1',[digest(token)]);jar.delete('feb_session');}
export function checkOrigin(request:Request){
 const expectedOrigin=new URL(process.env.APP_URL||'http://localhost:3002').origin;
 const origin=request.headers.get('origin');
 const allowed=new Set([expectedOrigin]);
 if(process.env.NODE_ENV!=='production'&&(expectedOrigin==='http://localhost:3002'||expectedOrigin==='http://127.0.0.1:3002')){
  allowed.add('http://localhost:3002');
  allowed.add('http://127.0.0.1:3002');
 }
 if(!origin||!allowed.has(origin))throw new AppError('Asal permintaan tidak diizinkan.',403);
}
export async function rateLimit(key:string,limit=12,seconds=900){const db=await getDb();const [row]=await db.q('INSERT INTO rate_limits(key,count,expires_at) VALUES($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.count+1 END, expires_at=CASE WHEN rate_limits.expires_at<now() THEN EXCLUDED.expires_at ELSE rate_limits.expires_at END RETURNING count',[digest(key),new Date(Date.now()+seconds*1000)]);if(row.count>limit)throw new AppError('Terlalu banyak percobaan. Coba kembali beberapa saat lagi.',429);}
