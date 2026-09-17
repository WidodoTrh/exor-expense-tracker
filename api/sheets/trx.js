import { supabaseFromRequest } from '../_lib/_supabaseFromRequest.js';

export default async function handler(req, res) {
    const supabase = supabaseFromRequest(req);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
        const { description, amount, category_id, payment_type_id, cashflow_type_id, transaction_date } = req.body;

        const missingFields = [];
        if (!description || !description.trim()) missingFields.push('Description');
        if (!amount || Number(amount) <= 0) missingFields.push('Amount');
        if (!category_id) missingFields.push('Category');
        if (!payment_type_id) missingFields.push('Payment Type');
        if (!cashflow_type_id) missingFields.push('Cashflow Type');
        if (!transaction_date) missingFields.push('Date');

        if (missingFields.length > 0) {
            return res.status(400).json({ error: `${missingFields.join(', ')} cannot be empty` });
        }

        const { data: membership, error: membershipError } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', user.id)
            .single();

        if (membershipError) return res.status(400).json({ error: membershipError.message });

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                description: description.trim(),
                amount: Number(amount),
                category_id,
                payment_type_id,
                cashflow_type_id,
                transaction_date,
                household_id: membership.household_id,
            })
            .select();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ message: 'success', transaction: data?.[0] });
    }

    // edit
    if (req.method === 'PUT') {
        const { id, description, amount, category_id, payment_type_id, cashflow_type_id, transaction_date } = req.body;

        if (!id) return res.status(400).json({ error: 'Transaction id is required' });

        const missingFields = [];
        if (!description || !description.trim()) missingFields.push('Description');
        if (!amount || Number(amount) <= 0) missingFields.push('Amount');
        if (!category_id) missingFields.push('Category');
        if (!payment_type_id) missingFields.push('Payment Type');
        if (!cashflow_type_id) missingFields.push('Cashflow Type');
        if (!transaction_date) missingFields.push('Date');

        if (missingFields.length > 0) {
            return res.status(400).json({ error: `${missingFields.join(', ')} cannot be empty` });
        }

        const { data: membership, error: membershipError } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', user.id)
            .single();

        if (membershipError) return res.status(400).json({ error: membershipError.message });

        const { data, error } = await supabase
            .from('transactions')
            .update({
                description: description.trim(),
                amount: Number(amount),
                category_id,
                payment_type_id,
                cashflow_type_id,
                transaction_date,
            })
            .eq('id', id)
            .eq('household_id', membership.household_id) // cuma bisa edit punya household sendiri
            .select();

        if (error) return res.status(400).json({ error: error.message });
        if (!data || data.length === 0) return res.status(404).json({ error: 'Transaction not found' });

        return res.status(200).json({ message: 'success', transaction: data[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}