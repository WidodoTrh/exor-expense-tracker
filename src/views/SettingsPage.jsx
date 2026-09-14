import { useState } from 'react';
import { CircularProgress, List, ListItem, ListItemText, Chip, Box, Card, CardContent, Typography, TextField, Button, MenuItem, Stack, Container, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCategoriesQuery } from '../hooks/useCategoriesQuery';
import { useInvitedListQuery } from '../hooks/useInvitedListQuery';
import { usePaymentType } from '../hooks/usePaymentType';
import { SlideDownTransition, GrowTransition, ZoomTransition } from '../component/TransitionEffect';

import global from '../appcore/global';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../component/BaseDataTable'
import DeleteIcon from '@mui/icons-material/Delete';

const ROLES = [
    { value: 'writer', label: 'Editor' },
    { value: 'reader', label: 'Readonly' },
];

const TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

export default function InvitePage() {
    const { ListCategory , newCatError, onCategoryLoad, addCategories, refetch } = useCategoriesQuery();
    const { ListPaymentType, newPTerror, onPaymenttypeLoad, addPaymentType } = usePaymentType()
    const { invitedList, invitedError, invitedLoading, revoking, invitingUser, inviteUser, revokeInvite } = useInvitedListQuery()

    const [dialogOpen, setDialogOpen] = useState(false);
    const [PTdialogOpen, setPTdialog] = useState(false);

    const [pyType, setpyType] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('expense');
    const [submitting, setSubmitting] = useState(false);

    const [tabVal, setTabVal] = useState(0)
    const { enqueueSnackbar } = useSnackbar();

    const [email, setEmail] = useState('');
    const [role, setRole] = useState('writer');

    // dt categories

    const dt_categories = [{id: 'name', label: 'Category Title'}]
    const dt_paymentType = [{id: 'name', label: 'Payment Type'}]

    const handleTabChange = (event, newVal) => (
        setTabVal(newVal)
    )

    const handleSubmitInvitation = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            await inviteUser({ inviteeEmail: email, role });
            enqueueSnackbar(`${email} has invited`, { variant: 'success' });
            setEmail('');
            setRole('writer');
        } catch (err) {
            enqueueSnackbar(err.message, { variant: 'error' });
        }
    };

    const handleRevoke = async (email) => {
        try {
        await revokeInvite(email);
            enqueueSnackbar(`Acess for ${email} revoked`, { variant: 'success' });
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to revoke';
            enqueueSnackbar(message, { variant: 'error' });
        }
    };

    // add category

    const handleClose = () => {
        setName('');
        setType('expense');
        setDialogOpen(false)
    };

    const handleClosePT = () => {
        setpyType('');
        setPTdialog(false)
    };

    const handleSubmitCategory = async () => {
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            await addCategories({ name: name.trim(), type });
            enqueueSnackbar('Kategori berhasil ditambahkan', { variant: 'success' });
            handleClose();
        } catch (err) {
            const message = err?.response?.data?.error || err.message || 'Gagal menambahkan kategori';
            enqueueSnackbar(message, { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitPT = async () => {
        if (!pyType.trim()) return;
        setSubmitting(true);
        try {
            await addPaymentType({ name: pyType.trim()});
            enqueueSnackbar('Payment Type Successfuly Added', { variant: 'success' });
            handleClosePT();
        } catch (err) {
            const message = err?.response?.data?.error || err.message || 'Failed to add payment type';
            enqueueSnackbar(message, { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Tabs value={tabVal} onChange={handleTabChange} sx={{marginY: 2}} variant="scrollable" scrollButtons="auto">
                <Tab label="Invite Person" />
                <Tab label="Categories Configuration" />
                <Tab label="Payment Type Configuration" />
            </Tabs>

            { tabVal === 0 &&
                <Card>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                            Invite Others
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Invitees can log in using their own Google accounts, and their data automatically connects to this cash flow spreadsheet.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmitInvitation}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Google Mail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    fullWidth
                                    required
                                />
                                <TextField
                                    select
                                    label="Access"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    fullWidth
                                >
                                    {ROLES.map((r) => (
                                        <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                                    ))}
                                </TextField>
                                <Button type="submit" variant="contained" disabled={invitingUser || !email}>
                                    {invitingUser ? 'Inviting...' : 'Send Invitation'}
                                </Button>
                            </Stack>
                        </Box>

                        {/* invited list */}
                        <List sx={{ mt: 2 }}>
                            {invitedList.map((inv) => (
                                <ListItem
                                    key={inv.email}
                                    divider
                                    sx={{
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'stretch', sm: 'center' },
                                        gap: { xs: 1, sm: 0 },
                                        py: { xs: 1.5, sm: 1 },
                                    }}
                                >
                                    <ListItemText
                                        primary={inv.email}
                                        secondary={`Invited at ${new Date(inv.invitedAt).toLocaleDateString('id-ID')}`}
                                        primaryTypographyProps={{
                                            sx: { wordBreak: 'break-all' },
                                        }}
                                        sx={{ pr: { sm: 2 } }}
                                    />
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: { xs: 'space-between', sm: 'flex-end' },
                                            gap: 1,
                                            width: { xs: '100%', sm: 'auto' },
                                        }}
                                    >
                                        <Chip label={inv.role} size="small" />
                                        <IconButton edge="end" onClick={() => handleRevoke(inv.email)}>
                                            {revoking ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                                        </IconButton>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            }

            {tabVal === 1 &&
            <Box>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                    Add new category
                </Button>
                <DataTable loading={onCategoryLoad} columns={dt_categories} data={ListCategory} rowKey={(row) => row.id} defaultOrderBy="name" defaultOrder="asc" searchable searchPlaceholder="Search"/>

                <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm" slots={{transition: GrowTransition}} slotProps={{transition: {timeout: 650}}}>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Category Name"
                                value={name}
                                onChange={(e) => set(e.target.value)}
                                fullWidth
                                autoFocus
                            />
                            <TextField
                                select
                                label="Tipe"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                fullWidth
                            >
                                {TYPES.map((t) => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmitCategory} disabled={submitting || !name.trim()}>
                            {submitting ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            }
            {/* payment type list data */}
            {tabVal === 2 &&
                <Box>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setPTdialog(true)}>
                        Add new Payment Type
                    </Button>
                    <DataTable loading={onPaymenttypeLoad} columns={dt_paymentType} data={ListPaymentType} rowKey={(row) => row.id} defaultOrderBy="name" defaultOrder="asc" searchable searchPlaceholder="Search"/>

                    <Dialog open={PTdialogOpen} onClose={handleClosePT} fullWidth maxWidth="sm" slots={{transition: GrowTransition}} slotProps={{transition: {timeout: 650}}}>
                        <DialogTitle>Add Payment Type</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <TextField
                                    label="Payment Type"
                                    value={pyType}
                                    onChange={(e) => setpyType(e.target.value)}
                                    fullWidth
                                    autoFocus
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClosePT}>Cancel</Button>
                            <Button variant="contained" onClick={handleSubmitPT} disabled={submitting || !pyType.trim()}>
                                {submitting ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            }

        </Container>
    );
}