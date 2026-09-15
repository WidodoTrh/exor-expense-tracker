import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    if (req.method === 'POST') {
        const { data, error } = await supabase
            .from('transactions')
            .insert(req.body)
            .select();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ transaction: data?.[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}