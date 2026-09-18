import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    if (req.method === 'DELETE') {
        const { user_id, household_id } = req.body;
        if (!user_id || !household_id) {
            return res.status(400).json({ error: 'User id and Household id must not be empty' });
        }

        const { error } = await supabase
            .from('household_members')
            .delete()
            .eq('user_id', user_id)
            .eq('household_id', household_id);

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, household_id } = req.body;
    if (!email || !household_id) {
        return res.status(400).json({ error: 'Email and household_id are required' });
    }

    // 1. Cari user_id dari email
    const { data: foundUserId, error: findError } = await supabase
        .rpc('find_user_by_email', { p_email: email.trim() });

    if (findError) return res.status(400).json({ error: findError.message });
    if (!foundUserId) {
        return res.status(404).json({ error: 'This user is not yet registered on this application.' });
    }

    // 2. Cek udah jadi member belum (biar gak insert duplikat)
    const { data: existing } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('household_id', household_id)
        .eq('user_id', foundUserId)
        .maybeSingle();

    if (existing) {
        return res.status(400).json({ error: 'This user is already a member of the household.' });
    }

    // 3. Masukin jadi member
    const { error: insertError } = await supabase
        .from('household_members')
        .insert({ household_id, user_id: foundUserId, role: 'member' });

    if (insertError) return res.status(400).json({ error: insertError.message });
    return res.status(200).json({ success: true });
}