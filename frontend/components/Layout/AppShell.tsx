'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    useTheme,
    alpha,
    Menu,
    MenuItem,
    Tooltip,
    Button,
    Stack,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Import Help Icon
import Logo from '../Common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { feedbackService } from '../../services/feedbackService'; // Import Service
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import CartDrawer from '../Cart/CartDrawer';

const MENU_ITEMS = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Reserve Table', icon: <EventSeatIcon />, path: '/reservation' },
    { text: 'My Reservations', icon: <EventSeatIcon />, path: '/my-reservations' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const theme = useTheme();
    const { user, logout } = useAuth();
    const { itemsCount, toggleCart } = useCart();
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

    // Help Dialog State
    const [openHelpDialog, setOpenHelpDialog] = React.useState(false);
    const [helpText, setHelpText] = React.useState('');

    // Hide AppShell on login and register pages
    const isAuthPage = ['/login', '/register'].includes(pathname);

    if (isAuthPage) {
        return <>{children}</>;
    }

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenHelpDialog = () => {
        setOpenHelpDialog(true);
    };

    const handleCloseHelpDialog = () => {
        setOpenHelpDialog(false);
        setHelpText(''); // Reset text
    };

    const handleSubmitHelp = async () => {
        try {
            // Submit feedback with user's text and default 1 star rating
            await feedbackService.submitFeedback(helpText || "User requested help via 'Get Help' button", 1);
            setSnackbarMessage("Help request received. A support agent will contact you shortly.");
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleCloseHelpDialog();
        } catch (error) {
            console.error("Failed to submit help request", error);
            setSnackbarMessage("Failed to send help request. Please try again.");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleLogout = async () => {
        handleCloseUserMenu();
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.default', height: '100vh', overflow: 'hidden' }}>

            {/* Top Bar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'background.default',
                    color: 'text.primary',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <Toolbar>
                    {/* Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
                        <Logo />
                    </Box>

                    {/* Navigation Items */}
                    <Stack direction="row" spacing={1} sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
                        {MENU_ITEMS.map((item) => {
                            let path = item.path;
                            if (item.text === 'Dashboard' && user) {
                                path = user.role === 'Admin' ? '/admin' : user.role === 'Manager' ? '/manager' : '/dashboard';
                            }

                            const isActive = pathname === path || (path !== '/' && pathname.startsWith(path));
                            return (
                                <Button
                                    key={item.text}
                                    onClick={() => handleNavigation(path)}
                                    startIcon={item.icon}
                                    sx={{
                                        color: isActive ? 'primary.main' : 'text.secondary',
                                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                                            color: 'primary.main',
                                        },
                                        borderRadius: '8px',
                                        px: 2,
                                        textTransform: 'none',
                                        fontWeight: isActive ? 600 : 400,
                                    }}
                                >
                                    {item.text}
                                </Button>
                            );
                        })}
                    </Stack>

                    {/* Mobile Nav Icons (Visible only on XS) */}
                    <Stack direction="row" spacing={0} sx={{ flexGrow: 1, display: { xs: 'flex', sm: 'none' } }}>
                        {MENU_ITEMS.map((item) => {
                            let path = item.path;
                            if (item.text === 'Dashboard' && user) {
                                path = user.role === 'Admin' ? '/admin' : user.role === 'Manager' ? '/manager' : '/dashboard';
                            }

                            const isActive = pathname === path || (path !== '/' && pathname.startsWith(path));
                            return (
                                <IconButton
                                    key={item.text}
                                    onClick={() => handleNavigation(path)}
                                    sx={{
                                        color: isActive ? 'primary.main' : 'text.secondary',
                                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {item.icon}
                                </IconButton>
                            );
                        })}
                    </Stack>

                    <Box sx={{ flexGrow: 0, ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Get Help">
                            <IconButton onClick={handleOpenHelpDialog} sx={{ color: 'error.main' }}>
                                <HelpOutlineIcon />
                            </IconButton>
                        </Tooltip>
                        <IconButton onClick={() => toggleCart(true)} sx={{ color: 'text.secondary' }}>
                            <Badge badgeContent={itemsCount} color="secondary">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                        {user ? (
                            <>
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar sx={{ bgcolor: 'secondary.main', cursor: 'pointer' }}>
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <MenuItem onClick={() => {
                                        handleCloseUserMenu();
                                        const dashboardPath = user.role === 'Admin' ? '/admin' : user.role === 'Manager' ? '/manager' : '/dashboard';
                                        router.push(dashboardPath);
                                    }}>
                                        <Typography textAlign="center">Dashboard</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <Typography textAlign="center">Logout</Typography>
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    color="inherit"
                                    onClick={() => router.push('/login')}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => router.push('/register')}
                                    sx={{
                                        borderRadius: '20px',
                                        px: 3,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 2, // Reduced padding
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <Toolbar /> {/* Spacer for AppBar */}

                {/* 
                    "Fluent" Container 
                */}
                <Box
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'background.paper',
                        borderRadius: '16px', // Reduced border radius from 24px
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Inner Scrollable Container */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {children}
                    </Box>
                </Box>
            </Box>
            <CartDrawer />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Help Dialog */}
            <Dialog open={openHelpDialog} onClose={handleCloseHelpDialog}>
                <DialogTitle>Get Help</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Please describe your issue below. Our support team will be notified immediately.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="help-text"
                        label="Describe your issue"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={helpText}
                        onChange={(e) => setHelpText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseHelpDialog}>Cancel</Button>
                    <Button onClick={handleSubmitHelp} variant="contained" color="error">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}
