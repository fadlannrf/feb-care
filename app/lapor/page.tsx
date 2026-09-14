'use client';
import Link from 'next/link';
import {Suspense,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Header,Footer} from '@/components/public';
import {Icon} from '@/components/icon';
import {api,useApi,ErrorMessage,Notice,Loading} from '@/components/client';
function ReportForm(){const params=useSearchParams();const {data,loading,error:loadError,reload:refreshUser}=useApi('/api/bootstrap');const [step,setStep]=useState(1),[category,setCategory]=useState(params.get('kategori')||''),[title,setTitle]=useState(''),[description,setDescription]=useState(''),[location,setLocation]=useState(''),[priority,setPriority]=useState('normal'),[mode,setMode]=useState(params.get('privasi')==='anonim'?'anonymous':'account'),[confidential,setConfidential]=useState(false),[sensitive,setSensitive]=useState(false),[consent,setConsent]=useState(false),[files,setFiles]=useState<File[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState<any>(null),[failedFiles,setFailedFiles]=useState<File[]>([]),[copied,setCopied]=useState(false);
 const selected=data?.categories.find((c:any)=>c.id===category);const anonymous=mode==='anonymous';function next(){setError('');if(step===1&&!selected){setError('Pilih kategori laporan terlebih dahulu.');return;}if(step===2&&(title.trim().length<8||description.trim().length<30)){setError('Tulis judul minimal 8 karakter dan kronologi minimal 30 karakter.');return;}setStep(step+1);window.scrollTo({top:95,behavior:'smooth'});}
 async function upload(record:any,list:File[]){const failures=[];for(const file of list){const form=new FormData();form.set('file',file);try{await api(`/api/tickets/${record.ticket.id}/attachments`,{method:'POST',headers:{'x-tracking-key':record.accessCode},body:form});}catch{failures.push(file);}}setFailedFiles(failures);}
 async function submit(){if(busy)return;setError('');if(!consent){setError('Setujui penggunaan data untuk penanganan laporan.');return;}if(!anonymous&&!data?.user){setError('Masuk ke akun terlebih dahulu atau pilih Kirim anonim.');return;}setBusy(true);try{const record=await api('/api/tickets',{method:'POST',body:JSON.stringify({title,description,category_id:category,location,priority,anonymous,confidential,sensitive,consent})});setResult(record);await upload(record,files);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 if(loading)return <Loading/>;if(loadError)return <ErrorMessage message={loadError}/>;
 if(result)return <div className="report-success">
<span className="success-emblem">
<Icon name="check" size={38}/>
</span>
<span className="eyebrow">SUARAMU SUDAH SAMPAI.</span>
<h1>Terima kasih<br/>sudah <span className="blue-text">bercerita.</span>
</h1>
<p>Tim FEB CARE akan meninjau laporanmu.<br/>Simpan nomor tiket dan kode akses untuk mengikuti progresnya.</p>
<div className="receipt">
<div>
<small>NOMOR TIKET</small>
<strong>{result.ticket.number}
</strong>
</div>
<div>
<small>KODE AKSES RAHASIA</small>
<strong>{result.accessCode}
</strong>
</div>
<button className="icon-button" aria-label="Salin nomor tiket dan kode" onClick={async()=>{try{await navigator.clipboard.writeText(`${result.ticket.number}\nKode akses: ${result.accessCode}`);setCopied(true);}catch{setError('Penyalinan otomatis gagal. Silakan salin kode yang tampil.');}}}>
<Icon name={copied?'check':'copy'}/>
</button>
</div>
<Notice>Kode ini hanya ditampilkan saat laporan dibuat. Jangan bagikan kepada orang lain.</Notice>{failedFiles.length>0&&<div className="error-message">
<div>Laporan tersimpan, tetapi {failedFiles.length} lampiran belum terunggah.<button className="button secondary" disabled={busy} onClick={async()=>{setBusy(true);await upload(result,failedFiles);setBusy(false);}}>Coba ulang lampiran</button>
</div>
</div>}
<ErrorMessage message={error}/>
<div className="success-actions">
<Link href={`/lacak?nomor=${result.ticket.number}`} className="button primary">Lacak laporan <Icon name="arrow"/>
</Link>{data?.user&&<Link href="/dashboard" className="button secondary">Ke dashboard</Link>}
</div>
</div>;
 return <div className="report-layout">
<aside className="report-intro">
<span className="eyebrow">[ KAMI SIAP MENDENGAR ]</span>
<h1>Ceritamu <br/>
<span className="blue-text">berarti.</span>
</h1>
<p>Sampaikan dengan tenang. <br/>Kami bantu menghubungkan <br/>suaramu dengan langkah nyata.</p>
<div className="form-stepper">{['Pilih ruang ceritamu','Sampaikan detailnya','Tinjau & kirim'].map((label,i)=>
<div key={label} className={step===i+1?'current':step>i+1?'completed':''}>
<span>{step>i+1?<Icon name="check" size={14}/>:String(i+1).padStart(2,'0')}
</span>
<div>
<small>LANGKAH {i+1}
</small>
<strong>{label}
</strong>
</div>
</div>)}
</div>
<div className="intro-help">
<Icon name="shield" size={25}/>
<p>Untuk laporan sensitif, akses otomatis dibatasi ke tim perlindungan mahasiswa.</p>
</div>
</aside>
<section className="report-form-card">
<div className="form-card-heading">
<span className="mono">0{step} / 03</span>
<span className="muted">Formulir laporan</span>
</div>{step===1?<>
<h2>Apa yang ingin<br/>kamu sampaikan?</h2>
<p className="form-description">Pilih kategori yang paling sesuai dengan ceritamu.</p>
<div className="category-picker">{data.categories.map((c:any)=>
<button key={c.id} type="button" className={category===c.id?'selected':''} onClick={()=>setCategory(c.id)}>
<Icon name={c.icon} size={23}/>
<span>{c.name}
</span>{category===c.id?<Icon name="check" size={15}/>:<Icon name="chevron" size={14}/>}
</button>)}
</div>
</>:step===2?<>
<h2>Ruang untuk<br/>cerita lengkapmu.</h2>
<p className="form-description">Detail yang jelas membantu kami menindaklanjuti.</p>
<div className="stack-form">
<label>Judul laporan <span>*</span>
<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={160} placeholder="Contoh: Jadwal kuliah bertabrakan dengan praktikum"/>
</label>
<label>Kronologi / detail laporan <span>*</span>
<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={6} maxLength={10000} placeholder="Ceritakan apa yang terjadi, kapan, serta bantuan atau perubahan yang kamu harapkan."/>
<small className="field-hint">Minimal 30 karakter · {description.length}/10.000</small>
</label>
<div className="form-two">
<label>Lokasi <small>(opsional)</small>
<input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Gedung / ruang / layanan" maxLength={200}/>
</label>
<label>Tingkat urgensi<select value={priority} onChange={e=>setPriority(e.target.value)}>
<option value="normal">Normal</option>
<option value="high">Tinggi</option>
<option value="urgent">Mendesak</option>
</select>
</label>
</div>{priority==='urgent'&&<Notice>Untuk bahaya yang sedang berlangsung, hubungi petugas keamanan atau layanan darurat setempat secara langsung. Form ini tidak dipantau sebagai layanan darurat real-time.</Notice>}
<label className="upload-zone">
<Icon name="upload" size={25}/>
<strong>Tambahkan bukti pendukung</strong>
<span>JPG, PNG, WebP, PDF · maksimal 10 MB/file · 5 file</span>
<input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>{const list=Array.from(e.target.files||[]);if(list.some(f=>f.size>10*1024*1024)||list.length>5){setError('Pilih maksimal 5 file, masing-masing maksimal 10 MB.');e.target.value='';return;}setFiles(list);setError('');}}/>
</label>{files.map((f,i)=>
<div className="file-chip" key={i}>
<Icon name="file" size={16}/>{f.name}
<button aria-label={`Hapus ${f.name}`} onClick={()=>setFiles(files.filter((_,j)=>i!==j))}>
<Icon name="close" size={15}/>
</button>
</div>)}
<label className="check-label">
<input type="checkbox" checked={sensitive} onChange={e=>setSensitive(e.target.checked)}/>
<span>Laporan ini memuat kekerasan, diskriminasi, atau informasi sensitif.</span>
</label>
</div>
</>:<>
<h2>Satu langkah<br/>menuju perubahan.</h2>
<p className="form-description">Periksa ceritamu dan pilih cara mengirimnya.</p>
<div className="report-review">
<span className="category-pill">{selected?.name}
</span>
<h3>{title}
</h3>
<p>{description}
</p>
<small>{location||'Lokasi tidak dicantumkan'} · {files.length} lampiran</small>
</div>
<div className="reporter-identity">
<Icon name={anonymous?'shield':'users'} size={21}/>
<div>
<small>IDENTITAS PELAPOR</small>
<strong>{anonymous?'Tidak dicantumkan':data?.user?.name||'Masuk diperlukan'}</strong>
<span>{anonymous?'Laporan anonim — lacak dengan nomor tiket dan kode akses.':data?.user?[data.user.email,data.user.student_number&&`NIM ${data.user.student_number}`,data.user.study_program].filter(Boolean).join(' · '):'Pilih akun atau kirim secara anonim.'}</span>
</div>
</div>
<div className="privacy-options">
<button className={!anonymous?'selected':''} onClick={()=>setMode('account')}>
<Icon name="users"/>
<strong>Dengan akun</strong>
<small>{data?.user?data.user.name:'Riwayat tersimpan di dashboard'}
</small>
</button>
<button className={anonymous?'selected':''} onClick={()=>setMode('anonymous')}>
<Icon name="shield"/>
<strong>Kirim anonim</strong>
<small>Lacak dengan kode akses rahasia</small>
</button>
</div>{!anonymous&&!data?.user&&<Notice>
<Link href="/masuk" target="_blank" rel="noopener">Masuk di tab baru</Link>, lalu <button className="link-button" onClick={refreshUser}>perbarui sesi</button> sebelum melanjutkan. Anda juga bisa memilih pengiriman anonim.</Notice>}{!anonymous&&data?.user&&<label className="check-label">
<input type="checkbox" checked={confidential} onChange={e=>setConfidential(e.target.checked)}/>
<span>Rahasiakan identitas saya dari unit penanganan.</span>
</label>}
<label className="check-label consent">
<input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>
<span>Saya menyatakan informasi ini disampaikan dengan itikad baik dan menyetujui penggunaan data serta bukti oleh petugas berwenang untuk penanganan laporan.</span>
</label>
</>}
<ErrorMessage message={error}/>
<div className="form-navigation">{step>1?<button className="button ghost" onClick={()=>{setStep(step-1);setError('');}} disabled={busy}>
<Icon name="arrow" className="rotate-back" size={17}/> Kembali</button>:<span className="field-hint">Semua suara berarti.</span>}{step<3?<button className="button primary" onClick={next}>Lanjutkan <Icon name="arrow" size={18}/>
</button>:<button className="button primary" disabled={busy} onClick={submit}>{busy?'Mengirim…':'Kirim laporan'}
<Icon name="upRight" size={18}/>
</button>}
</div>
</section>
</div>;
}
export default function ReportPage(){return <>
<Header/>
<main className="public-workspace">
<Suspense fallback={<Loading/>}>
<ReportForm/>
</Suspense>
</main>
<Footer/>
</>;}
