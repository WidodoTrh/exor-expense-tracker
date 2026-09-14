export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
        return res.status(401).json({ error: 'Missing access token' });
    }

    if (req.method === 'GET') {
        const { spreadsheetId } = req.query;
        if (!spreadsheetId) {
            return res.status(400).json({ error: 'Missing spreadsheetId' });
        }

        try {
            const range = 'Transactions!A:J';
            const sheetsRes = await fetch(
                `${process.env.VITE_APP_GOOGLE_SHEET_API}/${spreadsheetId}/values/${range}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            const data = await sheetsRes.json();

            if (!sheetsRes.ok) {
                return res.status(sheetsRes.status).json({ error: 'Failed to fetch sheet', detail: data });
            }

            const rows = data.values || [];
            const [header, ...body] = rows;

            if (!header) {
                return res.status(200).json({ transactions: [] });
            }

            const transactions = body.map((row, idx) => {
                const obj = { id: idx };
                header.forEach((key, i) => {
                    obj[key.toLowerCase()] = row[i] ?? '';
                });
                return obj;
            });

            return res.status(200).json({ transactions });
        } catch (err) {
            console.error('Sheets fetch error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        const { spreadsheetId, title, spentBy, amount, category, paymentType, spendDatetime } = req.body;

        const requiredFields = { spreadsheetId, title, spentBy, amount, category, paymentType, spendDatetime };
        const missingFields = Object.entries(requiredFields)
            .filter(([, value]) => value === undefined || value === null || value === '')
            .map(([key]) => key);
            
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required field(s): ${missingFields.join(', ')}`,
            });
        }

        try {
            const [y, m, d] = spendDatetime.split('-').map((v) => parseInt(v));
            const MONTH_NAMES = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
            ];
            const monthName = MONTH_NAMES[m - 1];
            const id = Date.now().toString();

            const row = [
                id,
                title,
                spentBy,
                amount,
                category,
                paymentType,
                spendDatetime,
                monthName,
                y,
            ];

            const appendRes = await fetch(
                `${process.env.VITE_APP_GOOGLE_SHEET_API}/${spreadsheetId}/values/Transactions!A:J:append?valueInputOption=USER_ENTERED`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ values: [row] }),
                }
            );

            const appendData = await appendRes.json();

            if (!appendRes.ok) {
                return res.status(appendRes.status).json({ error: 'Failed to append row', detail: appendData });
            }

            return res.status(200).json({ success: true, id });
        } catch (err) {
            console.error('Add transaction error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}