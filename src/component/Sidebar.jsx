// Sidebar.jsx
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';

function Sidebar({ open, width }) {
    return (
        <Drawer
            variant="persistent"
            anchor="right"
            open={open}
            sx={{
                width: 0,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    position: 'fixed',
                    top: (theme) => theme.mixins.toolbar.minHeight,
                    width: width,
                    height: `calc(100% - 64px)`,
                    overflowX: 'hidden',
                    transition: (theme) =>
                        theme.transitions.create(['width', 'transform'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    boxSizing: 'border-box',
                    borderLeft: (theme) => open ? `1px solid ${theme.palette.divider}` : 'none',
                    borderRight: 'none',
                    zIndex: (theme) => theme.zIndex.appBar - 1,
                },
            }}
        >
            <Divider />
        </Drawer>
    );
}

export default Sidebar;