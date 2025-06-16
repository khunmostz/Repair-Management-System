import {
    Build as BuildIcon,
    Category as CategoryIcon,
    Dashboard as DashboardIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import {
    AppBar,
    Box,
    Button,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'หน้าหลัก', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'รายการแจ้งซ่อม', icon: <BuildIcon />, path: '/repair-requests' },
        { text: 'หมวดหมู่', icon: <CategoryIcon />, path: '/categories' },
        { text: 'ผู้ใช้งาน', icon: <PeopleIcon />, path: '/users' },
        { text: 'ตั้งค่า', icon: <SettingsIcon />, path: '/settings' },
    ];

    const drawer = (
        <div>
            <Toolbar sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.3rem'
                    }}
                >
                    🔧 ระบบแจ้งซ่อม
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton onClick={() => navigate(item.path)}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        sx={{
                            mt: 2,
                            mx: 1,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #e63946 0%, #3730a3 100%)',
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'white' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="ออกจากระบบ" />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
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
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Repair System
                    </Typography>
                    <Button color="inherit" onClick={() => {
                        logout();
                        navigate('/login');
                    }}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;