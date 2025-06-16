import { Delete as DeleteIcon, Image as ImageIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    MenuItem,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, categoryAPI, repairRequestAPI, uploadAPI } from '../services/api';

interface FormData {
    title: string;
    description: string;
    location: string;
    categoryId: number | '';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    images: string[];
}

const RepairRequestForm: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        location: '',
        categoryId: '',
        priority: 'medium',
        images: [],
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await categoryAPI.getAll();
            setCategories(response.data);
        } catch (err: any) {
            setError('Failed to fetch categories');
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'categoryId' ? (value === '' ? '' : Number(value)) : value,
        }));
        // Clear messages when user starts typing
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const fileArray = Array.from(files);

        // Check total number of images (existing + new)
        if (formData.images.length + selectedFiles.length + fileArray.length > 3) {
            setError('สามารถแนบรูปภาพได้สูงสุด 3 รูป');
            return;
        }

        // Validate file types and sizes
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of fileArray) {
            if (!allowedTypes.includes(file.type)) {
                setError('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, GIF, WebP)');
                return;
            }
            if (file.size > maxSize) {
                setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
                return;
            }
        }

        try {
            setUploadingImages(true);
            setError(null);

            const response = await uploadAPI.uploadImages(files);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...response.data.files]
            }));

            setSelectedFiles(prev => [...prev, ...fileArray]);

            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            setError('กรุณาระบุหัวข้อปัญหา');
            return;
        }
        if (!formData.description.trim()) {
            setError('กรุณาระบุรายละเอียดปัญหา');
            return;
        }
        if (!formData.categoryId) {
            setError('กรุณาเลือกหมวดหมู่');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get current user from localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
                return;
            }

            const user = JSON.parse(userStr);

            const requestData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                location: formData.location.trim(),
                categoryId: formData.categoryId,
                priority: formData.priority,
                requesterId: user.ID,
                status: 'pending' as const,
                images: formData.images,
            };

            await repairRequestAPI.create(requestData);
            setSuccess('แจ้งซ่อมสำเร็จ! กำลังเปลี่ยนหน้า...');

            // Redirect after success
            setTimeout(() => {
                navigate('/repair-requests');
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการแจ้งซ่อม');
        } finally {
            setLoading(false);
        }
    };

    const priorityOptions = [
        { value: 'low', label: 'ต่ำ' },
        { value: 'medium', label: 'ปานกลาง' },
        { value: 'high', label: 'สูง' },
        { value: 'urgent', label: 'เร่งด่วน' },
    ];

    if (categoriesLoading) {
        return (
            <Container maxWidth="md">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    แจ้งซ่อมใหม่
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
                        fullWidth
                        label="หัวข้อปัญหา"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        margin="normal"
                        required
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="รายละเอียดปัญหา"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={4}
                        required
                        disabled={loading}
                    />

                    <TextField
                        fullWidth
                        label="สถานที่"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        margin="normal"
                        disabled={loading}
                        helperText="เช่น ห้อง 101, อาคาร A, ชั้น 2"
                    />

                    <TextField
                        fullWidth
                        select
                        label="หมวดหมู่"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        margin="normal"
                        required
                        disabled={loading}
                    >
                        <MenuItem value="">
                            <em>เลือกหมวดหมู่</em>
                        </MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.ID} value={category.ID}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        select
                        label="ระดับความสำคัญ"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        margin="normal"
                        required
                        disabled={loading}
                    >
                        {priorityOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Image Upload Section */}
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <ImageIcon sx={{ mr: 1 }} />
                            รูปภาพประกอบ (ไม่บังคับ)
                        </Typography>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            disabled={loading || uploadingImages || formData.images.length >= 3}
                        />

                        <Button
                            variant="outlined"
                            startIcon={uploadingImages ? <CircularProgress size={20} /> : <UploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading || uploadingImages || formData.images.length >= 3}
                            sx={{ mb: 2 }}
                        >
                            {uploadingImages ? 'กำลังอัพโหลด...' : 'เลือกรูปภาพ'}
                        </Button>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                            <Chip
                                size="small"
                                label={`${formData.images.length}/3 รูป`}
                                color={formData.images.length === 0 ? 'default' : 'primary'}
                            />
                            <Chip size="small" label="สูงสุด 5MB ต่อรูป" color="default" variant="outlined" />
                            <Chip size="small" label="JPG, PNG, GIF, WebP" color="default" variant="outlined" />
                        </Box>

                        {/* Image Preview */}
                        {formData.images.length > 0 && (
                            <ImageList sx={{ width: '100%', maxHeight: 200 }} cols={3} rowHeight={120}>
                                {formData.images.map((imagePath, index) => (
                                    <ImageListItem key={index}>
                                        <img
                                            src={`http://localhost:1234${imagePath}`}
                                            alt={`อัพโหลดรูปที่ ${index + 1}`}
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                height: '120px',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <ImageListItemBar
                                            sx={{
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                            }}
                                            actionIcon={
                                                <IconButton
                                                    sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                                    onClick={() => handleRemoveImage(index)}
                                                    disabled={loading}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        )}
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading || uploadingImages}
                            sx={{ minWidth: 120 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'ส่งคำขอ'}
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/repair-requests')}
                            disabled={loading}
                        >
                            ยกเลิก
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default RepairRequestForm;