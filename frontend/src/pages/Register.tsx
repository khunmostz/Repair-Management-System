import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear messages when user starts typing
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('กรุณาระบุชื่อผู้ใช้');
            return false;
        }
        if (!formData.email.trim()) {
            setError('กรุณาระบุอีเมล');
            return false;
        }
        if (!formData.fullName.trim()) {
            setError('กรุณาระบุชื่อ-นามสกุล');
            return false;
        }
        if (!formData.password) {
            setError('กรุณาระบุรหัสผ่าน');
            return false;
        }
        if (formData.password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('รูปแบบอีเมลไม่ถูกต้อง');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await authAPI.register({
                username: formData.username.trim(),
                email: formData.email.trim(),
                fullName: formData.fullName.trim(),
                password: formData.password,
            });

            setSuccess('สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนหน้าไปยังหน้าเข้าสู่ระบบ...');

            // Redirect to login after success
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        สมัครสมาชิก
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="ชื่อผู้ใช้"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            autoFocus
                            disabled={loading}
                            helperText="ใช้สำหรับเข้าสู่ระบบ"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="อีเมล"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="ชื่อ-นามสกุล"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="รหัสผ่าน"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            disabled={loading}
                            helperText="อย่างน้อย 6 ตัวอักษร"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="ยืนยันรหัสผ่าน"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'สมัครสมาชิก'}
                        </Button>
                        <Box textAlign="center">
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                <Typography variant="body2" color="primary">
                                    มีบัญชีแล้ว? เข้าสู่ระบบ
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;