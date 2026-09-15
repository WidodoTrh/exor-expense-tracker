import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    if (req.method === 'POST') {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Payment Type name is required' });
        }

        const { data, error } = await supabase
            .from('payment_type')
            .insert({ name: name.trim()})
            .select();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ payment_type: data?.[0] });
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Payment Type id is required' });

        const { error } = await supabase.from('payment_type').delete().eq('id', id);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ success: true });
    }


    const { data, error } = await supabase.from('payment_type').select('id, name');
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ payment_type: data });
}