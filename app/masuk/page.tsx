'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Brand,Icon} from '@/components/icon';
import {Orb} from '@/components/public';
import {api,useApi,ErrorMessage} from '@/components/client';
import {roles,studyPrograms} from '@/lib/shared';
import {ThemeToggle} from '@/components/theme';

const cohortYears=Array.from({length:9},(_,index)=>new Date().getFullYear()-index);

export default function Login(){
 const router=useRouter();
 const {data}=useApi('/api/bootstrap');
 const [register,setRegister]=useState(false),[privacyOpen,setPrivacyOpen]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState('');
 const closeButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(new URLSearchParams(window.location.search).get('register')==='1')setRegister(true);},[]);
 useEffect(()=>{if(privacyOpen){closeButton.current?.focus();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};}},[privacyOpen]);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy('form');setError('');
  const values=Object.fromEntries(new FormData(e.currentTarget));
  try{await api(`/api/auth/${register?'register':'login'}`,{method:'POST',body:JSON.stringify(values)});router.push('/dashboard');router.refresh();}
  catch(e){setError((e as Error).message);setBusy('');}
 }
 async function demo(role:string){
  setBusy(role);setError('');
  try{await api('/api/auth/demo',{method:'POST',body:JSON.stringify({role})});router.push('/dashboard');router.refresh();}
  catch(e){setError((e as Error).message);setBusy('');}
 }
 function toggleRegister(){const next=!register;setRegister(next);setError('');setPrivacyOpen(next);}
 return <main className="auth-layout">
  <section className="auth-story">
   <Link href="/"><Brand/></Link>
   <div className="auth-story-body"><span className="eyebrow">SATU RUANG. BANYAK PERUBAHAN.</span><h1>Hal baik<br/>dimulai dari<br/><span className="blue-text">suaramu.</span></h1><p>Masuk untuk menyampaikan aspirasi,<br/>memantau laporan, dan menjadi bagian<br/>dari perubahan di FEB.</p><Orb/></div>
   <span className="mono auth-copyright">FEB CARE · STUDENT-CENTERED FACULTY</span>
  </section>
  <section className="auth-form-panel">
   <div className="auth-theme"><ThemeToggle/></div>
   <Link href="/" className="auth-back"><Icon name="arrow" className="rotate-back" size={17}/> Kembali ke beranda</Link>
   <div className="auth-form-content">
    <span className="eyebrow">[ RUANG KAMU ]</span>
    <h2>{register?'Mari bergabung.':'Selamat datang di ruang masuk FebCare'}</h2>
    <p>{register?'Lengkapi identitas akademik agar laporanmu tercatat dengan tepat.':'Lanjutkan langkah baikmu bersama FEBCARE.'}</p>
    <form onSubmit={submit} className={`stack-form ${register?'registration-form':''}`}>
     {register&&<>
      <label>Nama lengkap<input name="name" autoComplete="name" placeholder="Nama sesuai identitas mahasiswa" minLength={2} maxLength={100} required/></label>
      <div className="form-two">
       <label>NIM<input name="student_number" inputMode="numeric" autoComplete="off" placeholder="Nomor induk mahasiswa" minLength={5} maxLength={30} required/></label>
       <label>Angkatan<select name="cohort_year" defaultValue="" required><option value="" disabled>Pilih tahun</option>{cohortYears.map(year=><option key={year} value={year}>{year}</option>)}</select></label>
      </div>
      <label>Program studi<select name="study_program" defaultValue="" required><option value="" disabled>Pilih program studi</option>{studyPrograms.map(program=><option key={program} value={program}>{program}</option>)}</select></label>
      <label>Nomor WhatsApp<input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Contoh: 081234567890" minLength={9} maxLength={20} required/><small className="field-hint">Untuk verifikasi dan informasi penting terkait laporan.</small></label>
     </>}
     <label>Email<input name="email" type="email" autoComplete="email" placeholder="nama@email.ac.id" required/></label>
     <label>Kata sandi<input name="password" type="password" autoComplete={register?'new-password':'current-password'} placeholder="Minimal 12 karakter" minLength={12} maxLength={128} required/></label>
     <ErrorMessage message={error}/>
     <button className="button primary full" disabled={!!busy}>{busy==='form'?'Sebentar…':register?'Buat akun mahasiswa':'Masuk ke FEB CARE'}<Icon name="arrow"/></button>
    </form>
    <p className="auth-switch">{register?'Sudah punya akun?':'Belum punya akun?'} <button onClick={toggleRegister}>{register?'Masuk':'Daftar sekarang'}</button></p>
    {data?.demo&&<div className="demo-access"><div className="demo-label"><span>JELAJAHI DEMO</span><span>Data simulasi</span></div><div className="demo-roles">{Object.entries(roles).map(([role,name])=><button key={role} disabled={!!busy} onClick={()=>demo(role)}><Icon name={role==='student'?'book':role==='leader'?'chart':role==='admin'?'settings':role==='specialist'?'shield':'users'} size={17}/><span>{busy===role?'Membuka…':name}</span><Icon name="upRight" size={13}/></button>)}</div></div>}
    <div className="auth-note"><Icon name="lock" size={14}/> Akses aman, sesuai peranmu.</div>
   </div>
  </section>
  {privacyOpen&&createPortal(<div className="privacy-reassurance-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setPrivacyOpen(false);}} onKeyDown={e=>{if(e.key==='Escape')setPrivacyOpen(false);}}>
   <section className="privacy-reassurance" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
    <button ref={closeButton} className="privacy-close" aria-label="Tutup pemberitahuan" onClick={()=>setPrivacyOpen(false)}><Icon name="close" size={19}/></button>
    <span className="privacy-emblem"><Icon name="shield" size={28}/></span>
    <span className="eyebrow">[ PRIVASIMU PENTING ]</span>
    <h3 id="privacy-title">Tenang, data akunmu tetap aman. 😊</h3>
    <p>Data hanya digunakan sesuai kebutuhan layanan dan diakses berdasarkan kewenangan. Jika laporanmu sensitif, kamu dapat menyembunyikan identitas dari unit penanganan atau memilih melapor secara anonim.</p>
    <strong>Kamu tetap memegang kendali atas privasimu.</strong>
    <button className="button primary full" onClick={()=>setPrivacyOpen(false)}>Baik, saya mengerti <Icon name="check" size={17}/></button>
   </section>
  </div>,document.body)}
 </main>;
}
