import {
    Add as AddIcon,
    Edit as EditIcon,
    Image as ImageIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RepairRequest, repairRequestAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const RepairRequestsList: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<RepairRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRepairRequests();
    }, []);

    const fetchRepairRequests = async () => {
        try {
            setLoading(true);
            const response = await repairRequestAPI.getAll();
            setRequests(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch repair requests');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'in_progress':
                return 'info';
            case 'completed':
                return 'success';
            case 'rejected':
                return 'error';
            case 'waiting_part':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        switch (priority) {
            case 'urgent':
                return 'error';
            case 'high':
                return 'warning';
            case 'medium':
                return 'info';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'รอดำเนินการ';
            case 'in_progress':
                return 'กำลังดำเนินการ';
            case 'waiting_part':
                return 'รออะไหล่';
            case 'completed':
                return 'เสร็จสิ้น';
            case 'rejected':
                return 'ปฏิเสธ';
            default:
                return status;
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'เร่งด่วน';
            case 'high':
                return 'สูง';
            case 'medium':
                return 'ปานกลาง';
            case 'low':
                return 'ต่ำ';
            default:
                return priority;
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

    if (error) {
        return (
            <Container maxWidth="lg">
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">รายการแจ้งซ่อม</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/repair-requests/new')}
                >
                    แจ้งซ่อมใหม่
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>รหัส</TableCell>
                            <TableCell>หัวข้อ</TableCell>
                            <TableCell>หมวดหมู่</TableCell>
                            <TableCell>สถานะ</TableCell>
                            <TableCell>ความสำคัญ</TableCell>
                            <TableCell>ผู้แจ้ง</TableCell>
                            <TableCell>ช่างผู้รับผิดชอบ</TableCell>
                            <TableCell>วันที่แจ้ง</TableCell>
                            <TableCell>การดำเนินการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <Typography color="textSecondary">
                                        ยังไม่มีรายการแจ้งซ่อม
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (
                                <TableRow key={request.ID}>
                                    <TableCell>{request.ID}</TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {request.title}
                                            {request.images && request.images.length > 0 && (
                                                <ImageIcon
                                                    fontSize="small"
                                                    sx={{ ml: 1, color: 'primary.main', verticalAlign: 'middle' }}
                                                    titleAccess={`มีรูปภาพ ${request.images.length} รูป`}
                                                />
                                            )}
                                        </Typography>
                                        {request.location && (
                                            <Typography variant="caption" color="textSecondary">
                                                สถานที่: {request.location}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{request.category?.name || 'ไม่ระบุ'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusText(request.status)}
                                            color={getStatusColor(request.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getPriorityText(request.priority)}
                                            color={getPriorityColor(request.priority)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {request.requester?.fullName || request.requester?.username || 'ไม่ระบุ'}
                                    </TableCell>
                                    <TableCell>
                                        {request.technician?.fullName || request.technician?.username || 'ยังไม่มอบหมาย'}
                                    </TableCell>
                                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/repair-requests/${request.ID}`)}
                                            title="ดูรายละเอียด"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/repair-requests/${request.ID}/edit`)}
                                            title="แก้ไข"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default RepairRequestsList;
