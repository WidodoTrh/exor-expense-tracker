import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
    if (!['GET', 'DELETE'].includes(req.method)) {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabase = supabaseFromRequest(req);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized' });

    /* ---------- GET: list my sessions ---------- */
    if (req.method === 'GET') {
        const { data, error } = await supabase.rpc('get_my_sessions');
        if (error) {
            console.error('get_my_sessions failed:', error);
            return res.status(500).json({ error: 'Failed to fetch sessions' });
        }
        return res.status(200).json({ sessions: data });
    }

    /* ---------- DELETE ?scope=others : sign out every other session ---------- */
    const { id, scope } = req.query;

    if (scope === 'others') {
        const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

        const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/logout?scope=others`, {
            method: 'POST',
            headers: {
                apikey: process.env.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${token}`,
            },
        });

        if (!r.ok) {
            console.error('logout others failed:', r.status, await r.text());
            return res.status(500).json({ error: 'Failed to sign out other sessions' });
        }
        return res.status(200).json({ ok: true });
    }

    if (id) {
        if (typeof id !== 'string' || !UUID_RE.test(id)) {
            return res.status(400).json({ error: 'Invalid session id' });
        }

        const { data: revoked, error } = await supabase.rpc('revoke_my_session', {
            _session_id: id,
        });
        if (error) {
            console.error('revoke_my_session failed:', error);
            return res.status(500).json({ error: 'Failed to sign out session' });
        }
        if (!revoked) return res.status(404).json({ error: 'Session not found' });

        return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Provide ?scope=others or ?id=<session id>' });
}