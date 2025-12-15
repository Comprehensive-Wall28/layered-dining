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
    Stack
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import HomeIcon from '@mui/icons-material/Home';
import Logo from '../Common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import CartDrawer from '../Cart/CartDrawer';

const MENU_ITEMS = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Reserve Table', icon: <EventSeatIcon />, path: '/reservation' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const theme = useTheme();
    const { user, logout } = useAuth();
    const { itemsCount, toggleCart } = useCart();
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

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
        </Box >
    );
}
