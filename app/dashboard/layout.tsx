import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/auth';
import {demoEnabled} from '@/lib/db';
import {DashboardShell} from '@/components/dashboard-shell';
import './dashboard-reference.css';
export const dynamic='force-dynamic';
export default async function Layout({children}:{children:React.ReactNode}){const user=await currentUser();if(!user)redirect('/masuk');return <DashboardShell user={user} demo={demoEnabled()}>{children}</DashboardShell>;}
