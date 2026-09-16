import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    const { data, error } = await supabase
        .from('household_members')
        .select('user_id, role, joined_at, profiles(display_name)');

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ members: data });
}