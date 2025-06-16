import {
    Assignment as AssignmentIcon,
    Build as BuildIcon,
    Edit as EditIcon,
    Image as ImageIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    ImageList,
    ImageListItem,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RepairRequest, repairRequestAPI, User, userAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const RepairRequestDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [request, setRequest] = useState<RepairRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [editFormData, setEditFormData] = useState({
        status: '',
        technicianId: '',
        rejectionReason: '',
        cost: '',
        priority: '',
    });

    useEffect(() => {
        if (id) {
            fetchRepairRequest();
            fetchTechnicians();
        }
    }, [id]);

    const fetchRepairRequest = async () => {
        try {
            setLoading(true);
            const response = await repairRequestAPI.getById(Number(id));
            setRequest(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await userAPI.getAll();
            const techUsers = response.data.filter(user =>
                user.role === 'technician' || user.role === 'admin'
            );
            setTechnicians(techUsers);
        } catch (err) {
            console.error('Failed to fetch technicians:', err);
        }
    };

    const handleEditOpen = () => {
        if (request) {
            setEditFormData({
                status: request.status,
                technicianId: request.technicianId?.toString() || '',
                rejectionReason: request.rejectionReason || '',
                cost: request.cost?.toString() || '',
                priority: request.priority,
            });
            setEditDialogOpen(true);
        }
    };

    const handleEditSubmit = async () => {
        if (!request) return;

        try {
            setUpdateLoading(true);
            setError(null);

            const updateData: any = {};

            if (editFormData.status !== request.status) {
                updateData.status = editFormData.status;
            }

            if (editFormData.technicianId && Number(editFormData.technicianId) !== request.technicianId) {
                updateData.technicianId = Number(editFormData.technicianId);
            }

            if (editFormData.rejectionReason !== request.rejectionReason) {
                updateData.rejectionReason = editFormData.rejectionReason;
            }

            if (editFormData.cost && Number(editFormData.cost) !== request.cost) {
                updateData.cost = Number(editFormData.cost);
            }

            if (editFormData.priority !== request.priority) {
                updateData.priority = editFormData.priority;
            }

            await repairRequestAPI.update(request.ID, updateData);
            setSuccess('อัพเดทข้อมูลสำเร็จ');
            setEditDialogOpen(false);
            fetchRepairRequest(); // Reload data
        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการอัพเดท');
        } finally {
            setUpdateLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'in_progress': return 'info';
            case 'completed': return 'success';
            case 'rejected': return 'error';
            case 'waiting_part': return 'secondary';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'รอดำเนินการ';
            case 'in_progress': return 'กำลังดำเนินการ';
            case 'waiting_part': return 'รออะไหล่';
            case 'completed': return 'เสร็จสิ้น';
            case 'rejected': return 'ปฏิเสธ';
            default: return status;
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'เร่งด่วน';
            case 'high': return 'สูง';
            case 'medium': return 'ปานกลาง';
            case 'low': return 'ต่ำ';
            default: return priority;
        }
    };

    const canEdit = () => {
        return currentUser?.role === 'admin' || currentUser?.role === 'technician';
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

    if (!request) {
        return (
            <Container maxWidth="lg">
                <Alert severity="error">ไม่พบข้อมูลการแจ้งซ่อม</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 3 }}>
                <Button onClick={() => navigate('/repair-requests')} sx={{ mb: 2 }}>
                    ← กลับไปรายการแจ้งซ่อม
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4">รายละเอียดการแจ้งซ่อม #{request.ID}</Typography>
                    {canEdit() && (
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleEditOpen}
                        >
                            แก้ไข/อัพเดทสถานะ
                        </Button>
                    )}
                </Box>
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
                {/* Main Information */}
                <Box sx={{ flex: 2 }}>
                    <Card>
                        <CardHeader
                            avatar={<BuildIcon color="primary" />}
                            title={request.title}
                            subheader={`สร้างเมื่อ: ${formatDate(request.createdAt)}`}
                            action={
                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'end' }}>
                                    <Chip
                                        label={getStatusText(request.status)}
                                        color={getStatusColor(request.status)}
                                        size="small"
                                    />
                                    <Chip
                                        label={getPriorityText(request.priority)}
                                        color={getPriorityColor(request.priority)}
                                        size="small"
                                    />
                                </Box>
                            }
                        />
                        <CardContent>
                            <Typography variant="h6" gutterBottom>รายละเอียดปัญหา</Typography>
                            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                                {request.description}
                            </Typography>

                            {request.location && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" gutterBottom>สถานที่</Typography>
                                    <Typography variant="body1">{request.location}</Typography>
                                </Box>
                            )}

                            {request.category && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" gutterBottom>หมวดหมู่</Typography>
                                    <Chip label={request.category.name} variant="outlined" />
                                </Box>
                            )}

                            {request.cost && request.cost > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" gutterBottom>ค่าใช้จ่าย</Typography>
                                    <Typography variant="body1" color="primary" fontWeight="bold">
                                        {request.cost.toLocaleString()} บาท
                                    </Typography>
                                </Box>
                            )}

                            {request.rejectionReason && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" gutterBottom color="error">เหตุผลการปฏิเสธ</Typography>
                                    <Typography variant="body1" color="error">
                                        {request.rejectionReason}
                                    </Typography>
                                </Box>
                            )}

                            {/* Image Gallery */}
                            {request.images && request.images.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ImageIcon sx={{ mr: 1 }} />
                                        รูปภาพประกอบ ({request.images.length} รูป)
                                    </Typography>
                                    <ImageList
                                        sx={{ width: '100%', maxHeight: 300 }}
                                        cols={request.images.length === 1 ? 1 : (request.images.length === 2 ? 2 : 3)}
                                        rowHeight={200}
                                    >
                                        {request.images.map((imagePath: string, index: number) => (
                                            <ImageListItem key={index}>
                                                <img
                                                    src={`http://localhost:1234${imagePath}`}
                                                    alt={`รูปประกอบ ${index + 1}`}
                                                    loading="lazy"
                                                    style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => window.open(`http://localhost:1234${imagePath}`, '_blank')}
                                                />
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Side Information */}
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Requester Info */}
                        <Card>
                            <CardHeader
                                avatar={<PersonIcon />}
                                title="ผู้แจ้ง"
                            />
                            <CardContent>
                                <Typography variant="subtitle1">{request.requester?.fullName}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    @{request.requester?.username}
                                </Typography>
                                <Typography variant="body2">
                                    {request.requester?.email}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Technician Info */}
                        <Card>
                            <CardHeader
                                avatar={<AssignmentIcon />}
                                title="ช่างที่รับผิดชอบ"
                            />
                            <CardContent>
                                {request.technician ? (
                                    <>
                                        <Typography variant="subtitle1">{request.technician.fullName}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            @{request.technician.username}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        ยังไม่ได้มอบหมาย
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader
                                avatar={<ScheduleIcon />}
                                title="ไทม์ไลน์"
                            />
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">สร้างเมื่อ</Typography>
                                        <Typography variant="body2">{formatDate(request.createdAt)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">อัพเดทล่าสุด</Typography>
                                        <Typography variant="body2">{formatDate(request.updatedAt)}</Typography>
                                    </Box>
                                    {request.completedAt && (
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">เสร็จสิ้นเมื่อ</Typography>
                                            <Typography variant="body2">{formatDate(request.completedAt)}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>แก้ไข/อัพเดทสถานะ</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>สถานะ</InputLabel>
                            <Select
                                value={editFormData.status}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <MenuItem value="pending">รอดำเนินการ</MenuItem>
                                <MenuItem value="in_progress">กำลังดำเนินการ</MenuItem>
                                <MenuItem value="waiting_part">รออะไหล่</MenuItem>
                                <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                                <MenuItem value="rejected">ปฏิเสธ</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>ระดับความสำคัญ</InputLabel>
                            <Select
                                value={editFormData.priority}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, priority: e.target.value }))}
                            >
                                <MenuItem value="low">ต่ำ</MenuItem>
                                <MenuItem value="medium">ปานกลาง</MenuItem>
                                <MenuItem value="high">สูง</MenuItem>
                                <MenuItem value="urgent">เร่งด่วน</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>ช่างที่รับผิดชอบ</InputLabel>
                            <Select
                                value={editFormData.technicianId}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, technicianId: e.target.value }))}
                            >
                                <MenuItem value="">ไม่มีการมอบหมาย</MenuItem>
                                {technicians.map(tech => (
                                    <MenuItem key={tech.ID} value={tech.ID.toString()}>
                                        {tech.fullName} (@{tech.username})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="ค่าใช้จ่าย (บาท)"
                            type="number"
                            value={editFormData.cost}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, cost: e.target.value }))}
                        />

                        <TextField
                            fullWidth
                            label="เหตุผลการปฏิเสธ (ถ้าสถานะเป็นปฏิเสธ)"
                            multiline
                            rows={3}
                            value={editFormData.rejectionReason}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>ยกเลิก</Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={updateLoading}
                    >
                        {updateLoading ? <CircularProgress size={20} /> : 'บันทึก'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RepairRequestDetail;