import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { currentUser, checkOrigin, rateLimit } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { AppError, detectFile } from '@/lib/security';
import { accessTicket, audit } from '@/lib/tickets';
import { closedStatuses } from '@/lib/shared';
import { removeOrphanFile, storeFile } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

function json(value: unknown, status = 200) {
    return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function boundedBody(request: Request, max: number) {
    if (Number(request.headers.get('content-length')) > max)
        throw new AppError('Ukuran permintaan terlalu besar.', 413);
    const reader = request.body?.getReader();
    if (!reader)
        return new Uint8Array();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        size += value.length;
        if (size > max) {
            await reader.cancel();
            throw new AppError('Ukuran permintaan terlalu besar.', 413);
        }
        chunks.push(value);
    }
    const result = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}

export async function POST(request: Request, { params }: Context) {
    try {
        checkOrigin(request);
        const { id } = await params;
        const db = await getDb();
        const user = await currentUser();
        const access = await accessTicket(id, user, request.headers.get('x-tracking-key'));
        const { ticket, owner, staff } = access;
        if (!owner && !staff)
            throw new AppError('Akses ditolak.', 403);
        if (closedStatuses.includes(ticket.status))
            throw new AppError('Lampiran tidak dapat ditambahkan pada tiket yang sudah ditutup.');
        await rateLimit(`upload:${ticket.id}`, 20, 3600);

        const bytes = await boundedBody(request, 11 * 1024 * 1024);
        const form = await new Request(request.url, {
            method: 'POST',
            headers: { 'content-type': request.headers.get('content-type') || '' },
            body: bytes,
        }).formData();
        const file = form.get('file');
        if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024)
            throw new AppError('Pilih file maksimal 10 MB.');
        const buffer = Buffer.from(await file.arrayBuffer());
        const type = detectFile(buffer);
        if (!type)
            throw new AppError('Format yang didukung: JPG, PNG, WebP, atau PDF.');

        const attachmentId = randomUUID();
        const storageKey = `${attachmentId}.${type.ext}`;
        const actorId = owner && !ticket.reporter_id ? null : user?.id || null;
        await storeFile(storageKey, buffer);
        try {
            await db.tx(async tx => {
                await tx.q('SELECT id FROM tickets WHERE id=$1 FOR UPDATE', [ticket.id]);
                const [count] = await tx.q('SELECT count(*)::int AS total FROM attachments WHERE ticket_id=$1', [ticket.id]);
                if (count.total >= 10)
                    throw new AppError('Maksimal 10 lampiran per laporan.');
                await tx.q(
                    'INSERT INTO attachments(id,ticket_id,name,mime,size,storage_key,uploaded_by_user_id,uploaded_by_owner) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
                    [attachmentId, ticket.id, path.basename(file.name).slice(0, 180), type.mime, file.size, storageKey, actorId, owner],
                );
                await audit(tx, actorId, 'attachment.added', ticket.id, attachmentId);
            });
        }
        catch (error) {
            await removeOrphanFile(storageKey);
            throw error;
        }
        return json({ id: attachmentId }, 201);
    }
    catch (error) {
        if (error instanceof AppError)
            return json({ error: error.message }, error.status);
        console.error('FEB CARE attachment upload:', error instanceof Error ? error.message : error);
        return json({ error: 'Layanan mengalami kendala. Silakan coba kembali.' }, 500);
    }
}
