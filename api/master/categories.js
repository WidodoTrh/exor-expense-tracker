import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    if (req.method === 'POST') {
        const { name, cashflow_type_id } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return res.status(401).json({ error: 'Unauthorized' });

        const { data: membership, error: membershipError } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', user.id)
            .single();

        if (membershipError) return res.status(400).json({ error: membershipError.message });

        const { data, error } = await supabase
            .from('categories')
            .insert({ name: name.trim(), cashflow_type_id, household_id: membership.household_id })
            .select();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ category: data?.[0] });
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Category id is required' });
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    const { data, error } = await supabase.from('categories').select('id, name');
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ categories: data });
}