import { getRedisClient } from '../_lib/redis.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '');
    if (!accessToken) return res.status(401).json({ error: 'Missing access token' });

    const { spreadsheetId, email } = req.body;
    if (!spreadsheetId || !email) {
        return res.status(400).json({ error: 'Missing spreadsheetId or email' });
    }

    const normalizedEmail = email.toLowerCase();

    try {
        const redis = await getRedisClient();
        const raw = await redis.hGet(`invited-by:${spreadsheetId}`, normalizedEmail);
        if (!raw) {
            return res.status(404).json({ error: 'Invite not found' });
        }
        const { permissionId } = JSON.parse(raw);
        if (permissionId) {
            const revokeRes = await fetch(
                `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions/${permissionId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            if (!revokeRes.ok && revokeRes.status !== 404) {
                const revokeData = await revokeRes.json();
                return res.status(revokeRes.status).json({ error: 'Failed to revoke Drive permission', detail: revokeData });
            }
        }

        await redis.del(`invite:${normalizedEmail}`);
        await redis.hDel(`invited-by:${spreadsheetId}`, normalizedEmail);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Revoke invite error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}