'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    useTheme,
    alpha,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import Logo from '../Common/Logo';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

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
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [open, setOpen] = React.useState(true);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    // Hide AppShell on login and register pages
    const isAuthPage = ['/login', '/register'].includes(pathname);

    if (isAuthPage) {
        return <>{children}</>;
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDesktopDrawerToggle = () => {
        setOpen(!open);
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        setMobileOpen(false); // Close mobile drawer if open
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

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
            <Toolbar /> {/* Spacer for AppBar */}
            <Divider sx={{ mb: 2 }} />
            <List>
                {MENU_ITEMS.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 1, px: 2 }}>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))}
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                borderRadius: '12px',
                                '&.Mui-selected': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                    },
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 2 : 'auto',
                                    justifyContent: 'center',
                                    color: pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path)) ? 'primary.main' : 'inherit'
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: pathname === item.path ? 600 : 400
                                }}
                                sx={{ opacity: open ? 1 : 0 }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <List sx={{ px: 2, pb: 2 }}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                            borderRadius: '12px',
                            color: 'error.main',
                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 2 : 'auto',
                                justifyContent: 'center',
                                color: 'error.main'
                            }}
                        >
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Sign Out" sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', height: '100vh', overflow: 'hidden' }}>

            {/* Top Bar - Always Full Width */}
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
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Toggle Button for Desktop Drawer - Left of Logo */}
                    <IconButton
                        onClick={handleDesktopDrawerToggle}
                        sx={{ display: { xs: 'none', sm: 'flex' }, mr: 2, color: 'text.secondary' }}
                    >
                        {open ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>

                    {/* Logo - Always Visible in Top Bar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Logo />
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {user && (
                        <Box sx={{ flexGrow: 0 }}>
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
                                <MenuItem onClick={() => { handleCloseUserMenu(); router.push('/dashboard'); }}>
                                    <Typography textAlign="center">Dashboard</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <Typography textAlign="center">Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* Side Bar - Drawer */}
            <Box
                component="nav"
                sx={{
                    width: { sm: open ? DRAWER_WIDTH : 65 }, flexShrink: { sm: 0 }, transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    })
                }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: open ? DRAWER_WIDTH : 65,
                            border: 'none',
                            bgcolor: 'background.default',
                            overflowX: 'hidden',
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                    open={open}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${open ? DRAWER_WIDTH : 65}px)` },
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflow: 'hidden', // Prevent outer scrolling
                }}
            >
                <Toolbar /> {/* Spacer for AppBar */}

                {/* 
                    "Fluent" Container 
                    Wraps children in a white rounded card to separate from the gray background 
                    mimicking a "surface" on top of the background.
                */}
                <Box
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'background.paper',
                        borderRadius: '24px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden', // Keep border radius nice
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
        </Box>
    );
}
