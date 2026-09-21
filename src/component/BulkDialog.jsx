import { useState } from 'react';
import {
    Alert,
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack'

const EMPTY = {
    category_id: '',
    payment_type_id: '',
    cashflow_type_id: '',
    transaction_date: '',
};


function AutocompleteField({ label, value, onChange, options, getLabel = (o) => o.name, disabled }) {
    const selected = options.find((o) => o.id === value) ?? null;

    return (
        <Autocomplete
            size="small"
            options={options}
            value={selected}
            onChange={(_, option) => onChange(option ? option.id : '')}
            getOptionLabel={getLabel}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            disabled={disabled}
            autoHighlight
            noOptionsText="No matches"
            renderInput={(params) => (
                <TextField {...params} label={label} placeholder="Keep current" />
            )}
            slotProps={{
                listbox: { sx: { maxHeight: 250 }},
            }}
        />
    );
}

/**
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {number}   props.count            number of selected transactions
 * @param {Array}    props.categories       [{ id, name }]
 * @param {Array}    props.paymentTypes     [{ id, name }]
 * @param {Array}    props.cashflowTypes    [{ id, name }]
 * @param {() => void} props.onClose
 * @param {(changes: object) => Promise<void>} props.onSubmit
 *        Receives only the fields the user filled in. Throw to show an error.
 */
export default function BulkEditDialog({
    open,
    count,
    categories = [],
    paymentTypes = [],
    cashflowTypes = [],
    onClose,
    onSubmit,
}) {
    const [values, setValues] = useState(EMPTY);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const hasChanges = Object.values(values).some(Boolean);
    const { enqueueSnackbar } = useSnackbar()

    const handleChange = (field) => (e) =>
        setValues((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSelect = (field) => (id) =>
        setValues((prev) => ({ ...prev, [field]: id }));

    const handleClose = () => {
        if (submitting) return;
        setValues(EMPTY);
        setError(null);
        onClose();
    };

    const handleSubmit = async () => {
        const changes = Object.fromEntries(Object.entries(values).filter(([, v]) => v));
        setSubmitting(true);
        setError(null);
        try {
            await onSubmit(changes);
            setValues(EMPTY);
            onClose();
            enqueueSnackbar('Bulk Update saved successfuly ', { variant: 'success', anchorOrigin: {vertical: 'top', horizontal: 'center'}});
        } catch (err) {
            setError(err?.message || 'Could not update the transactions. Try again.');
            enqueueSnackbar(setError, {variant: 'error', anchorOrigin: {vertical: 'top', horizontal: 'center'}})
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>
                Edit {count} {count === 1 ? 'transaction' : 'transactions'}
            </DialogTitle>

            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Only the fields you fill in will change. Everything else stays as it is.
                </DialogContentText>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Stack spacing={2} sx={{ pt: 1 }}>
                    <AutocompleteField
                        label="Category"
                        value={values.category_id}
                        onChange={handleSelect('category_id')}
                        options={categories}
                        disabled={submitting}
                    />
                    <AutocompleteField
                        label="Payment type"
                        value={values.payment_type_id}
                        onChange={handleSelect('payment_type_id')}
                        options={paymentTypes}
                        disabled={submitting}
                    />
                    <AutocompleteField
                        label="Cashflow type"
                        value={values.cashflow_type_id}
                        onChange={handleSelect('cashflow_type_id')}
                        options={cashflowTypes}
                        disabled={submitting}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={submitting} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!hasChanges || submitting}
                >
                    {submitting ? 'Saving…' : `Update ${count}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}