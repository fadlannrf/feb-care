'use client';
import Link from 'next/link';
import {useSession} from '@/components/dashboard-shell';
import {useApi,Loading,ErrorMessage} from '@/components/client';
import {StatCards,TrendChart,Distribution} from '@/components/analytics';
import {TicketTable} from '@/components/ticket-table';
import {Icon} from '@/components/icon';

export default function Dashboard(){
 const {user,demo}=useSession();
 const aggregate=['leader','admin'].includes(user.role),student=user.role==='student';
 const {data:metrics,loading,error,reload}=useApi('/api/metrics');
 const {data:list,error:listError}=useApi(aggregate?null:'/api/tickets');
 if(loading)return <Loading/>;
 if(error)return <><ErrorMessage message={error}/><button className="button secondary" onClick={reload}>Coba lagi</button></>;
 return <>
  <div className="page-heading">
   <div>
    <h1>{aggregate?'Setiap suara, terukur.':`Halo, ${user.name.split(' ')[0]}.`} <span className="greeting-star">✦</span></h1>
    <p>{aggregate?'Gambaran layanan, progres penanganan, dan ruang untuk perbaikan.':student?'Ini perjalanan suaramu. Mari buat perubahan berikutnya.':'Mari ubah laporan yang masuk menjadi langkah nyata.'}</p>
   </div>
   {student?<Link className="button primary" href="/lapor"><Icon name="plus" size={17}/> Buat laporan</Link>:<Link className="button secondary" href={aggregate?'/dashboard/analitik':'/dashboard/laporan'}>{aggregate?'Lihat analitik':'Buka antrean'}<Icon name="upRight" size={17}/></Link>}
  </div>
  <div className="dashboard-welcome">
   <div><span className="eyebrow">{aggregate?'LISTEN. RESPOND. MAKE A DIFFERENCE.':'YOUR VOICE MAKES A DIFFERENCE.'}</span><h2>{aggregate?<>Pelayanan yang lebih baik,<br/>dimulai dari <span>data yang berarti.</span></>:<>Suaramu punya tempat.<br/><span>Dan kami siap mendengarkan.</span></>}</h2><Link href={aggregate?'/dashboard/analitik':'/lapor'}>{aggregate?'Jelajahi data layanan':'Sampaikan hal yang berarti'} <Icon name="arrow" size={17}/></Link></div><div className="welcome-art" aria-hidden="true">✳<span>CARE<br/>IN ACTION.</span></div>
  </div>
  <div className="section-bar"><h3>{student?'Aktivitas laporanmu':'Kinerja layanan'}</h3><span className="period-label"><Icon name="clock" size={14}/>30 hari terakhir{demo?' · Data demo':''}</span></div>
  <StatCards totals={metrics?.totals||{}} student={student}/>
  <div className="dashboard-charts"><section className="panel"><div className="panel-title"><h3>{student?'Perjalanan suara kamu':'Tren laporan'}</h3><span className="mono">30 HARI</span></div><TrendChart trend={metrics?.trend||[]}/></section><section className="panel"><div className="panel-title"><h3>Ruang yang dibicarakan</h3><Icon name="chart" size={17}/></div><Distribution items={metrics?.distribution||[]}/></section></div>
  {!aggregate?<section className="panel table-panel"><div className="panel-title"><div><h3>Laporan terbaru</h3><p>Setiap laporan punya perjalanan.</p></div><Link className="subtle-link" href="/dashboard/laporan">Lihat semua <Icon name="arrow" size={15}/></Link></div><ErrorMessage message={listError}/><TicketTable tickets={list?.tickets.slice(0,5)||[]}/></section>:<section className="panel"><div className="panel-title"><h3>Perhatian hari ini</h3><span className="badge amber">{metrics?.totals.overdue} melewati target</span></div><p className="attention-copy">Pantau unit yang membutuhkan dukungan dan evaluasi target penyelesaian melalui analitik layanan. Dashboard pimpinan menyajikan angka agregat tanpa membuka identitas atau isi laporan.</p><Link className="text-link" href="/dashboard/analitik">Lihat kinerja per unit <Icon name="arrow" size={16}/></Link></section>}
 </>;
}
