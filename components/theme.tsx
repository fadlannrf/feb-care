'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {Icon} from './icon';
type Theme='light'|'dark';
const ThemeContext=createContext<{theme:Theme;toggle:()=>void}>({theme:'light',toggle:()=>{}});
export function ThemeProvider({children}:{children:React.ReactNode}){
  const [theme,setTheme]=useState<Theme>('light');
  useEffect(()=>{
    setTheme(document.documentElement.dataset.theme==='dark'?'dark':'light');
    const sync=(e:StorageEvent)=>{if(e.key==='feb-care-theme'){const next=e.newValue==='dark'?'dark':'light';document.documentElement.dataset.theme=next;setTheme(next);}};
    window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
  },[]);
  function toggle(){const next=theme==='light'?'dark':'light';document.documentElement.dataset.theme=next;setTheme(next);try{localStorage.setItem('feb-care-theme',next);}catch{/* Theme still works with storage disabled. */}}
  return <ThemeContext.Provider value={{theme,toggle}}>{children}</ThemeContext.Provider>;
}
export function ThemeToggle(){const {theme,toggle}=useContext(ThemeContext);const label=theme==='light'?'Aktifkan mode dark':'Aktifkan mode light';return <button type="button" className="icon-button theme-toggle" onClick={toggle} aria-label={label} title={label}><span key={theme}><Icon name={theme==='light'?'moon':'sun'} size={18}/></span></button>;}
