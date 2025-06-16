import {
    Save as SaveIcon,
    Settings as SettingsIcon,
    Telegram as TelegramIcon,
    Science as TestIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { settingsAPI } from '../services/api';

interface TelegramSettings {
    enabled: boolean;
    botToken: string;
    chatId: string;
    notifyOnNewRequest: boolean;
    notifyOnStatusChange: boolean;
    notifyOnAssignment: boolean;
    notifyOnCompletion: boolean;
}

interface SystemSettings {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    autoAssignTechnicians: boolean;
    requireApproval: boolean;
    defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
    maintenanceMode: boolean;
}

const Settings: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>({
        enabled: false,
        botToken: '',
        chatId: '',
        notifyOnNewRequest: true,
        notifyOnStatusChange: true,
        notifyOnAssignment: true,
        notifyOnCompletion: true,
    });

    const [systemSettings, setSystemSettings] = useState<SystemSettings>({
        siteName: 'Repair System',
        siteDescription: 'ระบบแจ้งซ่อมออนไลน์',
        adminEmail: 'admin@example.com',
        autoAssignTechnicians: false,
        requireApproval: true,
        defaultPriority: 'medium',
        maintenanceMode: false,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsAPI.getSettings();
            const data = response.data;

            setTelegramSettings(data.telegram);
            setSystemSettings(data.system);
        } catch (err: any) {
            console.error('Failed to load settings:', err);
            setError('ไม่สามารถโหลดการตั้งค่าได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            setError(null);

            // Validate Telegram settings if enabled
            if (telegramSettings.enabled) {
                if (!telegramSettings.botToken.trim()) {
                    setError('กรุณาระบุ Bot Token');
                    return;
                }
                if (!telegramSettings.chatId.trim()) {
                    setError('กรุณาระบุ Chat ID');
                    return;
                }
            }

            // Validate system settings
            if (!systemSettings.siteName.trim()) {
                setError('กรุณาระบุชื่อเว็บไซต์');
                return;
            }
            if (!systemSettings.adminEmail.trim()) {
                setError('กรุณาระบุอีเมลผู้ดูแล');
                return;
            }

            const settingsData = {
                telegram: telegramSettings,
                system: systemSettings,
            };

            await settingsAPI.updateSettings(settingsData);
            setSuccess('บันทึกการตั้งค่าสำเร็จ');
        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
        } finally {
            setSaving(false);
        }
    };

    const handleTestTelegram = async () => {
        if (!telegramSettings.botToken.trim()) {
            setError('กรุณาระบุ Bot Token ก่อน');
            return;
        }
        if (!telegramSettings.chatId.trim()) {
            setError('กรุณาระบุ Chat ID ก่อน');
            return;
        }

        try {
            setTesting(true);
            setError(null);

            await settingsAPI.testTelegram({
                botToken: telegramSettings.botToken,
                chatId: telegramSettings.chatId,
            });

            setSuccess('ส่งข้อความทดสอบสำเร็จ! ตรวจสอบ Telegram ของคุณ');
        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการส่งข้อความทดสอบ');
        } finally {
            setTesting(false);
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">การตั้งค่าระบบ</Typography>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                    disabled={saving}
                >
                    {saving ? <CircularProgress size={20} /> : 'บันทึกการตั้งค่า'}
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

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Telegram Settings */}
                <Box sx={{ flex: 1 }}>
                    <Card>
                        <CardHeader
                            avatar={<TelegramIcon color="primary" />}
                            title="การแจ้งเตือน Telegram"
                            subheader="ตั้งค่าการแจ้งเตือนผ่าน Telegram Bot"
                        />
                        <CardContent>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={telegramSettings.enabled}
                                        onChange={(e) =>
                                            setTelegramSettings(prev => ({
                                                ...prev,
                                                enabled: e.target.checked
                                            }))
                                        }
                                    />
                                }
                                label="เปิดใช้งานการแจ้งเตือน Telegram"
                                sx={{ mb: 2 }}
                            />

                            {telegramSettings.enabled && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Bot Token"
                                        value={telegramSettings.botToken}
                                        onChange={(e) =>
                                            setTelegramSettings(prev => ({
                                                ...prev,
                                                botToken: e.target.value
                                            }))
                                        }
                                        margin="normal"
                                        helperText="ได้รับจาก @BotFather"
                                        type="password"
                                    />

                                    <TextField
                                        fullWidth
                                        label="Chat ID"
                                        value={telegramSettings.chatId}
                                        onChange={(e) =>
                                            setTelegramSettings(prev => ({
                                                ...prev,
                                                chatId: e.target.value
                                            }))
                                        }
                                        margin="normal"
                                        helperText="Chat ID ของกลุ่มหรือผู้ใช้ที่จะรับแจ้งเตือน"
                                    />

                                    <Button
                                        variant="outlined"
                                        startIcon={<TestIcon />}
                                        onClick={handleTestTelegram}
                                        disabled={testing}
                                        fullWidth
                                        sx={{ mt: 2, mb: 2 }}
                                    >
                                        {testing ? <CircularProgress size={20} /> : 'ทดสอบการส่งข้อความ'}
                                    </Button>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle2" gutterBottom>
                                        ประเภทการแจ้งเตือน
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={telegramSettings.notifyOnNewRequest}
                                                    onChange={(e) =>
                                                        setTelegramSettings(prev => ({
                                                            ...prev,
                                                            notifyOnNewRequest: e.target.checked
                                                        }))
                                                    }
                                                />
                                            }
                                            label="แจ้งเตือนเมื่อมีการแจ้งซ่อมใหม่"
                                        />

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={telegramSettings.notifyOnStatusChange}
                                                    onChange={(e) =>
                                                        setTelegramSettings(prev => ({
                                                            ...prev,
                                                            notifyOnStatusChange: e.target.checked
                                                        }))
                                                    }
                                                />
                                            }
                                            label="แจ้งเตือนเมื่อมีการเปลี่ยนสถานะ"
                                        />

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={telegramSettings.notifyOnAssignment}
                                                    onChange={(e) =>
                                                        setTelegramSettings(prev => ({
                                                            ...prev,
                                                            notifyOnAssignment: e.target.checked
                                                        }))
                                                    }
                                                />
                                            }
                                            label="แจ้งเตือนเมื่อมีการมอบหมายงาน"
                                        />

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={telegramSettings.notifyOnCompletion}
                                                    onChange={(e) =>
                                                        setTelegramSettings(prev => ({
                                                            ...prev,
                                                            notifyOnCompletion: e.target.checked
                                                        }))
                                                    }
                                                />
                                            }
                                            label="แจ้งเตือนเมื่องานเสร็จสิ้น"
                                        />
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* System Settings */}
                <Box sx={{ flex: 1 }}>
                    <Card>
                        <CardHeader
                            avatar={<SettingsIcon color="primary" />}
                            title="การตั้งค่าระบบ"
                            subheader="ตั้งค่าทั่วไปของระบบ"
                        />
                        <CardContent>
                            <TextField
                                fullWidth
                                label="ชื่อเว็บไซต์"
                                value={systemSettings.siteName}
                                onChange={(e) =>
                                    setSystemSettings(prev => ({
                                        ...prev,
                                        siteName: e.target.value
                                    }))
                                }
                                margin="normal"
                            />

                            <TextField
                                fullWidth
                                label="คำอธิบายเว็บไซต์"
                                value={systemSettings.siteDescription}
                                onChange={(e) =>
                                    setSystemSettings(prev => ({
                                        ...prev,
                                        siteDescription: e.target.value
                                    }))
                                }
                                margin="normal"
                                multiline
                                rows={2}
                            />

                            <TextField
                                fullWidth
                                label="อีเมลผู้ดูแล"
                                type="email"
                                value={systemSettings.adminEmail}
                                onChange={(e) =>
                                    setSystemSettings(prev => ({
                                        ...prev,
                                        adminEmail: e.target.value
                                    }))
                                }
                                margin="normal"
                            />

                            <FormControl fullWidth margin="normal">
                                <InputLabel>ระดับความสำคัญเริ่มต้น</InputLabel>
                                <Select
                                    value={systemSettings.defaultPriority}
                                    onChange={(e) =>
                                        setSystemSettings(prev => ({
                                            ...prev,
                                            defaultPriority: e.target.value as any
                                        }))
                                    }
                                >
                                    <MenuItem value="low">ต่ำ</MenuItem>
                                    <MenuItem value="medium">ปานกลาง</MenuItem>
                                    <MenuItem value="high">สูง</MenuItem>
                                    <MenuItem value="urgent">เร่งด่วน</MenuItem>
                                </Select>
                            </FormControl>

                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.autoAssignTechnicians}
                                                onChange={(e) =>
                                                    setSystemSettings(prev => ({
                                                        ...prev,
                                                        autoAssignTechnicians: e.target.checked
                                                    }))
                                                }
                                            />
                                        }
                                        label="มอบหมายช่างอัตโนมัติ"
                                    />
                                    <FormHelperText>
                                        จะมอบหมายงานให้ช่างที่ว่างที่สุดโดยอัตโนมัติ
                                    </FormHelperText>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.requireApproval}
                                                onChange={(e) =>
                                                    setSystemSettings(prev => ({
                                                        ...prev,
                                                        requireApproval: e.target.checked
                                                    }))
                                                }
                                            />
                                        }
                                        label="ต้องอนุมัติก่อนดำเนินการ"
                                    />
                                    <FormHelperText>
                                        ต้องได้รับการอนุมัติจาก Admin ก่อนช่างจะเริ่มงาน
                                    </FormHelperText>
                                </Box>

                                <Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={systemSettings.maintenanceMode}
                                                onChange={(e) =>
                                                    setSystemSettings(prev => ({
                                                        ...prev,
                                                        maintenanceMode: e.target.checked
                                                    }))
                                                }
                                            />
                                        }
                                        label="โหมดปิดปรับปรุง"
                                    />
                                    <FormHelperText>
                                        ปิดระบบชั่วคราวเพื่อปรับปรุง (Admin ยังเข้าได้)
                                    </FormHelperText>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
};

export default Settings;