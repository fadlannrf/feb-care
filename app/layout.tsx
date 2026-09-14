import type { Metadata } from 'next';
import './globals.css';
import './themes.css';
import './interactions.css';
import 'lenis/dist/lenis.css';
import './reference-motion.css';
import './rating.css';
import './report-identity.css';
import './auth-registration.css';
import {ThemeProvider} from '@/components/theme';
import {SmoothScroll} from '@/components/smooth-scroll';
import {PageMotion} from '@/components/page-motion';
export const metadata: Metadata = {title:{default:'FEB CARE — Suara Mahasiswa, Aksi Nyata FEB.',template:'%s · FEB CARE'},description:'Satu ruang untuk aspirasi, bantuan, dan pengaduan mahasiswa Fakultas Ekonomi dan Bisnis.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="id" data-theme="light" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{document.documentElement.dataset.theme=localStorage.getItem('feb-care-theme')==='dark'?'dark':'light'}catch(e){}"}}/></head><body><ThemeProvider><SmoothScroll/><PageMotion>{children}</PageMotion></ThemeProvider></body></html>;}
