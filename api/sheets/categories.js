import { ensureTypeOf_sheet, CATEGORIES_SHEET_TITLE } from '../_lib/sheets.js';

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '');
    if (!accessToken) return res.status(401).json({ error: 'Missing access token' });

    if (req.method === 'GET') {
        const { spreadsheetId } = req.query;
        if (!spreadsheetId) return res.status(400).json({ error: 'Missing spreadsheetId' });

        try {
            await ensureTypeOf_sheet(accessToken, spreadsheetId); // backfill kalau belum ada

            const sheetsRes = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${CATEGORIES_SHEET_TITLE}!A:C`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const data = await sheetsRes.json();
            if (!sheetsRes.ok) {
                return res.status(sheetsRes.status).json({ error: 'Failed to fetch categories', detail: data });
            }

            const rows = data.values || [];
            const [header, ...body] = rows;
            if (!header) return res.status(200).json({ categories: [] });

            const categories = body.map((row) => {
                const obj = {};
                header.forEach((key, i) => { obj[key.toLowerCase()] = row[i] ?? ''; });
                return obj;
            });

            return res.status(200).json({ categories });
        } catch (err) {
            console.error('Categories fetch error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        const { spreadsheetId, name, type = 'expense' } = req.body;
        if (!spreadsheetId || !name) {
            return res.status(400).json({ error: 'Missing spreadsheetId or name' });
        }

        try {
            await ensureTypeOf_sheet(accessToken, spreadsheetId);
            const id = Date.now().toString();
            const appendRes = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${CATEGORIES_SHEET_TITLE}!A:C:append?valueInputOption=USER_ENTERED`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ values: [[id, name, type]] }),
                }
            );
            const appendData = await appendRes.json();
            if (!appendRes.ok) {
                return res.status(appendRes.status).json({ error: 'Failed to add category', detail: appendData });
            }

            return res.status(200).json({ success: true, id });
        } catch (err) {
            console.error('Add category error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}