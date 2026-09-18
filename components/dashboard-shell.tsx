'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {createContext,useContext,useState,useEffect,useRef} from 'react';
import type {User} from '@/lib/shared';
import {roles} from '@/lib/shared';
import {Brand,Icon} from './icon';
import {api,useApi} from './client';
import {ThemeToggle} from './theme';

const Context=createContext<{user:User;demo:boolean}>({user:null as unknown as User,demo:false});
export const useSession=()=>useContext(Context);

export function DashboardShell({children,user,demo}:{children:React.ReactNode;user:User;demo:boolean}){
 const pathname=usePathname(),router=useRouter();
 const [open,setOpen]=useState(false);
 const {data,reload:reloadNotifications}=useApi('/api/notifications');
 const [mobile,setMobile]=useState(false);
 const sidebar=useRef<HTMLElement>(null),menuButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const mq=matchMedia('(max-width:700px)');const sync=()=>{setMobile(mq.matches);if(!mq.matches)setOpen(false);};sync();mq.addEventListener('change',sync);return()=>mq.removeEventListener('change',sync);},[]);
 useEffect(()=>{const refresh=()=>{void reloadNotifications();};window.addEventListener('feb-notifications-changed',refresh);window.addEventListener('focus',refresh);return()=>{window.removeEventListener('feb-notifications-changed',refresh);window.removeEventListener('focus',refresh);};},[reloadNotifications]);
 useEffect(()=>{if(!open||!mobile)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';sidebar.current?.querySelector<HTMLElement>('a,button')?.focus();return()=>{document.body.style.overflow=previous;};},[open,mobile]);
 const unread=data?.notifications.filter((n:any)=>!n.read_at).length||0;
 const aggregate=['leader','admin'].includes(user.role);
 const today=new Date();
 const dateLong=today.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase();
 const dateShort=today.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}).toUpperCase();
 const menu=[{href:'/dashboard',label:'Ringkasan',icon:'grid'},...(!aggregate||user.role==='admin'?[{href:'/dashboard/laporan',label:user.role==='student'?'Laporan saya':'Kelola laporan',icon:'message'}]:[]),...(user.role!=='student'?[{href:'/dashboard/analitik',label:'Analitik layanan',icon:'chart'}]:[]),{href:'/dashboard/notifikasi',label:'Notifikasi',icon:'bell'},...(user.role==='admin'?[{href:'/dashboard/pengaturan',label:'Pengaturan',icon:'settings'},{href:'/dashboard/audit',label:'Jejak audit',icon:'shield'}]:[])];
 const current=menu.find(m=>m.href==='/dashboard'?pathname===m.href:pathname.startsWith(m.href));
 return <Context.Provider value={{user,demo}}><div className="dashboard-layout">
  <aside ref={sidebar} inert={mobile&&!open} role={mobile&&open?'dialog':undefined} aria-modal={mobile&&open?true:undefined} aria-label="Navigasi workspace" onKeyDown={e=>{if(!open||!mobile)return;if(e.key==='Escape'){setOpen(false);menuButton.current?.focus();}if(e.key==='Tab'){const nodes=sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)');if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}} className={`sidebar ${open?'open':''}`}>
   <Link href="/" className="sidebar-brand"><Brand/></Link>
   <div className="workspace-label"><span className="workspace-icon">FEB</span><div>Fakultas Ekonomi & Bisnis<small>{roles[user.role]}</small></div></div>
   <span className="nav-section-label mono">WORKSPACE</span>
   <nav>{menu.map(m=><Link href={m.href} key={m.href} className={current?.href===m.href?'active':''} onClick={()=>setOpen(false)}><Icon name={m.icon} size={18}/>{m.label}{m.icon==='bell'&&unread>0&&<span className="nav-count">{unread}</span>}</Link>)}</nav>
   <div className="sidebar-bottom"><div className="sidebar-note"><Icon name="spark" size={18}/><h4>Suara kecil. Dampak besar.</h4><p>Terima kasih telah menjadi bagian dari perubahan.</p><Link href="/" className="text-link">Kunjungi beranda <Icon name="upRight" size={14}/></Link></div><button className="logout-button" onClick={async()=>{await api('/api/auth/logout',{method:'POST'});router.push('/masuk');router.refresh();}}><Icon name="logout" size={17}/>Keluar akun</button></div>
  </aside>
  {open&&<button className="sidebar-overlay" aria-label="Tutup navigasi" onClick={()=>setOpen(false)}/>}<div className="dashboard-content">
   <header className="dashboard-header"><button ref={menuButton} aria-expanded={open} className="icon-button dashboard-menu" aria-label="Buka navigasi" onClick={()=>setOpen(true)}><Icon name="menu"/></button><div className="breadcrumb"><span className="breadcrumb-workspace"><span>Workspace</span><time className="dashboard-date" dateTime={today.toISOString().slice(0,10)} aria-label="Tanggal hari ini"><span className="date-long">{dateLong}</span><span className="date-short">{dateShort}</span></time></span><Icon name="chevron" size={13}/><span>{current?.label||'Detail laporan'}</span></div><div className="dashboard-header-right"><ThemeToggle/>{demo&&<span className="demo-badge">DEMO</span>}<Link href="/dashboard/notifikasi" className="notification-button" aria-label={`${unread} notifikasi belum dibaca`}><Icon name="bell" size={19}/>{unread>0&&<i/>}</Link><span className="header-divider"/><div className="user-mini"><span className="avatar">{user.name.split(' ').slice(0,2).map(n=>n[0]).join('')}</span><div><strong>{user.name}</strong><small>{roles[user.role]}</small></div></div></div></header>
   <main className="dashboard-main">{children}</main><footer className="dashboard-footer"><span>FEB CARE — Suara Mahasiswa, Aksi Nyata FEB.</span>{demo&&<span>Lingkungan demo · Data simulasi</span>}</footer>
  </div>
 </div></Context.Provider>;
}
