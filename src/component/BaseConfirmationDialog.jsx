import { useState, useCallback, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
Button,
} from '@mui/material';

export function useConfirmDialog() {
    const [dialogState, setDialogState] = useState({
        open: false,
        title: '',
        message: '',
    });

    const resolveRef = useRef(null);

    const confirm = useCallback((title, message) => {
        setDialogState({ open: true, title, message });

        return new Promise((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleYes = () => {
        setDialogState((prev) => ({ ...prev, open: false }));
        if (resolveRef.current) {
            resolveRef.current(true); // return true kalo yes
            resolveRef.current = null;
        }
    };

    const handleNo = () => {
        setDialogState((prev) => ({ ...prev, open: false }));
        resolveRef.current = null;
    };

    const ConfirmDialog = (
        <Dialog open={dialogState.open} onClose={handleNo} slotProps={{sx: {padding : 5}}}>
            <DialogTitle>{dialogState.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{dialogState.message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleNo} color="inherit">
                No
                </Button>
                <Button onClick={handleYes} color="primary" variant="contained" autoFocus>
                Yes
                </Button>
            </DialogActions>
        </Dialog>
    );

    return { confirm, ConfirmDialog };
}