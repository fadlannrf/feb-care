'use client';
import { useState } from 'react';
import { api, Badge, ErrorMessage, Notice } from './client';
import { Icon } from './icon';
import { formatDate, statuses } from '@/lib/shared';
const nextStatuses: Record<string, string[]> = { received: ['verified', 'needs_info', 'rejected'], verified: ['assigned', 'needs_info', 'rejected'], assigned: ['in_progress', 'needs_info'], in_progress: ['needs_info', 'awaiting_confirmation'], needs_info: ['verified', 'in_progress', 'rejected'] };
export function TicketDetail({ data, reload, accessKey = '', units = [], user }: {
    data: any;
    reload: () => Promise<void>;
    accessKey?: string;
    units?: any[];
    user?: any;
}) {
    const { ticket: t, events, attachments, owner, staff } = data;
    const canAssign = user?.role === 'leader' || user?.role === 'admin';
    const [message, setMessage] = useState(''), [internal, setInternal] = useState(false), [next, setNext] = useState(''), [unit, setUnit] = useState(t.unit_id || ''), [reason, setReason] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false), [rating, setRating] = useState(t.rating || 0), [feedback, setFeedback] = useState(''), [saved, setSaved] = useState(Boolean(t.rating)), [celebrating, setCelebrating] = useState(false);
    const headers: Record<string, string> = accessKey ? { 'x-tracking-key': accessKey } : {};
    const closed = ['resolved', 'rejected', 'closed'].includes(t.status);
    async function send() { if (!message.trim())
        return; setBusy(true); setError(''); try {
        await api(`/api/tickets/${t.id}/messages`, { method: 'POST', headers, body: JSON.stringify({ message, internal }) });
        setMessage('');
        await reload();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function change(status: string) { setBusy(true); setError(''); try {
        await api(`/api/tickets/${t.id}`, { method: 'PATCH', headers, body: JSON.stringify({ status, reason: reason || (status === 'resolved' ? 'Pelapor mengonfirmasi bahwa laporan telah terselesaikan.' : ''), unit_id: unit, version: t.version }) });
        setNext('');
        setReason('');
        await reload();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function uploadAttachment(file: File) { if (uploading)
        return; if (file.size > 10 * 1024 * 1024) {
        setError('Ukuran lampiran maksimal 10 MB.');
        return;
    } setUploading(true); setError(''); try {
        const form = new FormData();
        form.set('file', file);
        await api(`/api/tickets/${t.id}/attachments`, { method: 'POST', headers, body: form });
        await reload();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setUploading(false);
    } }
    async function download(file: any) { setError(''); try {
        const r = await fetch(`/api/attachments/${file.id}`, { headers });
        if (!r.ok)
            throw new Error('Lampiran tidak dapat diunduh.');
        const url = URL.createObjectURL(await r.blob());
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    catch (e) {
        setError((e as Error).message);
    } }
    return <>{celebrating && <div className="rating-celebration" role="status" aria-live="polite">
<div className="rating-celebration-card">
<div className="rating-celebration-mark">
<Icon name="check" size={30}/>
</div>
<span className="eyebrow">PENILAIAN TERSIMPAN</span>
<h2>Terima kasih sudah berbagi.</h2>
<p>Suaramu membantu FEB CARE terus menjadi lebih baik.</p>
</div>
</div>}<div className="detail-heading">
<div>
<div className="detail-meta">
<span className="mono">{t.number}</span>
<Badge status={t.status}/>{t.sensitive && <span className="badge red">
<Icon name="lock" size={12}/>Terbatas</span>}</div>
<h1>{t.title}</h1>
<p>{t.category_name} <span>·</span> Dibuat {formatDate(t.created_at)}</p>
</div>
<button onClick={reload} className="icon-button" aria-label="Muat ulang laporan">
<Icon name="refresh" size={18}/>
</button>
</div>
<ErrorMessage message={error}/>
<div className="detail-grid">
<div className="detail-main">
<section className="panel">
<div className="panel-title">
<h3>Detail laporan</h3>
<span className="mono">01</span>
</div>
<p className="report-body">{t.description}</p>{t.location && <div className="detail-location">
<Icon name="building" size={16}/>{t.location}</div>}{attachments.length > 0 && <div className="attachments">
<h4>Lampiran laporan</h4>{attachments.map((f: any) => <button onClick={() => download(f)} key={f.id}>
<Icon name="file" size={19}/>
<span>{f.name}<small>{(f.size / 1024).toFixed(0)} KB</small>
</span>
<Icon name="download" size={17}/>
</button>)}</div>}{staff && !closed && <div className="attachment-upload">
<h4>Tambah bukti penanganan</h4>
<p>Unggah foto atau dokumen yang membuktikan tindak lanjut laporan.</p>
<label className="upload-zone staff-upload">
<Icon name="upload" size={22}/>
<strong>{uploading ? 'Mengunggah…' : 'Unggah bukti penanganan'}</strong>
<span>JPG, PNG, WebP, PDF · maksimal 10 MB/file</span>
<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={uploading} onChange={e => { const file = e.target.files?.[0]; if (file)
    void uploadAttachment(file); e.currentTarget.value = ''; }}/>
</label>
</div>}</section>
<section className="panel">
<div className="panel-title">
<h3>Perjalanan laporanmu</h3>
<span className="mono">02</span>
</div>
<div className="event-timeline">{events.map((e: any) => <div className={`event ${e.internal ? 'internal' : ''}`} key={e.id}>
<span className={`event-dot ${e.status === 'resolved' ? 'green' : ''}`}>{e.kind === 'message' ? <Icon name="message" size={12}/> : <Icon name="check" size={12}/>}</span>
<div className="event-top">
<strong>{e.status ? statuses[e.status]?.label : e.actor_label}</strong>
<span>{formatDate(e.created_at, true)} · {new Date(e.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
</div>
<p>{e.body}</p>
<small>{e.actor_label}{e.internal ? ' · Catatan internal' : ''}</small>
</div>)}</div>{!closed && <div className="message-compose">
<label htmlFor="reply">{staff ? 'Kirim pembaruan' : 'Ada informasi tambahan?'}</label>
<textarea id="reply" rows={3} value={message} onChange={e => setMessage(e.target.value)} maxLength={4000} placeholder="Tulis pesan untuk melanjutkan percakapan…"/>
<div>{staff ? <label className="check-label">
<input type="checkbox" checked={internal} onChange={e => setInternal(e.target.checked)}/>Catatan internal</label> : <span className="field-hint">Hanya pihak terkait yang dapat membaca.</span>}<button className="button primary small" disabled={busy || message.trim().length < 2} onClick={send}>Kirim <Icon name="arrow" size={15}/>
</button>
</div>
</div>}</section>
</div>
<aside className="detail-side">
<section className="panel">
<h3>Informasi penanganan</h3>
<dl className="detail-properties">
<div>
<dt>Unit penanganan</dt>
<dd>{t.unit_name || 'Menunggu penugasan'}</dd>
</div>
<div>
<dt>Prioritas</dt>
<dd className={t.priority === 'urgent' ? 'red-text' : ''}>{t.priority === 'urgent' ? 'Mendesak' : t.priority === 'high' ? 'Tinggi' : 'Normal'}</dd>
</div>
<div>
<dt>Target penyelesaian</dt>
<dd>{formatDate(t.due_at)}<small>{!closed && new Date(t.due_at) < new Date() ? 'Melewati target — perlu tindak lanjut' : 'SLA berdasarkan kategori laporan'}</small>
</dd>
</div>
<div>
<dt>Pelapor</dt>
<dd>{t.reporter_name}</dd>
</div>
</dl>
</section>{staff && !closed && (nextStatuses[t.status] || []).length > 0 && <section className="panel">
<h3>Tindak lanjut</h3>
<div className="stack-form compact">
<label>Status berikutnya<select value={next} onChange={e => setNext(e.target.value)}>
<option value="">Pilih status</option>{(nextStatuses[t.status] || []).filter(s => s !== 'assigned' || canAssign).map(s => <option value={s} key={s}>{statuses[s].label}</option>)}</select>
</label>{next === 'assigned' && <label>Unit tujuan<select value={unit} onChange={e => setUnit(e.target.value)}>
<option value="">Pilih unit</option>{units.filter(u => !t.sensitive || u.id === 'perlindungan').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
</label>}<label>Catatan untuk pelapor <small>(opsional)</small><textarea rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="Tambahkan penjelasan untuk pelapor bila diperlukan." maxLength={3000}/>
</label>
<button className="button primary full" disabled={busy || !next} onClick={() => change(next)}>Simpan perkembangan <Icon name="check" size={17}/>
</button>
</div>
</section>}{owner && t.status === 'awaiting_confirmation' && <section className="panel confirmation-panel">
<Icon name="spark" size={26}/>
<h3>Sudah terbantu?</h3>
<p>Tim telah menyampaikan hasil penanganan. Kamu yang mengonfirmasi penyelesaiannya.</p>
<textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Catatan atau alasan meminta tindak lanjut" rows={3}/>
<button className="button primary full" disabled={busy} onClick={() => change('resolved')}>Ya, sudah selesai <Icon name="check" size={16}/>
</button>
<button className="button secondary full" disabled={busy || reason.trim().length < 5} onClick={() => change('in_progress')}>Perlu tindak lanjut lagi</button>
</section>}{owner && t.status === 'resolved' && <section className="panel">
<h3>Bagaimana pengalamanmu?</h3>
<p className="field-hint">Penilaianmu membantu kami menjadi lebih baik.</p>
<div className="rating-stars">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} disabled={saved || busy} onClick={() => setRating(n)} aria-label={`Beri ${n} bintang`} className={n <= rating ? 'chosen' : ''}>
<Icon name="star" size={26}/>
</button>)}</div>
<textarea value={feedback} disabled={saved || busy} onChange={e => setFeedback(e.target.value)} placeholder="Masukan untuk pelayanan kami (opsional)" rows={3}/>
<button className="button primary full" disabled={busy || !rating || saved} onClick={async () => { setBusy(true); try {
        await api(`/api/tickets/${t.id}/rating`, { method: 'POST', headers, body: JSON.stringify({ rating, feedback }) });
        setSaved(true);
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 2400);
        await reload();
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }}>{saved ? 'Penilaian tersimpan' : 'Simpan penilaian'}</button>
</section>}<Notice>Nomor tiket dan kode akses bersifat pribadi. Jangan bagikan di media sosial.</Notice>
</aside>
</div>
</>;
}
