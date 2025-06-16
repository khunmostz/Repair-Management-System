import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
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
import { Category, categoryAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [dialogLoading, setDialogLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryAPI.getAll();
            setCategories(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
            });
        }
        setDialogOpen(true);
        setError(null);
        setSuccess(null);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('กรุณาระบุชื่อหมวดหมู่');
            return;
        }

        try {
            setDialogLoading(true);
            setError(null);

            if (editingCategory) {
                // Update existing category
                await categoryAPI.update(editingCategory.ID, {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                });
                setSuccess('อัปเดตหมวดหมู่สำเร็จ');
            } else {
                // Create new category
                await categoryAPI.create({
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                });
                setSuccess('เพิ่มหมวดหมู่สำเร็จ');
            }

            handleCloseDialog();
            fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
        } finally {
            setDialogLoading(false);
        }
    };

    const handleDelete = async (category: Category) => {
        if (!window.confirm(`คุณต้องการลบหมวดหมู่ "${category.name}" หรือไม่?`)) {
            return;
        }

        try {
            await categoryAPI.delete(category.ID);
            setSuccess('ลบหมวดหมู่สำเร็จ');
            fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
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
                <Typography variant="h4">จัดการหมวดหมู่</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    เพิ่มหมวดหมู่
                </Button>
            </Box>

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

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>รหัส</TableCell>
                            <TableCell>ชื่อหมวดหมู่</TableCell>
                            <TableCell>คำอธิบาย</TableCell>
                            <TableCell>วันที่สร้าง</TableCell>
                            <TableCell>วันที่แก้ไข</TableCell>
                            <TableCell>การดำเนินการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="textSecondary">
                                        ยังไม่มีหมวดหมู่
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.ID}>
                                    <TableCell>{category.ID}</TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {category.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {category.description || '-'}
                                    </TableCell>
                                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                                    <TableCell>{formatDate(category.updatedAt)}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(category)}
                                            title="แก้ไข"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(category)}
                                            title="ลบ"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="ชื่อหมวดหมู่"
                            fullWidth
                            variant="outlined"
                            value={formData.name}
                            onChange={handleFormChange}
                            required
                            disabled={dialogLoading}
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="คำอธิบาย"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={handleFormChange}
                            disabled={dialogLoading}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={dialogLoading}>
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={dialogLoading}
                        >
                            {dialogLoading ? <CircularProgress size={24} /> : 'บันทึก'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default CategoryManagement;