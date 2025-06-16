import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, userAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

interface UserFormData {
    username: string;
    email: string;
    fullName: string;
    password: string;
    role: 'admin' | 'technician' | 'requester';
    phoneNumber: string;
    telegramId: string;
}

const UserManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        username: '',
        email: '',
        fullName: '',
        password: '',
        role: 'requester',
        phoneNumber: '',
        telegramId: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAll();
            setUsers(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                password: '',
                role: user.role,
                phoneNumber: user.phoneNumber || '',
                telegramId: user.telegramId || '',
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                email: '',
                fullName: '',
                password: '',
                role: 'requester',
                phoneNumber: '',
                telegramId: '',
            });
        }
        setDialogOpen(true);
        setError(null);
        setSuccess(null);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            fullName: '',
            password: '',
            role: 'requester',
            phoneNumber: '',
            telegramId: '',
        });
        setError(null);
        setSuccess(null);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.username.trim()) {
            setError('กรุณาระบุชื่อผู้ใช้');
            return;
        }
        if (!formData.email.trim()) {
            setError('กรุณาระบุอีเมล');
            return;
        }
        if (!formData.fullName.trim()) {
            setError('กรุณาระบุชื่อ-นามสกุล');
            return;
        }
        if (!editingUser && !formData.password) {
            setError('กรุณาระบุรหัสผ่าน');
            return;
        }
        if (formData.password && formData.password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('รูปแบบอีเมลไม่ถูกต้อง');
            return;
        }

        try {
            setFormLoading(true);
            setError(null);

            const userData = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                fullName: formData.fullName.trim(),
                role: formData.role,
                phoneNumber: formData.phoneNumber.trim(),
                telegramId: formData.telegramId.trim(),
                ...(formData.password && { password: formData.password }),
            };

            if (editingUser) {
                await userAPI.update(editingUser.ID, userData);
                setSuccess('อัพเดทข้อมูลผู้ใช้สำเร็จ');
            } else {
                await userAPI.create(userData);
                setSuccess('สร้างผู้ใช้ใหม่สำเร็จ');
            }

            fetchUsers();
            handleCloseDialog();
        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (userId === currentUser?.ID) {
            setError('ไม่สามารถลบบัญชีของตนเองได้');
            setDeleteDialogOpen(false);
            return;
        }

        if (!window.confirm('คุณต้องการลบผู้ใช้นี้หรือไม่?')) {
            return;
        }

        try {
            await userAPI.delete(userId);
            setSuccess('ลบผู้ใช้สำเร็จ');
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'technician':
                return 'warning';
            case 'requester':
                return 'info';
            default:
                return 'default';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'admin':
                return 'ผู้ดูแลระบบ';
            case 'technician':
                return 'ช่างเทคนิค';
            case 'requester':
                return 'ผู้แจ้ง';
            default:
                return role;
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">จัดการผู้ใช้</Typography>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    เพิ่มผู้ใช้ใหม่
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ผู้ใช้</TableCell>
                            <TableCell>อีเมล</TableCell>
                            <TableCell>บทบาท</TableCell>
                            <TableCell>เบอร์โทร</TableCell>
                            <TableCell>Telegram</TableCell>
                            <TableCell>วันที่สร้าง</TableCell>
                            <TableCell align="center">จัดการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.ID} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                            {user.fullName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2">
                                                {user.fullName}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                @{user.username}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getRoleText(user.role)}
                                        color={getRoleColor(user.role)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{user.phoneNumber || '-'}</TableCell>
                                <TableCell>{user.telegramId || '-'}</TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(user)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    {currentUser?.ID !== user.ID && (
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setDeleteDialogOpen(true);
                                                setEditingUser(user);
                                            }}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* User Form Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
                </DialogTitle>
                <form onSubmit={handleFormSubmit}>
                    <DialogContent dividers>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="ชื่อผู้ใช้"
                            value={formData.username}
                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            margin="normal"
                            required
                            disabled={formLoading}
                        />

                        <TextField
                            fullWidth
                            label="อีเมล"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            margin="normal"
                            required
                            disabled={formLoading}
                        />

                        <TextField
                            fullWidth
                            label="ชื่อ-นามสกุล"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            margin="normal"
                            required
                            disabled={formLoading}
                        />

                        <TextField
                            fullWidth
                            label={editingUser ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่ต้องการเปลี่ยน)" : "รหัสผ่าน"}
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            margin="normal"
                            required={!editingUser}
                            disabled={formLoading}
                            helperText="อย่างน้อย 6 ตัวอักษร"
                        />

                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>บทบาท</InputLabel>
                            <Select
                                value={formData.role}
                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                                disabled={formLoading}
                            >
                                <MenuItem value="requester">ผู้แจ้ง</MenuItem>
                                <MenuItem value="technician">ช่างเทคนิค</MenuItem>
                                <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="เบอร์โทรศัพท์"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            margin="normal"
                            disabled={formLoading}
                        />

                        <TextField
                            fullWidth
                            label="Telegram ID"
                            value={formData.telegramId}
                            onChange={(e) => setFormData(prev => ({ ...prev, telegramId: e.target.value }))}
                            margin="normal"
                            disabled={formLoading}
                            helperText="ตัวอย่าง: @username หรือ user_id"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={formLoading}>
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={formLoading}
                        >
                            {formLoading ? <CircularProgress size={20} /> : (editingUser ? 'อัพเดท' : 'สร้าง')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setEditingUser(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>ลบผู้ใช้</DialogTitle>
                <DialogContent>
                    <Typography>คุณต้องการลบผู้ใช้นี้หรือไม่?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>ยกเลิก</Button>
                    <Button
                        onClick={() => handleDeleteUser(editingUser?.ID || 0)}
                        color="error"
                        variant="contained"
                    >
                        ลบ
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserManagement;