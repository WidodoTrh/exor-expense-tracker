import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('transactions')
            .select('*, categories(name, icon, color), payment_type(name), profiles(display_name)')
            .order('transaction_date', { ascending: false });

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ transactions: data });
    }
}