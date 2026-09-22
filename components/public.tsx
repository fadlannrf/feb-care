'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {motion} from '@/lib/motion';
import {pausePageScroll,resumePageScroll,scrollToSection} from './smooth-scroll';
import {useEffect,useRef,useState} from 'react';
import {Brand,Icon} from './icon';
import {ThemeToggle} from './theme';
import {useApi} from './client';
export function Header(){
 const router=useRouter();const [menu,setMenu]=useState(false),[closing,setClosing]=useState(false);
 const {data:bootstrap}=useApi('/api/bootstrap');const user=bootstrap?.user;
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),animations=useRef<Animation[]>([]),closingRef=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;animations.current.forEach(a=>a.cancel());resumePageScroll();};},[]);
 useEffect(()=>{if(!menu)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[menu]);
 function freeze(){for(const animation of animations.current){try{animation.commitStyles();}catch{}animation.cancel();}animations.current=[];}
 function animate(el:Element|null,frames:Keyframe[],duration:number,delay=0){if(!el)return null;const animation=el.animate(frames,{duration,delay,easing:motion.hop,fill:'both'});animations.current.push(animation);return animation;}
 function open(){if(dialog.current?.open)return;const el=dialog.current!;closingRef.current=false;setClosing(false);freeze();el.showModal();pausePageScroll();setMenu(true);el.scrollTop=0;const content=el.querySelector<HTMLElement>('.drawer-content')!;content.scrollTop=0;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.style.clipPath='inset(0)';content.style.transform='none';el.querySelectorAll<HTMLElement>('.drawer-line,.drawer-divider,.drawer-arrow').forEach(e=>e.removeAttribute('style'));return;}
  animate(el,[{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)'}],motion.menu);
  animate(content,[{transform:'translateY(-50%)'},{transform:'translateY(0%)'}],motion.menu);
  const lines=el.querySelectorAll('.drawer-body nav .drawer-line');lines.forEach((line,i)=>animate(line,[{transform:'translateY(-114%)'},{transform:'translateY(0%)'}],motion.text,350+(lines.length-1-i)*25));
  const dividers=el.querySelectorAll('.drawer-divider');dividers.forEach((line,i)=>animate(line,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],motion.text,400+(dividers.length-1-i)*motion.stagger));
  el.querySelectorAll('.drawer-aside .drawer-line').forEach((line,i)=>animate(line,[{transform:'translateY(-114%)'},{transform:'translateY(0%)'}],motion.text,450+i*motion.stagger));
  el.querySelectorAll('.drawer-arrow').forEach((arrow,i)=>animate(arrow,[{opacity:0},{opacity:1}],motion.text,600+(4-i)*motion.stagger));
 }
 async function close(after?:()=>void){if(closingRef.current||!dialog.current?.open)return;closingRef.current=true;setClosing(true);const el=dialog.current,content=el.querySelector('.drawer-content')!;freeze();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const clip=getComputedStyle(el).clipPath,transform=getComputedStyle(content).transform;const animation=animate(el,[{clipPath:clip==='none'?'inset(0)':clip},{clipPath:'inset(0 0 100% 0)'}],motion.menu);animate(content,[{transform},{transform:'translateY(-50%)'}],motion.menu);try{await animation?.finished;}catch{return;}}
  if(!mounted.current)return;el.close();setMenu(false);setClosing(false);closingRef.current=false;resumePageScroll();trigger.current?.focus({preventScroll:true});after?.();
 }
 function navigate(e:React.MouseEvent<HTMLAnchorElement>,href:string){if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();void close(()=>{const url=new URL(href,location.origin);if(url.pathname===location.pathname&&url.hash){router.push(href,{scroll:false});scrollToSection(url.hash);}else router.push(href);});}
 const items=[['Beranda','/'],['Tentang','/#tentang'],['Layanan','/#layanan'],['Cara kerja','/#alur'],['Lacak laporan','/lacak'],['Sampaikan suara','/lapor']];
 return <>
<header className="site-header">
<Link href="/" aria-label="FEB CARE beranda">
<Brand/>
</Link>
<nav className="public-nav" aria-label="Navigasi utama">
<Link href="/#tentang">Tentang</Link>
<Link href="/#layanan">Layanan</Link>
<Link href="/#alur">Cara kerja</Link>
<Link href="/lacak">Lacak laporan <Icon name="upRight" size={15}/>
</Link>
</nav>
<div className="header-actions">
<ThemeToggle/>
<Link href={user?'/dashboard':'/masuk'} className="header-login">{user?'Ruang saya':'Masuk'} <Icon name="arrow" size={17}/>
</Link>
<button ref={trigger} className="icon-button menu-trigger" aria-label="Buka menu" aria-expanded={menu} aria-controls="navigation-drawer" onClick={open}>
<Icon name="menu"/>
</button>
</div>
</header>
 <dialog id="navigation-drawer" data-lenis-prevent ref={dialog} className={`navigation-drawer ${closing?'is-closing':''}`} aria-label="Menu FEB CARE" onCancel={e=>{e.preventDefault();void close();}} onClick={e=>{if(e.target===e.currentTarget){const b=e.currentTarget.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)void close();}}}>
<button className="icon-button drawer-close" aria-label="Tutup menu" onClick={()=>void close()} autoFocus>
<Icon name="close" size={28}/>
</button>
<div className="drawer-content">
<div className="drawer-top">
<Link href="/" onClick={e=>navigate(e,'/')}>
<Brand/>
</Link>
</div>
<div className="drawer-body">
<nav aria-label="Jelajahi FEB CARE">{items.map(([label,href],i)=>
<Link key={href} href={href} onClick={e=>navigate(e,href)}>
<i className="drawer-divider" aria-hidden="true"/>{i===items.length-1&&<i className="drawer-divider bottom" aria-hidden="true"/>}<span className="drawer-number mono">
<span className="drawer-line">/ 0{i+1}</span>
</span>
<span className="drawer-link-label">
<span className="drawer-line">{label}</span>
</span>
<span className="drawer-arrow">
<Icon name="upRight" size={29}/>
</span>
</Link>)}</nav>
<div className="drawer-aside">
<span className="eyebrow">
<span className="drawer-line">BUILT AROUND YOU.</span>
</span>
<p>
<span className="drawer-line">Suara Mahasiswa,<br/>Aksi Nyata FEB.</span>
</p>
<div className="drawer-auth-actions">
<Link className="drawer-login-button" href={user?'/dashboard':'/masuk'} onClick={e=>navigate(e,user?'/dashboard':'/masuk')}>{user?'Buka ruang kamu':'Masuk'}
</Link>
{!user&&<Link className="drawer-register-button" href="/masuk?register=1" onClick={e=>navigate(e,'/masuk?register=1')}>Daftar</Link>}
</div>
<span className="drawer-note">
<span className="drawer-line">Complaints, Assistance,<br/>Response & Engagement</span>
</span>
</div>
</div>
<div className="drawer-bottom">
<span className="mono">SATU RUANG. BANYAK PERUBAHAN.</span>
<ThemeToggle/>
</div>
</div>
</dialog>
</>;
}
export function Footer(){return <footer className="site-footer">
<div className="footer-top">
<Link href="/">
<Brand/>
</Link>
<p>Suara Mahasiswa,<br/>Aksi Nyata FEB.</p>
<Link href="/lapor" className="text-link">Mari mulai percakapan <Icon name="upRight"/>
</Link>
</div>
<div className="footer-bottom">
<span>© {new Date().getFullYear()} FEB CARE · Fakultas Ekonomi dan Bisnis</span>
<Link href="/#privasi">Privasi & keamanan</Link>
<span>Built around you.</span>
</div>
</footer>;}
export function Orb(){const ref=useRef<HTMLCanvasElement>(null);useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;let frame=0;let raf=0;let active=true;const media=matchMedia('(prefers-reduced-motion: reduce)');let reduced=media.matches;const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(active&&!raf)draw();});const draw=()=>{raf=0;if(active){const dpr=Math.min(devicePixelRatio||1,1.5);const w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=w*dpr;canvas.height=h*dpr;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const scale=Math.min(w,h)*.32,t=reduced?.35:frame*.002;const glow=ctx.createRadialGradient(w*.5,h*.52,0,w*.5,h*.52,scale*1.55);glow.addColorStop(0,'rgba(35,70,245,.18)');glow.addColorStop(.62,'rgba(25,50,170,.06)');glow.addColorStop(1,'rgba(20,35,120,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);const lines=[];for(let j=0;j<60;j++){const v=j/60*Math.PI*2;const points=[];let depth=0;for(let i=0;i<=150;i++){const u=i/150*Math.PI*2;let x=(.94+.36*Math.cos(v+u*3))*Math.cos(u);let y=(.94+.36*Math.cos(v+u*3))*Math.sin(u);let z=.36*Math.sin(v+u*3);const x1=x*Math.cos(t)-z*Math.sin(t),z1=x*Math.sin(t)+z*Math.cos(t);const y1=y*.58-z1*.81,z2=y*.81+z1*.58;const x2=x1*.91-y1*.42,y2=x1*.42+y1*.91;const p=2.8/(2.8-z2*.4);points.push([w*.51+x2*scale*p,h*.50+y2*scale*p]);depth+=z2;}lines.push({points,depth:depth/151});}lines.sort((a,b)=>a.depth-b.depth);for(const line of lines){ctx.beginPath();line.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=`rgba(${80+line.depth*60},${118+line.depth*65},255,${.4+line.depth*.22})`;ctx.lineWidth=1.05;ctx.stroke();}frame++;}if(active&&!reduced)raf=requestAnimationFrame(draw);};const change=()=>{reduced=media.matches;cancelAnimationFrame(raf);raf=0;draw();};const resize=new ResizeObserver(()=>{if(!raf)draw();});resize.observe(canvas);media.addEventListener('change',change);observer.observe(canvas);draw();return()=>{cancelAnimationFrame(raf);observer.disconnect();resize.disconnect();media.removeEventListener('change',change);};},[]);return <canvas ref={ref} className="care-orb" aria-hidden="true"/>;}
export function Reveal(){useEffect(()=>{const elements=document.querySelectorAll('.reveal');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.09});elements.forEach(e=>{if(e.getBoundingClientRect().top>innerHeight)e.classList.add('motion-ready');observer.observe(e);});return()=>{observer.disconnect();elements.forEach(e=>e.classList.remove('motion-ready'));};},[]);return null;}
export function FAQ(){const items=[['Apa saja yang bisa saya sampaikan?','Keluhan, permintaan bantuan, pertanyaan layanan, dan ide perbaikan di lingkungan Fakultas Ekonomi dan Bisnis. Pilih salah satu dari 12 kategori saat mengirim laporan.'],['Apakah identitas saya akan terlihat?','Anda bisa memilih untuk merahasiakan identitas dari unit penanganan, atau mengirim secara anonim tanpa akun. Laporan sensitif hanya tersedia bagi petugas perlindungan yang berwenang.'],['Bagaimana cara memantau laporan?','Setiap laporan memiliki nomor tiket dan kode akses rahasia. Gunakan keduanya di halaman Lacak Laporan. Jika masuk dengan akun, seluruh laporan Anda juga tersedia di dashboard.'],['Berapa lama laporan saya ditangani?','Target respons dan penyelesaian mengikuti kategori serta prioritas laporan. Tenggat terlihat pada detail tiket. Laporan yang melewati tenggat akan masuk antrean eskalasi.'],['Bagaimana jika masalah saya belum selesai?','Sebelum tiket diselesaikan, Anda dapat mengonfirmasi hasil atau meminta tindak lanjut dengan alasan. Riwayat komunikasi dan penanganan tetap tersimpan.']];return <div className="faq-list">{items.map(([q,a],i)=>
<details key={q}>
<summary>
<span className="mono">0{i+1}</span>{q}<Icon name="plus"/>
</summary>
<p>{a}</p>
</details>)}</div>;}
