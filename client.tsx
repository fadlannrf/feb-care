'use client';
import {useCallback,useEffect,useState} from 'react';
import {statuses} from '@/lib/shared';
import {Icon} from './icon';
export async function api<T=any>(url:string,options:RequestInit={}){const response=await fetch(url,{...options,headers:{...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...options.headers}});const data=await response.json();if(!response.ok)throw new Error(data.error||'Permintaan gagal. Coba kembali.');return data as T;}
export function useApi<T=any>(url:string|null){const [data,setData]=useState<T|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);const load=useCallback(async()=>{if(!url){setLoading(false);return;}setLoading(true);setError('');try{const d=await api<T>(url);setData(d);}catch(e){setError((e as Error).message);}finally{setLoading(false);}},[url]);useEffect(()=>{let ignore=false;setLoading(true);setError('');if(!url){setLoading(false);return;}api<T>(url).then(d=>{if(!ignore)setData(d);}).catch(e=>{if(!ignore)setError(e.message);}).finally(()=>{if(!ignore)setLoading(false);});return()=>{ignore=true;};},[url]);return{data,error,loading,reload:load,setData};}
export function Badge({status}:{status:string}){const s=statuses[status]||{label:status,color:'gray'};return <span className={`badge ${s.color}`}><i/>{s.label}</span>;}
export function ErrorMessage({message}:{message:string}){return message?<div className="error-message" role="alert"><Icon name="alert" size={18}/>{message}</div>:null;}
export function Loading(){return <div className="loading-state" role="status"><span className="loader"/>Menyiapkan ruang kamu…</div>;}
export function Empty({title='Belum ada laporan',text='Laporan baru akan muncul di sini.'}:{title?:string;text?:string}){return <div className="empty-state"><Icon name="message" size={38}/><h3>{title}</h3><p>{text}</p></div>;}
export function Notice({children}:{children:React.ReactNode}){return <div className="notice"><Icon name="shield" size={18}/><div>{children}</div></div>;}
