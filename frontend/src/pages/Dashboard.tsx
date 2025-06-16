import {
    Add as AddIcon,
    Assignment,
    AssignmentTurnedIn,
    Build,
    Cancel,
    CheckCircle,
    Inventory,
    Timeline,
    TrendingUp
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, DashboardStats } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await dashboardAPI.getStats();
            setStats(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        switch (status) {
            case 'pending': return 'warning';
            case 'in_progress': return 'info';
            case 'waiting_part': return 'secondary';
            case 'completed': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
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

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress size={50} />
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

    if (!stats) {
        return null;
    }

    interface StatCardProps {
        title: string;
        value: number;
        icon: React.ReactElement;
        gradient: string;
        subText?: string;
    }

    const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, subText }) => (
        <Card
            sx={{
                background: gradient,
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 0.5,
                                fontSize: { xs: '2rem', sm: '2.5rem' }
                            }}
                        >
                            {value}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                opacity: 0.9,
                                fontWeight: 500,
                                fontSize: '1.1rem'
                            }}
                        >
                            {title}
                        </Typography>
                        {subText && (
                            <Typography
                                variant="caption"
                                sx={{
                                    opacity: 0.8,
                                    display: 'block',
                                    mt: 0.5
                                }}
                            >
                                {subText}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ opacity: 0.8, fontSize: 48 }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        Dashboard
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        ภาพรวมระบบแจ้งซ่อม
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/repair-requests/new')}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 3,
                        py: 1.5,
                        px: 3,
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                            boxShadow: '0 6px 25px rgba(102, 126, 234, 0.6)',
                        }
                    }}
                >
                    แจ้งซ่อมใหม่
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(6, 1fr)'
                },
                gap: 3,
                mb: 4
            }}>
                <StatCard
                    title="ทั้งหมด"
                    value={stats.totalRequests}
                    icon={<Assignment />}
                    gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    subText="รายการทั้งหมด"
                />
                <StatCard
                    title="รอดำเนินการ"
                    value={stats.pendingRequests}
                    icon={<TrendingUp />}
                    gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    subText="รอการจัดการ"
                />
                <StatCard
                    title="กำลังดำเนินการ"
                    value={stats.inProgressRequests}
                    icon={<Build />}
                    gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                    subText="กำลังซ่อม"
                />
                <StatCard
                    title="รออะไหล่"
                    value={stats.waitingPartRequests}
                    icon={<Inventory />}
                    gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                    subText="รอชิ้นส่วน"
                />
                <StatCard
                    title="เสร็จสิ้น"
                    value={stats.completedRequests}
                    icon={<CheckCircle />}
                    gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    subText="สำเร็จแล้ว"
                />
                <StatCard
                    title="ปฏิเสธ"
                    value={stats.rejectedRequests}
                    icon={<Cancel />}
                    gradient="linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)"
                    subText="ไม่อนุมัติ"
                />
            </Box>

            {/* Content Grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                gap: 3
            }}>
                {/* Recent Requests */}
                <Box>
                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            border: '1px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <AssignmentTurnedIn sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.primary'
                                    }}
                                >
                                    รายการแจ้งซ่อมล่าสุด
                                </Typography>
                            </Box>

                            {stats.recentRequests.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                    <Typography color="text.secondary" variant="h6">
                                        ยังไม่มีรายการแจ้งซ่อม
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        maxHeight: 300,
                                        overflow: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: 'rgba(0,0,0,0.05)',
                                            borderRadius: '3px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: 'rgba(0,0,0,0.2)',
                                            borderRadius: '3px',
                                        },
                                        '&::-webkit-scrollbar-thumb:hover': {
                                            background: 'rgba(0,0,0,0.3)',
                                        },
                                    }}
                                >
                                    <List sx={{ p: 0 }}>
                                        {stats.recentRequests.map((request, index) => (
                                            <ListItem
                                                key={request.ID}
                                                sx={{
                                                    border: '1px solid rgba(0,0,0,0.08)',
                                                    borderRadius: 2,
                                                    mb: 2,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                                        borderColor: 'primary.light',
                                                        transform: 'translateX(4px)',
                                                    },
                                                }}
                                                onClick={() => navigate(`/repair-requests/${request.ID}`)}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    color: 'text.primary'
                                                                }}
                                                            >
                                                                {request.title}
                                                            </Typography>
                                                            <Chip
                                                                label={getStatusText(request.status)}
                                                                color={getStatusColor(request.status)}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                            <Chip
                                                                label={getPriorityText(request.priority)}
                                                                color={getPriorityColor(request.priority)}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ mb: 0.5 }}
                                                            >
                                                                {request.description.length > 80
                                                                    ? `${request.description.substring(0, 80)}...`
                                                                    : request.description}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.disabled"
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}
                                                            >
                                                                <Timeline sx={{ fontSize: 14 }} />
                                                                {formatDate(request.createdAt)} • {request.category?.name || 'ไม่ระบุหมวดหมู่'}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}

                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/repair-requests')}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1,
                                        borderColor: 'primary.light',
                                        color: 'primary.main',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            backgroundColor: 'primary.light',
                                            color: 'white',
                                        }
                                    }}
                                >
                                    ดูทั้งหมด
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Statistics Summary */}
                <Box>
                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.1)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Timeline sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.primary'
                                    }}
                                >
                                    สถิติสรุป
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.7)',
                                    mb: 2
                                }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>อัตราการเสร็จสิ้น</Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'success.main'
                                        }}
                                    >
                                        {stats.totalRequests > 0
                                            ? `${Math.round((stats.completedRequests / stats.totalRequests) * 100)}%`
                                            : '0%'}
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.7)',
                                    mb: 2
                                }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>งานที่รอดำเนินการ</Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'warning.main'
                                        }}
                                    >
                                        {stats.pendingRequests} งาน
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.7)',
                                    mb: 2
                                }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>งานที่กำลังดำเนินการ</Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'info.main'
                                        }}
                                    >
                                        {stats.inProgressRequests} งาน
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.7)'
                                }}>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>งานที่รออะไหล่</Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'secondary.main'
                                        }}
                                    >
                                        {stats.waitingPartRequests} งาน
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard;