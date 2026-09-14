'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Lenis from 'lenis';
import {hop} from '@/lib/motion';
let scroller:Lenis|null=null;
export function pausePageScroll(){scroller?.stop();window.dispatchEvent(new CustomEvent('feb-menu-motion',{detail:true}));}
export function resumePageScroll(){scroller?.start();window.dispatchEvent(new CustomEvent('feb-menu-motion',{detail:false}));}
export function scrollToSection(hash:string){let id:string;try{id=decodeURIComponent(hash.slice(1));}catch{return;}const target=document.getElementById(id);if(!target)return;if(scroller){scroller.resize();scroller.scrollTo(target,{duration:1,lerp:0,easing:hop,offset:-95});}else target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
export function SmoothScroll(){const router=useRouter();useEffect(()=>{
 const lenis=new Lenis({autoRaf:true,lerp:.1,smoothWheel:true,syncTouch:false,respectReducedMotion:true,stopInertiaOnNavigate:true,prevent:node=>node.matches('dialog,.sidebar,.table-scroll,.report-review,textarea,select,[data-native-scroll]')});scroller=lenis;
 const anchor=(e:MouseEvent)=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.defaultPrevented)return;const link=(e.target as Element)?.closest<HTMLAnchorElement>('a[href]');if(!link||link.closest('dialog')||link.target||link.hasAttribute('download'))return;const url=new URL(link.href);if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search||!url.hash||url.hash==='#')return;let target:HTMLElement|null;try{target=document.getElementById(decodeURIComponent(url.hash.slice(1)));}catch{return;}if(!target)return;e.preventDefault();router.push(url.pathname+url.search+url.hash,{scroll:false});scrollToSection(url.hash);};
 document.addEventListener('click',anchor,true);
 return()=>{document.removeEventListener('click',anchor,true);lenis.destroy();if(scroller===lenis)scroller=null;};
 },[router]);return null;}
