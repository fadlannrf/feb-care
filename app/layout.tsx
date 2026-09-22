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
import Script from 'next/script';
export const metadata: Metadata = {title:{default:'FEB CARE — Suara Mahasiswa, Aksi Nyata FEB.',template:'%s · FEB CARE'},description:'Satu ruang untuk aspirasi, bantuan, dan pengaduan mahasiswa Fakultas Ekonomi dan Bisnis.',robots:{index:false,follow:false},icons:{icon:[{url:'/favicon.png',type:'image/png'},{url:'/favicon.svg',type:'image/svg+xml'}],shortcut:'/favicon.png',apple:'/favicon.png'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="id" data-theme="light" suppressHydrationWarning><head><Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{__html:"try{document.documentElement.dataset.theme=localStorage.getItem('feb-care-theme')==='dark'?'dark':'light'}catch(e){}"}}/></head><body><ThemeProvider><SmoothScroll/><PageMotion>{children}</PageMotion></ThemeProvider></body></html>;}
