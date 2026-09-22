// api/demo/seed.js
import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const supabase = supabaseFromRequest(req);
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = userData.user.id;

    // cek biar gak double-seed kalau endpoint ini kepanggil lebih dari sekali
    const { data: existingMembership } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (existingMembership) {
        return res.status(200).json({ message: 'Already seeded' });
    }

    // 1. Bikin household demo — pakai token user (anonymous), bukan service role
    const { data: household, error: hErr } = await supabase.rpc('create_household', {
        household_name: 'Demo Household',
    });
    if (hErr) return res.status(500).json({ error: hErr.message });

    // 2. Seed profile
    await supabase.from('profiles').insert({ id: userId, display_name: 'Demo User' });

    // 3. Seed categories
    const { data: categories, error: catErr } = await supabase
        .from('categories')
        .insert([
        { household_id: household.id, name: 'Salary' },
        { household_id: household.id, name: 'Groceries' },
        { household_id: household.id, name: 'Transport' },
        ])
        .select();
    if (catErr) return res.status(500).json({ error: catErr.message });

    // 4. Seed payment types
    const { data: paymentTypes, error: ptErr } = await supabase
        .from('payment_type')
        .insert([
        { household_id: household.id, name: 'Cash' },
        { household_id: household.id, name: 'Bank Transfer' },
        ])
        .select();
    if (ptErr) return res.status(500).json({ error: ptErr.message });

    return res.status(200).json({ message: 'Seeded', household });
}