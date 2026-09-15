import { Chip, Container, Box, Button, TextField, MenuItem, Stack, CircularProgress, Typography, Divider, Autocomplete } from "@mui/material";
import { useEffect, useState } from 'react';
import { useTransactionsQuery } from "../hooks/useTransactionsQuery";
import { useSnackbar } from 'notistack'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import global from "../appcore/global"
import { usePaymentTypesQuery, useCategoriesQuery, useCashflowTypesQuery } from '../hooks/useMasterQuery';

function TransactionPage() {
    const { enqueueSnackbar } = useSnackbar()
    const { ListPaymentType } = usePaymentTypesQuery()
    const { ListCategory } = useCategoriesQuery()
    const { cashflowTypes } = useCashflowTypesQuery()


    const { addTransaction } = useTransactionsQuery()
    const [form, setForm] = useState({
        description: '', amount: '', category_id: '', payment_type_id: '', cashflow_type_id: '', transaction_date: global.formatDateLocal(new Date()) ,
    });
    const [submitting, setSubmitting] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const quickAmounts = [5000, 10000, 15000, 20000, 30000, 40000, 50000];

    const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    const handleDateChange = (newValue) => {
        const formatted = newValue ? `${newValue.getFullYear()}-${String(newValue.getMonth() + 1).padStart(2, '0')}-${String(newValue.getDate()).padStart(2, '0')}` : '';
        setForm((f) => ({ ...f, transaction_date: formatted }));
    };


    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await addTransaction({
                ...form,
                amount: parseFloat(form.amount) || 0,
            });
            setForm({ description: '', amount: '', category_id: '', payment_type_id: '', transaction_date: global.formatDateLocal(new Date())});
            enqueueSnackbar('Transaction saved successfuly', { variant: 'success', anchorOrigin: {vertical: 'top', horizontal: 'center'}});
        } catch (err) {
            console.error('Failed to add transaction:', err);
            const errMsg = err?.response?.data?.error || err?.response?.data?.detail || err.message || 'Gagal menyimpan transaksi';
            enqueueSnackbar(errMsg, {variant: 'error', anchorOrigin: {vertical: 'top', horizontal: 'center'}})
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (ListPaymentType.length > 0 && !form.payment_type_id) {
            const defaultCash = ListPaymentType.find((pt) => pt.name === 'Cashless');
            if (defaultCash) {
                setForm((f) => ({ ...f, payment_type_id: defaultCash.id }));
            }
        }
        if (cashflowTypes.length > 0 && !form.cashflow_type_id) {
            const defaultExpense = cashflowTypes.find((ct) => ct.name === 'Expense');
            if (defaultExpense) {
                setForm((f) => ({ ...f, cashflow_type_id: defaultExpense.id }));
            }
        }
    }, [ListPaymentType, cashflowTypes])

    return (
        <Container maxWidth="md" sx={{justifyContent: 'center', marginY: 2}}>
            <Typography variant="h4" fontWeight={700} sx={{mb: 2}}>
                Add new transaction
            </Typography>
            <Divider />
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Stack spacing={2} sx={{ marginY: 2 }}>
                    <TextField label="Description" value={form.description} onChange={handleChange('description')} fullWidth size="small" />
                    <TextField
                        size="small"
                        label="Amount"
                        value={form.amount}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*\.?\d*$/.test(val)) {
                                setForm((f) => ({ ...f, amount: val }));
                            }
                        }}
                        fullWidth
                        slotProps={{
                            htmlInput: { inputMode: 'decimal' },
                        }}
                    />
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                        {quickAmounts.map((amt) => (
                            <Chip
                                key={amt}
                                label={amt.toLocaleString('id-ID')}
                                size="medium"
                                clickable
                                variant={form.amount === String(amt) ? 'filled' : 'outlined'}
                                color={form.amount === String(amt) ? 'primary' : 'default'}
                                onClick={() => setForm((f) => ({ ...f, amount: String(amt) }))}
                            />
                        ))}
                    </Box>
                    <Autocomplete
                        size="small"
                        options={ListCategory}
                        getOptionLabel={(option) => option.name}
                        value={ListCategory.find((c) => c.id === form.category_id) || null}
                        onChange={(event, newValue) => {
                            setForm((f) => ({ ...f, category_id: newValue?.id || '' }));
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField {...params} label="Category" fullWidth />
                        )}
                        slotProps={{
                            listbox: { sx: { maxHeight: 250 } },
                        }}
                    />
                    <Autocomplete
                        size="small"
                        options={ListPaymentType}
                        getOptionLabel={(option) => option?.name}
                        value={ListPaymentType.find((c) => c.id === form.payment_type_id) || null}
                        onChange={(event, newValue) => {
                            setForm((f) => ({ ...f, payment_type_id: newValue?.id || '' }));
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField {...params} label="Payment Type" fullWidth />
                        )}
                        slotProps={{
                            listbox: { sx: { maxHeight: 250 } },
                        }}
                    />

                    <Autocomplete
                        size="small"
                        options={cashflowTypes}
                        getOptionLabel={(option) => option?.name}
                        value={cashflowTypes.find((c) => c.id === form.cashflow_type_id) || null}
                        onChange={(event, newValue) => {
                            setForm((f) => ({ ...f, cashflow_type_id: newValue?.id || '' }));
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField {...params} label="Cashflow Type" fullWidth />
                        )}
                        slotProps={{
                            listbox: { sx: { maxHeight: 250 } },
                        }}
                    />

                    <DatePicker
                        label="Transaction Date"
                        value={form.transaction_date ? new Date(form.transaction_date) : null}
                        onChange={handleDateChange}
                        open={datePickerOpen}
                        onOpen={() => setDatePickerOpen(true)}
                        onClose={() => setDatePickerOpen(false)}
                        slotProps={{
                            textField: {
                                size:"small",
                                fullWidth: true,
                                onClick: () => setDatePickerOpen(true),
                                slotProps: {
                                    readOnly: true
                                },
                            },
                        }}
                    />
                </Stack>

                <Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : 'Save'}>
                    {/* {submitting ? <CircularProgress />  : 'Save'} */}
                </Button>
            </Box>
        </Container>
    )
}


export default TransactionPage