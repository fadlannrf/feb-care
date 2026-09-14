import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
export function digest(value:string){return createHash('sha256').update(value).digest('hex');}
export function secret(){return randomBytes(24).toString('base64url');}
export function passwordHash(value:string){const salt=randomBytes(16).toString('hex');return `${salt}:${scryptSync(value,salt,64).toString('hex')}`;}
export function passwordMatches(value:string,hash:string|null){if(!hash)return false;const [salt,stored]=hash.split(':');try {const actual=scryptSync(value,salt,64);const expected=Buffer.from(stored,'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected);}catch{return false;}}
export class AppError extends Error{status:number;constructor(message:string,status=400){super(message);this.status=status;}}
export function textValue(value:unknown,name:string,min=1,max=500){if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)throw new AppError(`${name} harus berisi ${min}–${max} karakter.`);return value.trim();}
export function emailValue(value:unknown){const v=textValue(value,'Email',5,180).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))throw new AppError('Format email belum benar.');return v;}
export function strongPassword(value:unknown){const v=textValue(value,'Kata sandi',12,128);return v;}
export const transitions:Record<string,string[]>={received:['verified','needs_info','rejected'],verified:['assigned','needs_info','rejected'],assigned:['in_progress','needs_info'],in_progress:['needs_info','awaiting_confirmation'],needs_info:['verified','in_progress','rejected'],awaiting_confirmation:[],resolved:[],rejected:[],closed:[]};
export function allowTransition(from:string,to:string,owner:boolean){return owner?from==='awaiting_confirmation'&&['resolved','in_progress'].includes(to):(transitions[from]||[]).includes(to);}
export function detectFile(buffer:Buffer){if(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {mime:'image/png',ext:'png'};if(buffer[0]===255&&buffer[1]===216&&buffer[2]===255)return {mime:'image/jpeg',ext:'jpg'};if(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')return {mime:'image/webp',ext:'webp'};if(buffer.toString('ascii',0,5)==='%PDF-')return {mime:'application/pdf',ext:'pdf'};return null;}
