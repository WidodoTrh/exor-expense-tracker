import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    if (req.method === 'GET') {
        const { data, error } = await supabase
        .from('household_members')
        .select('user_id, role, joined_at, profiles(display_name)');

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ members: data });
    }

    if (req.method === 'POST') {
        const { householdName } = req.body;
        if (!householdName?.trim()) {
            return res.status(400).json({ error: 'householdName is required' });
        }

        const { data, error } = await supabase.rpc('create_household', {
            household_name: householdName,
        });

        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ household: data });
    }

    if (req.method === 'DELETE') {
        const { householdId } = req.body;
        if (!householdId) {
            return res.status(400).json({ error: 'householdId is required' });
        }

        const { error } = await supabase.rpc('delete_household', {
            target_household_id: householdId,
        });

        if (error) {
            const isPermissionError = error.message.includes('Only the household owner');
            return res.status(isPermissionError ? 403 : 400).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Household deleted' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}