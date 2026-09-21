// api/transactions/bulk.js
import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

const MAX_IDS = 100; // .in() puts every id in the URL, so keep this modest
const ID_RE = /^[\w-]+$/; // uuid or integer ids; blocks commas/parentheses
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Only these columns can be changed in bulk (amount/description stay per-row).
const FIELDS = ['category_id', 'payment_type_id', 'cashflow_type_id', 'transaction_date'];

export default async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabase = supabaseFromRequest(req);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { ids, changes } = req.body ?? {};

    /* ---------- validate ids ---------- */
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Select at least one transaction' });
    }
    if (ids.length > MAX_IDS) {
        return res.status(400).json({ error: `You can update at most ${MAX_IDS} transactions at once` });
    }
    const uniqueIds = [...new Set(ids.map(String))];
    if (!uniqueIds.every((id) => ID_RE.test(id))) {
        return res.status(400).json({ error: 'Invalid transaction id' });
    }

    /* ---------- validate changes (whitelist, ignore everything else) ---------- */
    const patch = {};
    for (const key of FIELDS) {
        const value = changes?.[key];
        if (value === undefined || value === null || value === '') continue;
        patch[key] = value;
    }
    if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'Choose at least one field to update' });
    }
    if (patch.transaction_date &&
        (!DATE_RE.test(patch.transaction_date) || Number.isNaN(Date.parse(patch.transaction_date)))) {
        return res.status(400).json({ error: 'Invalid date' });
    }

    /* ---------- pre-check: everything must exist AND belong to this user ---------- */
    // RLS lets household members READ each other's rows, so this select can
    // tell "exists but not yours" (403) apart from "does not exist" (404).
    const { data: rows, error: readError } = await supabase
        .from('transactions')
        .select('id, user_id')
        .in('id', uniqueIds);

    if (readError) {
        console.error('bulk read failed:', readError);
        return res.status(500).json({ error: 'Failed to load transactions' });
    }

    const found = new Set(rows.map((r) => String(r.id)));
    const missing = uniqueIds.filter((id) => !found.has(id));
    if (missing.length > 0) {
        return res.status(404).json({ error: 'Some transactions were not found', ids: missing });
    }

    const notOwned = rows.filter((r) => r.user_id !== user.id).map((r) => r.id);
    if (notOwned.length > 0) {
        return res.status(403).json({
            error: 'You can only edit transactions you created',
            ids: notOwned,
        });
    }

    /* ---------- one UPDATE statement = all-or-nothing ---------- */
    const { data, error } = await supabase
        .from('transactions')
        .update(patch)
        .in('id', uniqueIds)
        .select('id');

    if (error) {
        console.error('bulk update failed:', error);
        if (error.code === '23503') {
            return res.status(400).json({ error: 'Invalid category, payment type or cashflow type' });
        }
        if (error.code === '42501') {
            return res.status(403).json({ error: 'You do not have permission to edit these transactions' });
        }
        return res.status(500).json({ error: 'Failed to update transactions' });
    }

    // Can be lower than requested only if rows were deleted between the check and the update.
    return res.status(200).json({ updated: data.length, requested: uniqueIds.length });
}