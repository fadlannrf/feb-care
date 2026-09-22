import Link from 'next/link';
import {Header,Footer,FAQ,Reveal} from '@/components/public';
import {Icon} from '@/components/icon';
import {WorkflowHero} from '@/components/workflow-hero';
import {categories} from '@/lib/shared';

const processSteps=[
  {n:'01',title:'Ceritakan',text:'Pilih kategori, tulis ceritamu, dan tambahkan bukti jika ada.',icon:'message'},
  {n:'02',title:'Kami verifikasi',text:'Tim FEB CARE meninjau laporan dan menghubungkannya ke unit terkait.',icon:'search'},
  {n:'03',title:'Ditindaklanjuti',text:'Pantau perkembangan dan diskusikan solusi dalam satu tiket.',icon:'refresh'},
  {n:'04',title:'Ada penyelesaian',text:'Konfirmasi hasil penanganan dan bagikan penilaianmu.',icon:'check'},
];

export default function Home(){return <>
  <Header/>
  <main>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="pulse-dot"/> RUANG ASPIRASI MAHASISWA FEB</div>
        <h1>
          <span className="hero-line"><span>Suara kamu.</span></span>
          <span className="hero-line"><span>Perubahan</span></span>
          <span className="hero-line"><span className="blue-text">nyata.</span></span>
        </h1>
        <p>Setiap suara layak didengar.<br/>Sampaikan, pantau, dan wujudkan kampus<br className="desktop-only"/> yang lebih baik. Bersama FEB CARE.</p>
        <div className="hero-actions">
          <Link href="/lapor" className="button primary">Sampaikan laporan <span><Icon name="upRight"/></span></Link>
          <Link href="/lacak" className="button ghost">Lacak laporan <Icon name="arrow"/></Link>
        </div>
        <div className="hero-assurance"><Icon name="shield" size={17}/> Identitas terlindungi. Proses transparan.</div>
      </div>
      <div className="hero-art"><WorkflowHero/></div>
      <div className="hero-bottom">
        <span className="mono">COMPLAINTS. ASSISTANCE. RESPONSE. ENGAGEMENT.</span>
        <a href="#layanan" className="scroll-label">Scroll untuk mengenal kami <span>↓</span></a>
      </div>
    </section>

    <div className="values-strip">
      <span><Icon name="shield"/> Ruang yang aman</span><span><Icon name="eye"/> Progres yang transparan</span>
      <span><Icon name="message"/> Komunikasi dua arah</span><span><Icon name="spark"/> Perubahan yang berarti</span>
    </div>

    <section id="tentang" className="about-section reveal">
      <div className="about-media">
        <img src="/images/feb-care-team.jpg" alt="Pimpinan dan sivitas akademika FEB USU" loading="lazy" />
        <span className="about-media-label mono">FEB CARE · SUARA MAHASISWA</span>
      </div>
      <div className="about-copy">
        <span className="eyebrow">[ TENTANG FEB CARE ]</span>
        <h2>Satu ruang untuk<br/><span>didengar dan ditindaklanjuti.</span></h2>
        <p>FEB CARE adalah ruang resmi Fakultas Ekonomi dan Bisnis USU untuk menyampaikan aspirasi, laporan, pertanyaan layanan, dan ide perbaikan dengan aman.</p>
        <p>Setiap laporan diterima, ditinjau, dan diteruskan kepada unit yang tepat. Kamu dapat memantau prosesnya sampai ada penyelesaian yang jelas.</p>
        <div className="about-points"><span><Icon name="shield" size={17}/> Identitas terlindungi</span><span><Icon name="check" size={17}/> Penanganan terarah</span><span><Icon name="eye" size={17}/> Proses transparan</span></div>
        <div className="about-leaders" aria-label="Pimpinan Fakultas Ekonomi dan Bisnis USU">
          <div><strong>Dr. Abdillah Arif Nasution, S.E., M.Si., Ak., CA., QGIA., CHRS</strong><span>Dekan FEB USU</span></div>
          <div><strong>Prof. Dr. Arlina Nurbaiti Lubis, S.E., MBA</strong><span>Wakil Dekan I</span></div>
          <div><strong>Dr. Inneke Qamariah, S.E., M.Si.</strong><span>Wakil Dekan II</span></div>
          <div><strong>Inggrita Gusti Sari Nasution, S.E., M.Si.</strong><span>Wakil Dekan III</span></div>
        </div>
      </div>
    </section>

    <section id="layanan" className="section services">
      <div className="section-head reveal"><span className="eyebrow">[ 01 — KAMI MENDENGARKAN ]</span><div><h2>Apa pun ceritanya,<br/>ada ruang <span className="muted">di sini.</span></h2><p>Dari urusan perkuliahan hingga ide untuk masa depan.<br/>Satu pintu untuk hal-hal yang penting bagi kamu.</p></div></div>
      <div className="category-grid">{categories.slice(0,6).map((category,index)=><Link key={category.id} href={`/lapor?kategori=${category.id}`} className="category-card reveal"><div className="card-top"><Icon name={category.icon} size={29}/><span className="mono">0{index+1}</span></div><h3>{category.name}</h3><p>{category.description}</p><span className="card-arrow"><Icon name="upRight"/></span></Link>)}</div>
      <details className="more-categories"><summary>Jelajahi 6 layanan lainnya <Icon name="plus" size={17}/></summary><div className="category-grid">{categories.slice(6).map(category=><Link key={category.id} href={`/lapor?kategori=${category.id}`} className="category-card"><Icon name={category.icon} size={28}/><h3>{category.name}</h3><p>{category.description}</p><span className="card-arrow"><Icon name="upRight"/></span></Link>)}</div></details>
    </section>

    <section className="statement-section reveal"><span className="eyebrow">BUKAN SEKADAR DIDENGAR.</span><h2>Suara Mahasiswa,<br/><span>Aksi Nyata FEB.</span></h2><div className="statement-bottom"><p>Kampus yang lebih baik dimulai dari<br/>percakapan yang terbuka. Dan kami<br/>di sini untuk memulainya denganmu.</p></div></section>

    <section id="alur" className="section process">
      <div className="section-head reveal"><span className="eyebrow">[ 02 — DARI SUARA KE AKSI ]</span><div><h2>Jelas prosesnya.<br/><span className="muted">Terlihat progresnya.</span></h2><p>Kamu tidak perlu bertanya-tanya. Ikuti perjalanan<br/>laporanmu, dari awal hingga mendapat penyelesaian.</p></div></div>
      <div className="process-grid">{processSteps.map(step=><div className="process-step reveal" key={step.n}><div className="process-number"><span>{step.n}</span><Icon name={step.icon} size={23}/></div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div>
      <Link href="/lacak" className="text-link">Sudah punya tiket? Lihat progresnya <Icon name="arrow"/></Link>
    </section>

    <section id="privasi" className="privacy-section reveal"><div className="privacy-mark"><Icon name="shield" size={100}/><span className="mono">SAFE SPACE, ALWAYS.</span></div><div><span className="eyebrow">[ KEPERCAYAAN ITU PENTING ]</span><h2>Berani bicara.<br/>Tetap <span className="blue-text">terjaga.</span></h2><p>Kamu menentukan cara berbagi. Identitas bisa dirahasiakan, bukti hanya diakses petugas berwenang, dan setiap langkah penanganan memiliki jejak yang jelas.</p><div className="privacy-points"><span><Icon name="check"/> Pilihan laporan anonim</span><span><Icon name="check"/> Akses berdasarkan peran</span><span><Icon name="check"/> Jalur khusus laporan sensitif</span></div><Link href="/lapor?privasi=anonim" className="text-link">Sampaikan dengan aman <Icon name="upRight"/></Link></div></section>
    <section id="faq" className="section faq-section"><div className="reveal"><span className="eyebrow">[ 03 — SEBELUM KAMU MULAI ]</span><h2>Masih ada<br/><span className="muted">pertanyaan?</span></h2><p>Beberapa hal yang mungkin<br/>ingin kamu ketahui.</p></div><FAQ/></section>
    <section className="closing-cta reveal"><span className="eyebrow">PERUBAHAN DIMULAI DARI SATU SUARA.</span><Link href="/lapor"><h2>Giliran <span>kamu.</span></h2><span className="closing-arrow"><Icon name="upRight" size={52}/></span></Link></section>
  </main>
  <Footer/>
  <Reveal/>
</>;}
