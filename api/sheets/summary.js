export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '');
    const { spreadsheetId, month, year } = req.query;

    if (!accessToken) return res.status(401).json({ error: 'Missing access token' });
    if (!spreadsheetId) return res.status(400).json({ error: 'Missing spreadsheetId' });

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    try {
        const range = 'Transactions!A:J';
        const sheetsRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await sheetsRes.json();

        if (!sheetsRes.ok) {
        return res.status(sheetsRes.status).json({ error: 'Failed to fetch sheet', detail: data });
        }

        const rows = data.values || [];
        const [header, ...body] = rows;
        if (!header) {
        return res.status(200).json({ total: 0, daily: [], byCategory: [] });
        }

        const idx = {
        category: header.findIndex((h) => h.toLowerCase() === 'category'),
        amount: header.findIndex((h) => h.toLowerCase() === 'amount'),
        datetime: header.findIndex((h) => h.toLowerCase() === 'spend datetime'),
        };

        // Parse "Spend Datetime" (format YYYY-MM-DD) langsung jadi day/month/year
        const parsed = body
        .map((row) => {
            const raw = row[idx.datetime];
            if (!raw) return null;
            const [y, m, d] = raw.split('-').map((v) => parseInt(v));
            if (!y || !m || !d) return null;
            return {
            year: y,
            month: m,
            day: d,
            category: row[idx.category] || 'Uncategorized',
            amount: parseFloat(row[idx.amount]) || 0,
            };
        })
        .filter(Boolean); // buang row yang gagal parse / kosong

        const filtered = parsed.filter((r) => r.month === targetMonth && r.year === targetYear);

        const total = filtered.reduce((sum, r) => sum + r.amount, 0);

        const dailyMap = {};
        filtered.forEach((r) => {
        dailyMap[r.day] = (dailyMap[r.day] || 0) + r.amount;
        });
        const daily = Object.entries(dailyMap)
        .map(([day, amount]) => ({ day: parseInt(day), amount }))
        .sort((a, b) => a.day - b.day);

        const categoryMap = {};
        filtered.forEach((r) => {
        categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount;
        });
        const byCategory = Object.entries(categoryMap).map(([category, amount]) => ({ category, amount }));

        return res.status(200).json({ month: targetMonth, year: targetYear, total, daily, byCategory });
    } catch (err) {
        console.error('Summary error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}