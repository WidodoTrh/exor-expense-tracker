import { useState, useEffect } from 'react';
import { Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button, Stack } from '@mui/material';
import { GrowTransition } from '../component/TransitionEffect';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useTransactionsQuery } from '../hooks/useTransactionsOpt';
import global from '../appcore/global';

export default function EditTransactionDialog({ open, onClose, transaction, categories = [], paymentTypes = [], cashflowTypes = [], onSave }) {
    const [form, setForm] = useState({
        description: '',
        amount: '',
        category_id: '',
        payment_type_id: '',
        cashflow_type_id: '',
        transaction_date: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [DatepickerOpen, setDatepickerOpen] = useState(false)
    const { updateTrx } = useTransactionsQuery()

    useEffect(() => {
        if (transaction) {
            setForm({
                description: transaction.description ?? '',
                amount: transaction.amount ?? '',
                category_id: transaction.category_id ?? '',
                payment_type_id: transaction.payment_type_id ?? '',
                cashflow_type_id: transaction.cashflow_type_id ?? '',
                transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date) : null,
            });
            setError('');
        }
    }, [transaction]);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async () => {
        setError('');
        setSaving(true);
        try {
            await updateTrx(transaction.id, {
                ...form,
                amount: Number(form.amount),
                transaction_date: form.transaction_date
                    ? global.formatDateLocal(form.transaction_date)
                    : null,
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Gagal menyimpan perubahan');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog 
            open={open}
            onClose={onClose} 
            fullWidth 
            maxWidth="sm"
            slots={{transition: GrowTransition}} 
                slotProps={{
                    transition: {
                        timeout: 650
                    }
                }}
        >
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Description"
                        value={form.description}
                        onChange={handleChange('description')}
                        fullWidth
                    />
                    <TextField
                        label="Amount"
                        type="number"
                        value={form.amount}
                        onChange={handleChange('amount')}
                        fullWidth
                    />
                     <Autocomplete
                        options={categories}
                        getOptionLabel={(option) => option.name ?? ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={categories.find((c) => c.id === form.category_id) ?? null}
                        onChange={(_, newValue) =>
                        setForm((prev) => ({ ...prev, category_id: newValue?.id ?? '' }))
                        }
                        renderInput={(params) => <TextField {...params} label="Category" />}
                    />

                    <Autocomplete
                        options={paymentTypes}
                        getOptionLabel={(option) => option.name ?? ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={paymentTypes.find((p) => p.id === form.payment_type_id) ?? null}
                        onChange={(_, newValue) =>
                        setForm((prev) => ({ ...prev, payment_type_id: newValue?.id ?? '' }))
                        }
                        renderInput={(params) => <TextField {...params} label="Payment Type" />}
                    />

                    <Autocomplete
                        options={cashflowTypes}
                        getOptionLabel={(option) => option.name ?? ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={cashflowTypes.find((c) => c.id === form.cashflow_type_id) ?? null}
                        onChange={(_, newValue) =>
                        setForm((prev) => ({ ...prev, cashflow_type_id: newValue?.id ?? '' }))
                        }
                        renderInput={(params) => <TextField {...params} label="Cashflow Type" />}
                    />
                    <DatePicker
                        label="Date"
                        value={form.transaction_date}
                        open={DatepickerOpen}
                        onOpen={() => setDatepickerOpen(true)}
                        onClose={() => setDatepickerOpen(false)}
                        onChange={(newValue) =>
                            setForm((prev) => ({ ...prev, transaction_date: newValue }))
                        }
                        slotProps={{
                            textField: {
                                size: "small",
                                fullWidth: true,
                                onClick: () => setDatepickerOpen(true),
                                InputProps: {
                                    readOnly: true,
                                },
                            },
                        }}
                    />
                    {error && <Stack sx={{ color: 'error.main', fontSize: 14 }}>{error}</Stack>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}