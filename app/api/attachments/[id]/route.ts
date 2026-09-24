import { currentUser, checkOrigin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { AppError } from '@/lib/security';
import { accessTicket, audit } from '@/lib/tickets';
import { closedStatuses, roles } from '@/lib/shared';
import { loadFile, removeOrphanFile } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

function json(value: unknown, status = 200) {
    return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function attachmentContext(request: Request, id: string) {
    const db = await getDb();
    const user = await currentUser();
    const [file] = await db.q('SELECT a.*,u.name AS uploaded_by_name,u.role AS uploaded_by_role FROM attachments a LEFT JOIN users u ON u.id=a.uploaded_by_user_id WHERE a.id=$1', [id]);
    if (!file)
        throw new AppError('Lampiran tidak ditemukan.', 404);
    const access = await accessTicket(file.ticket_id, user, request.headers.get('x-tracking-key'));
    const canDelete = (Boolean(user?.id) && file.uploaded_by_user_id === user?.id)
        || (access.owner && file.uploaded_by_owner === true);
    return { db, user, file, access, canDelete };
}

export async function HEAD(request: Request, { params }: Context) {
    try {
        const { id } = await params;
        const { canDelete } = await attachmentContext(request, id);
        return new Response(null, { status: canDelete ? 204 : 403, headers: { 'Cache-Control': 'no-store' } });
    }
    catch (error) {
        const status = error instanceof AppError ? error.status : 500;
        return new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });
    }
}

export async function GET(request: Request, { params }: Context) {
    try {
        const { id } = await params;
        const { db, user, file, access, canDelete } = await attachmentContext(request, id);
        if (new URL(request.url).searchParams.get('meta') === '1') {
            const uploaderName = file.uploaded_by_name
                || (file.uploaded_by_owner ? 'Pelapor anonim' : 'Pengunggah tidak tercatat');
            return json({
                canDelete,
                uploaderName,
                uploaderRole: file.uploaded_by_role ? roles[file.uploaded_by_role] : (file.uploaded_by_owner ? 'Pelapor' : ''),
            });
        }
        await audit(db, access.owner && !access.ticket.reporter_id ? null : user?.id || null, 'attachment.downloaded', file.ticket_id);
        const content = await loadFile(file.storage_key);
        return new Response(content, {
            headers: {
                'Content-Type': file.mime,
                'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
                'Cache-Control': 'private, no-store',
            },
        });
    }
    catch (error) {
        if (error instanceof AppError)
            return json({ error: error.message }, error.status);
        console.error('FEB CARE attachment download:', error instanceof Error ? error.message : error);
        return json({ error: 'Lampiran tidak dapat diunduh.' }, 500);
    }
}

export async function DELETE(request: Request, { params }: Context) {
    try {
        checkOrigin(request);
        const { id } = await params;
        const { db, user, file, access, canDelete } = await attachmentContext(request, id);
        if (!canDelete)
            throw new AppError('Hanya pengunggah lampiran yang dapat menghapus file ini.', 403);
        if (closedStatuses.includes(access.ticket.status))
            throw new AppError('Lampiran pada laporan yang sudah ditutup tidak dapat dihapus.', 403);
        await db.tx(async tx => {
            const removed = await tx.q('DELETE FROM attachments WHERE id=$1 RETURNING id', [file.id]);
            if (!removed.length)
                throw new AppError('Lampiran sudah dihapus.', 409);
            await audit(tx, user?.id || null, 'attachment.deleted', file.ticket_id, `${file.id}:${file.name}`);
        });
        try {
            await removeOrphanFile(file.storage_key);
        }
        catch (error) {
            console.error('Gagal membersihkan berkas lampiran:', error instanceof Error ? error.message : error);
        }
        return json({ ok: true });
    }
    catch (error) {
        if (error instanceof AppError)
            return json({ error: error.message }, error.status);
        console.error('FEB CARE attachment deletion:', error instanceof Error ? error.message : error);
        return json({ error: 'Lampiran tidak dapat dihapus.' }, 500);
    }
}
