export const categories = [
 {id:'akademik',name:'Akademik & perkuliahan',icon:'book',description:'Kegiatan perkuliahan dan kebutuhan akademik.'},
 {id:'pembelajaran',name:'Dosen & pembelajaran',icon:'users',description:'Pengalaman belajar dan layanan dosen.'},
 {id:'studi',name:'KRS, nilai & skripsi',icon:'file',description:'Rencana studi, penilaian, jadwal, dan tugas akhir.'},
 {id:'keuangan',name:'UKT & beasiswa',icon:'wallet',description:'Pembiayaan studi, beasiswa, dan KIP Kuliah.'},
 {id:'fasilitas',name:'Fasilitas kampus',icon:'building',description:'Ruang kelas, perpustakaan, dan fasilitas belajar.'},
 {id:'teknologi',name:'Sistem informasi & IT',icon:'laptop',description:'Akun, koneksi internet, dan layanan digital.'},
 {id:'kemahasiswaan',name:'Kemahasiswaan & organisasi',icon:'users',description:'Kegiatan, organisasi, dan pengembangan diri.'},
 {id:'administrasi',name:'Administrasi & pelayanan',icon:'file',description:'Surat, dokumen, dan pelayanan fakultas.'},
 {id:'sarana',name:'Sarana & prasarana',icon:'building',description:'Akses, transportasi, dan lingkungan kampus.'},
 {id:'etika',name:'Etika & perlindungan',icon:'shield',description:'Diskriminasi, kekerasan, dan pelanggaran etika.'},
 {id:'aspirasi',name:'Aspirasi & inovasi',icon:'spark',description:'Ide untuk fakultas yang lebih baik.'},
 {id:'mendesak',name:'Penanganan segera',icon:'alert',description:'Laporan yang memerlukan respons prioritas.'}
];
export const statuses:Record<string,{label:string;color:string}>={received:{label:'Diterima',color:'amber'},verified:{label:'Diverifikasi',color:'blue'},assigned:{label:'Ditugaskan',color:'blue'},in_progress:{label:'Ditindaklanjuti',color:'purple'},needs_info:{label:'Butuh informasi',color:'amber'},awaiting_confirmation:{label:'Selesai (menunggu konfirmasi)',color:'teal'},resolved:{label:'Selesai',color:'green'},rejected:{label:'Ditolak',color:'red'},closed:{label:'Ditutup',color:'gray'}};
export const roles:Record<string,string>={student:'Mahasiswa',triage:'Petugas FEB CARE',unit:'Petugas unit',specialist:'Petugas perlindungan',leader:'Pimpinan FEB',admin:'Administrator'};
export const studyPrograms=['Manajemen','Akuntansi','Ekonomi Pembangunan','Ekonomi Syariah','Lainnya'] as const;
export type User={id:string;name:string;email:string;role:string;unit_id:string|null;student_number:string|null;study_program:string|null;cohort_year:number|null;phone:string|null;active:boolean};
export type Ticket={id:string;number:string;title:string;description:string;category_id:string;category_name:string;status:string;priority:string;sensitive:boolean;confidential:boolean;location:string;reporter_id:string|null;reporter_name?:string;unit_id:string|null;unit_name?:string;created_at:string;updated_at:string;due_at:string;resolved_at:string|null;version:number;rating:number|null;escalated:boolean};
export const closedStatuses=['resolved','rejected','closed'];
export function formatDate(value:string|Date,short=false){return new Intl.DateTimeFormat('id-ID',{day:'numeric',month:short?'short':'long',...(short?{}:{year:'numeric'})}).format(new Date(value));}
export function relativeDate(value:string){const hours=Math.max(0,Math.floor((Date.now()-new Date(value).getTime())/3600000));return hours<1?'Baru saja':hours<24?`${hours} jam lalu`:`${Math.floor(hours/24)} hari lalu`;}
