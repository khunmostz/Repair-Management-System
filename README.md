# ระบบจัดการการแจ้งซ่อม (Repair Management System)

ระบบจัดการการแจ้งซ่อมที่ครอบคลุม พร้อมการแจ้งเตือนผ่าน Telegram และการเข้ารหัสฐานข้อมูล

## 🚀 คุณสมบัติหลัก

### 🔐 การจัดการผู้ใช้
- ระบบ Authentication & Authorization
- 3 ระดับผู้ใช้: Admin, Technician, Requester
- การจัดการข้อมูลผู้ใช้แบบ CRUD
- ป้องกันการลบตนเองและผู้ใช้ที่มีการแจ้งซ่อม

### 📋 การจัดการแจ้งซ่อม
- สร้างรายการแจ้งซ่อมพร้อมรูปภาพ
- ติดตามสถานะ: รอดำเนินการ, กำลังดำเนินการ, รออะไหล่, เสร็จสิ้น, ปฏิเสธ
- ระดับความสำคัญ: ต่ำ, ปานกลาง, สูง, เร่งด่วน
- มอบหมายช่างซ่อม
- บันทึกค่าใช้จ่ายและอะไหล่ที่ใช้

### 📊 Dashboard
- สถิติการแจ้งซ่อมแบบเรียลไทม์
- รายการแจ้งซ่อมล่าสุด
- แผนภูมิแสดงสถานะต่างๆ

### 📱 Telegram Integration
- แจ้งเตือนอัตโนมัติเมื่อมีการแจ้งซ่อมใหม่
- แจ้งเตือนการเปลี่ยนสถานะ
- แจ้งเตือนการมอบหมายงาน
- แจ้งเตือนการเสร็จสิ้นงาน
- ข้อความแบบ Rich HTML พร้อม Emoji

### 🔒 ความปลอดภัย
- เข้ารหัสข้อมูลสำคัญในฐานข้อมูล (AES-256-GCM)
- JWT Authentication
- Middleware การตรวจสอบสิทธิ์

## 🛠 เทคโนโลยีที่ใช้

### Backend
- **Go (Golang)** - ภาษาหลัก
- **Gin Framework** - Web framework
- **GORM** - ORM
- **SQLITE** - ฐานข้อมูล
- **JWT** - Authentication

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **React Router** - Routing

## 📦 การติดตั้ง

### ความต้องการของระบบ
- Go 1.21+
- Node.js 18+
- PostgreSQL 13+

### 1. Clone โปรเจกต์
```bash
git clone <repository-url>
cd repair-system
```

### 2. ติดตั้ง Backend
```bash
cd backend
go mod download
```

### 3. ติดตั้ง Frontend
```bash
cd frontend
npm install
```

### 4. ตั้งค่าฐานข้อมูล
```sql
CREATE DATABASE repair_system;
CREATE USER repair_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE repair_system TO repair_user;
```

### 5. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ใน `backend/`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=repair_user
DB_PASSWORD=your_password
DB_NAME=repair_system

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Encryption (Optional - จะใช้ JWT_SECRET หากไม่ระบุ)
ENCRYPTION_KEY=your-32-character-encryption-key

# Telegram (Optional - สามารถตั้งค่าใน UI ได้)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
TELEGRAM_ENABLED=true

# Server
PORT=1234
```

## 🚀 การรันระบบ

### Development Mode

**Backend:**
```bash
cd backend
go run main.go
```
Server จะรันที่ `http://localhost:1234`

**Frontend:**
```bash
cd frontend
npm start
```
Frontend จะรันที่ `http://localhost:3000`

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

## 👥 การใช้งาน

### 1. สร้างผู้ใช้ Admin คนแรก
```bash
curl -X POST http://localhost:1234/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "adminpass123",
    "fullName": "ผู้ดูแลระบบ",
    "role": "admin",
    "email": "admin@example.com"
  }'
```

### 2. เข้าสู่ระบบ
เข้าไปที่ `http://localhost:3000` และล็อกอินด้วยบัญชี admin

### 3. ตั้งค่า Telegram (ไม่บังคับ)
- ไปที่หน้า Settings
- ใส่ Bot Token และ Chat ID
- ทดสอบการส่งข้อความ

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/register` - สมัครสมาชิก

### Users (Admin only)
- `GET /api/users` - รายการผู้ใช้ทั้งหมด
- `POST /api/users` - สร้างผู้ใช้ใหม่
- `PUT /api/users/:id` - แก้ไขผู้ใช้
- `DELETE /api/users/:id` - ลบผู้ใช้

### Repair Requests
- `GET /api/repair-requests` - รายการแจ้งซ่อม
- `POST /api/repair-requests` - สร้างการแจ้งซ่อม
- `GET /api/repair-requests/:id` - รายละเอียดการแจ้งซ่อม
- `PUT /api/repair-requests/:id` - อัพเดทการแจ้งซ่อม (Technician/Admin)
- `DELETE /api/repair-requests/:id` - ลบการแจ้งซ่อม (Technician/Admin)

### Categories (Admin only)
- `GET /api/categories` - รายการหมวดหมู่
- `POST /api/categories` - สร้างหมวดหมู่
- `PUT /api/categories/:id` - แก้ไขหมวดหมู่
- `DELETE /api/categories/:id` - ลบหมวดหมู่

### Settings (Admin only)
- `GET /api/settings` - ดูการตั้งค่า
- `PUT /api/settings` - บันทึกการตั้งค่า
- `POST /api/settings/test-telegram` - ทดสอบ Telegram

## 🏗 โครงสร้างโปรเจกต์

```
repair-system/
├── backend/
│   ├── api/                 # REST API handlers
│   ├── config/             # Database config
│   ├── middleware/         # Auth middleware
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   └── main.go
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   └── utils/          # Utility functions
│   └── public/
├── DATABASE_ENCRYPTION.md  # คู่มือเข้ารหัส
├── TELEGRAM_SETUP.md      # คู่มือตั้งค่า Telegram
└── README.md
```

## 🔔 Telegram Integration

ระบบจะส่งแจ้งเตือนไปยัง Telegram เมื่อ:
- มีการแจ้งซ่อมใหม่
- เปลี่ยนสถานะการซ่อม
- มอบหมายช่างซ่อม
- งานซ่อมเสร็จสิ้น
- ปฏิเสธการซ่อม

ดูรายละเอียดการตั้งค่าใน [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)

## 🔐 Database Encryption

ระบบเข้ารหัสข้อมูลสำคัญในฐานข้อมูลอัตโนมัติ:
- Telegram Bot Token
- ข้อมูลการตั้งค่าที่สำคัญ

ดูรายละเอียดใน [DATABASE_ENCRYPTION.md](DATABASE_ENCRYPTION.md)

## 👤 บทบาทผู้ใช้

### Admin
- จัดการผู้ใช้ทั้งหมด
- จัดการหมวดหมู่การซ่อม
- จัดการการตั้งค่าระบบ
- ดูและจัดการการแจ้งซ่อมทั้งหมด

### Technician
- ดูและอัพเดทการแจ้งซ่อมที่ได้รับมอบหมาย
- เปลี่ยนสถานะการซ่อม
- บันทึกค่าใช้จ่ายและอะไหล่

### Requester
- สร้างการแจ้งซ่อมใหม่
- ดูสถานะการแจ้งซ่อมของตนเอง
- ติดตามความคืบหน้า
