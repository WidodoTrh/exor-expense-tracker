import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) return res.status(400).json({ error: profileError.message });

    const { data: membership, error: membershipError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single();

    if (membershipError) return res.status(400).json({ error: membershipError.message });

    return res.status(200).json({
        profiles: { ...profile, household_id: membership.household_id }
    });
}