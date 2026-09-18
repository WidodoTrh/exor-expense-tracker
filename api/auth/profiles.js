import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError) return res.status(400).json({ error: profileError.message });

    const { data: membership, error: membershipError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (membershipError) return res.status(400).json({ error: membershipError.message });

    let householdName = null;
    if (membership?.household_id) {
        const { data: household, error: householdError } = await supabase
            .from('households')
            .select('name')
            .eq('id', membership.household_id)
            .maybeSingle();

        if (householdError) return res.status(400).json({ error: householdError.message });
        householdName = household?.name ?? null;
    }

    return res.status(200).json({
        profiles: {
            ...profile,
            email: user.email,
            household_id: membership?.household_id ?? null,
            household_name: householdName,
        }
    });
}