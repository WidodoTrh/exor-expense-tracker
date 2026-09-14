import { getRedisClient } from '../_lib/redis.js';

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '');
    if (!accessToken) return res.status(401).json({ error: 'Missing access token' });

    const redis = await getRedisClient();

    if (req.method === 'GET') {
        const { spreadsheetId } = req.query;
        if (!spreadsheetId) return res.status(400).json({ error: 'Missing spreadsheetId' });

        try {
        const invitedRaw = await redis.hGetAll(`invited-by:${spreadsheetId}`);
        const invited = Object.entries(invitedRaw).map(([email, value]) => ({
            email,
            ...JSON.parse(value),
        }));
        return res.status(200).json({ invited });
        } catch (err) {
        console.error('List invites error:', err);
        return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        const { spreadsheetId, inviteeEmail, role = 'writer' } = req.body;
        if (!spreadsheetId || !inviteeEmail) {
        return res.status(400).json({ error: 'Missing spreadsheetId or inviteeEmail' });
        }

        try {
        const permRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`,
            {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'user',
                role,
                emailAddress: inviteeEmail,
            }),
            }
        );
        const permData = await permRes.json();
        if (!permRes.ok) {
            return res.status(permRes.status).json({ error: 'Failed to share file', detail: permData });
        }

        const normalizedEmail = inviteeEmail.toLowerCase();

        // 1. Mapping buat dipakai pas orang itu login
        await redis.set(`invite:${normalizedEmail}`, spreadsheetId);
        await redis.hSet(
            `invited-by:${spreadsheetId}`,
            normalizedEmail,
            JSON.stringify({ 
                role, 
                invitedAt: new Date().toISOString(),
                permissionId: permData.id
            })
        );

        return res.status(200).json({ success: true });
        } catch (err) {
        console.error('Invite error:', err);
        return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}