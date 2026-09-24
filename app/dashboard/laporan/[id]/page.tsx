'use client';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useApi,Loading,ErrorMessage} from '@/components/client';
import {TicketDetail} from '@/components/ticket-detail';
import {Icon} from '@/components/icon';
export default function Detail(){const {id}=useParams();const {data,loading,error,reload}=useApi(`/api/tickets/${id}`);const {data:bootstrap}=useApi('/api/bootstrap');return <><Link href="/dashboard/laporan" className="back-link"><Icon name="arrow" className="rotate-back" size={16}/> Kembali ke laporan</Link><ErrorMessage message={error}/>{loading&&!data?<Loading/>:data&&<TicketDetail data={data} reload={reload} units={bootstrap?.units||[]} user={bootstrap?.user}/>}</>;}
