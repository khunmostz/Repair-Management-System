# การเข้ารหัสข้อมูลในฐานข้อมูล

## ภาพรวม

ระบบได้ถูกอัพเดทให้เก็บการตั้งค่าที่สำคัญในฐานข้อมูลแทนที่จะใช้ Environment Variables โดยข้อมูลที่มีความสำคัญจะถูกเข้ารหัสด้วย AES-256-GCM

## ข้อมูลที่ถูกเข้ารหัส

### ข้อมูลที่มีความสำคัญ (Encrypted)
- **Telegram Bot Token**: Token ของ Telegram Bot
- ข้อมูลอื่นๆ ที่เพิ่มในอนาคต

### ข้อมูลทั่วไป (Plain Text)
- Telegram Chat ID
- Site Name, Description
- Boolean settings (enabled/disabled)
- การตั้งค่าระบบอื่นๆ

## การทำงานของระบบเข้ารหัส

### 1. Encryption Key
```go
// ลำดับการหา Encryption Key
1. ENCRYPTION_KEY environment variable
2. JWT_SECRET environment variable
3. Default key (ไม่แนะนำสำหรับ production)
```

### 2. Algorithm
- **Algorithm**: AES-256-GCM
- **Key Size**: 256 bits (32 bytes)
- **Nonce**: Random generated per encryption
- **Encoding**: Base64 Standard Encoding

### 3. Database Schema
```sql
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR UNIQUE NOT NULL,
    value TEXT,  -- Encrypted สำหรับข้อมูลสำคัญ
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

## การใช้งาน

### 1. การตั้งค่า Environment Variables
```bash
# สำคัญ: ตั้งค่า encryption key ที่แข็งแรง
ENCRYPTION_KEY=your-very-strong-32-byte-key-here

# หรือใช้ JWT_SECRET (fallback)
JWT_SECRET=your-jwt-secret-key
```

### 2. การเพิ่มข้อมูลที่ต้องการเข้ารหัส
```go
// ใน services/settings.go
func (s *SettingsService) isSensitiveKey(key string) bool {
    sensitiveKeys := []string{
        models.SettingTelegramBotToken,
        // เพิ่มข้อมูลที่ต้องการเข้ารหัสที่นี่
    }
    // ...
}
```

### 3. การใช้งาน Settings Service
```go
// สร้าง service
settingsService := services.NewSettingsService()

// บันทึกข้อมูล (จะเข้ารหัสอัตโนมัติถ้าเป็นข้อมูลสำคัญ)
settingsService.SetSetting("telegram_bot_token", "1234567890:ABC...")

// อ่านข้อมูล (จะถอดรหัสอัตโนมัติ)
token, err := settingsService.GetSetting("telegram_bot_token")

// Boolean settings
settingsService.SetBoolSetting("telegram_enabled", true)
enabled := settingsService.GetBoolSetting("telegram_enabled")
```

## Security Best Practices

### 1. การจัดการ Encryption Key
```bash
# Production: ใช้ strong random key
openssl rand -base64 32

# Docker: ใช้ secrets
docker secret create encryption_key /path/to/keyfile

# Kubernetes: ใช้ secrets
kubectl create secret generic app-secrets --from-literal=encryption-key="your-key"
```

### 2. การ Backup และ Recovery
- **สำคัญ**: เก็บ encryption key ไว้แยกจากฐานข้อมูล
- หากสูญหาย encryption key ข้อมูลที่เข้ารหัสจะไม่สามารถถอดรหัสได้
- แนะนำให้ backup encryption key ในระบบจัดการ secrets

### 3. การ Migration จาก Environment Variables
```bash
# 1. Export ข้อมูลเก่า
export OLD_TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN"
export OLD_TELEGRAM_CHAT_ID="$TELEGRAM_CHAT_ID"

# 2. เริ่มระบบใหม่ (จะสร้าง default settings)

# 3. อัพเดทข้อมูลผ่าน API หรือ admin panel
curl -X PUT http://localhost:1234/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "telegram": {
      "enabled": true,
      "botToken": "'$OLD_TELEGRAM_BOT_TOKEN'",
      "chatId": "'$OLD_TELEGRAM_CHAT_ID'"
    }
  }'
```

## การตรวจสอบ

### 1. ตรวจสอบการเข้ารหัส
```sql
-- ดูข้อมูลในฐานข้อมูล
SELECT key,
       CASE
         WHEN key = 'telegram_bot_token' THEN '[ENCRYPTED]'
         ELSE value
       END as display_value
FROM settings;
```

### 2. ทดสอบการทำงาน
```go
// Test encryption/decryption
encService := services.NewEncryptionService()
original := "test-secret-data"
encrypted, _ := encService.Encrypt(original)
decrypted, _ := encService.Decrypt(encrypted)
// original == decrypted
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **"ciphertext too short"**
   - ข้อมูลถูกเก็บแบบ plain text แต่พยายามถอดรหัส
   - ลบข้อมูลเก่าและบันทึกใหม่

2. **"cipher: message authentication failed"**
   - Encryption key เปลี่ยนแปลง
   - ใช้ key เดิมหรือ re-encrypt ข้อมูล

3. **Settings ไม่อัพเดท**
   - ตรวจสอบ database permissions
   - ตรวจสอบ logs สำหรับ errors

### การ Debug
```bash
# เปิด debug mode
export GIN_MODE=debug

# ดู logs
tail -f /var/log/repair-system.log
```

## Migration จากระบบเก่า

เมื่ออัพเกรดจากเวอร์ชันที่ใช้ Environment Variables:

1. ระบบจะอ่านจาก Environment Variables ก่อน (fallback)
2. สามารถใช้หน้า Admin Settings เพื่อย้ายการตั้งค่าเข้าฐานข้อมูล
3. หลังจากบันทึกแล้ว ระบบจะใช้ข้อมูลจากฐานข้อมูลเป็นหลัก

## Performance Considerations

- การเข้ารหัส/ถอดรหัสทำงานในหน่วยความจำ (fast)
- Cache ข้อมูลที่อ่านบ่อยเพื่อลด database queries
- Telegram Service จะ cache settings ตอนเริ่มต้น