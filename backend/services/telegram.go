package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"repair-system/models"
)

type TelegramService struct {
	BotToken        string
	ChatID          string
	Enabled         bool
	settingsService *SettingsService
}

type TelegramMessage struct {
	ChatID    string `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode,omitempty"`
}

func NewTelegramService() *TelegramService {
	settingsService := NewSettingsService()

	// Load settings from database with fallback to environment variables
	botToken := settingsService.GetSettingWithDefault(models.SettingTelegramBotToken, os.Getenv("TELEGRAM_BOT_TOKEN"))
	chatID := settingsService.GetSettingWithDefault(models.SettingTelegramChatID, os.Getenv("TELEGRAM_CHAT_ID"))
	enabled := settingsService.GetBoolSetting(models.SettingTelegramEnabled)

	// Fallback to environment variable if database setting is not set
	if !enabled {
		enabled = os.Getenv("TELEGRAM_ENABLED") == "true"
	}

	return &TelegramService{
		BotToken:        botToken,
		ChatID:          chatID,
		Enabled:         enabled,
		settingsService: settingsService,
	}
}

func NewTelegramServiceWithSettings(settingsService *SettingsService) *TelegramService {
	// Load settings from database with fallback to environment variables
	botToken := settingsService.GetSettingWithDefault(models.SettingTelegramBotToken, os.Getenv("TELEGRAM_BOT_TOKEN"))
	chatID := settingsService.GetSettingWithDefault(models.SettingTelegramChatID, os.Getenv("TELEGRAM_CHAT_ID"))
	enabled := settingsService.GetBoolSetting(models.SettingTelegramEnabled)

	// Fallback to environment variable if database setting is not set
	if !enabled {
		enabled = os.Getenv("TELEGRAM_ENABLED") == "true"
	}

	return &TelegramService{
		BotToken:        botToken,
		ChatID:          chatID,
		Enabled:         enabled,
		settingsService: settingsService,
	}
}

func (s *TelegramService) IsEnabled() bool {
	// Refresh settings from database for the latest values
	s.refreshSettings()
	return s.Enabled && s.BotToken != "" && s.ChatID != ""
}

func (s *TelegramService) refreshSettings() {
	if s.settingsService != nil {
		s.BotToken = s.settingsService.GetSettingWithDefault(models.SettingTelegramBotToken, os.Getenv("TELEGRAM_BOT_TOKEN"))
		s.ChatID = s.settingsService.GetSettingWithDefault(models.SettingTelegramChatID, os.Getenv("TELEGRAM_CHAT_ID"))
		s.Enabled = s.settingsService.GetBoolSetting(models.SettingTelegramEnabled)

		// Fallback to environment variable if database setting is not set
		if !s.Enabled {
			s.Enabled = os.Getenv("TELEGRAM_ENABLED") == "true"
		}
	}
}

func (s *TelegramService) SendMessage(message string) error {
	if !s.IsEnabled() {
		return nil // Silently skip if not enabled
	}

	telegramMsg := TelegramMessage{
		ChatID:    s.ChatID,
		Text:      message,
		ParseMode: "HTML",
	}

	jsonData, err := json.Marshal(telegramMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal telegram message: %v", err)
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", s.BotToken)

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to send telegram message: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram API returned status: %d", resp.StatusCode)
	}

	return nil
}

func (s *TelegramService) NotifyNewRepairRequest(request *models.RepairRequest, requester *models.User) error {
	if !s.IsEnabled() {
		return nil
	}

	priorityEmoji := s.getPriorityEmoji(string(request.Priority))
	statusEmoji := s.getStatusEmoji(string(request.Status))

	message := fmt.Sprintf(`🔧 <b>แจ้งซ่อมใหม่</b>

%s <b>%s</b> %s

📋 <b>รายละเอียด:</b>
• หัวข้อ: %s
• รายละเอียด: %s
• สถานที่: %s
• ระดับความสำคัญ: %s %s
• สถานะ: %s %s

👤 <b>ผู้แจ้ง:</b> %s (%s)
🕐 <b>เวลา:</b> %s

#แจ้งซ่อม #ใหม่ #%s`,
		priorityEmoji,
		request.Title,
		statusEmoji,
		request.Title,
		s.truncateText(request.Description, 100),
		s.getLocationText(&request.Location),
		s.getPriorityText(string(request.Priority)),
		priorityEmoji,
		s.getStatusText(string(request.Status)),
		statusEmoji,
		requester.FullName,
		requester.Username,
		request.CreatedAt.Format("02/01/2006 15:04"),
		strings.ToLower(string(request.Priority)))

	return s.SendMessage(message)
}

func (s *TelegramService) NotifyStatusChange(request *models.RepairRequest, oldStatus string, technician *models.User) error {
	if !s.IsEnabled() {
		return nil
	}

	statusEmoji := s.getStatusEmoji(string(request.Status))
	oldStatusEmoji := s.getStatusEmoji(oldStatus)

	message := fmt.Sprintf(`🔄 <b>เปลี่ยนสถานะงานซ่อม</b>

📋 <b>งาน:</b> %s

🔄 <b>สถานะ:</b>
%s %s ➡️ %s %s

👤 <b>ช่าง:</b> %s
🕐 <b>เวลา:</b> %s

#เปลี่ยนสถานะ #%s`,
		request.Title,
		oldStatusEmoji,
		s.getStatusText(oldStatus),
		statusEmoji,
		s.getStatusText(string(request.Status)),
		s.getTechnicianName(technician),
		time.Now().Format("02/01/2006 15:04"),
		strings.ToLower(string(request.Status)))

	return s.SendMessage(message)
}

func (s *TelegramService) NotifyAssignment(request *models.RepairRequest, technician *models.User) error {
	if !s.IsEnabled() {
		return nil
	}

	priorityEmoji := s.getPriorityEmoji(string(request.Priority))

	message := fmt.Sprintf(`👷‍♂️ <b>มอบหมายงานซ่อม</b>

📋 <b>งาน:</b> %s
🔧 <b>ช่างที่รับผิดชอบ:</b> %s
⚡ <b>ระดับความสำคัญ:</b> %s %s

📍 <b>สถานที่:</b> %s
📅 <b>เวลาที่มอบหมาย:</b> %s

#มอบหมายงาน #%s`,
		request.Title,
		technician.FullName,
		s.getPriorityText(string(request.Priority)),
		priorityEmoji,
		s.getLocationText(&request.Location),
		time.Now().Format("02/01/2006 15:04"),
		technician.Username)

	return s.SendMessage(message)
}

func (s *TelegramService) NotifyCompletion(request *models.RepairRequest, technician *models.User) error {
	if !s.IsEnabled() {
		return nil
	}

	duration := ""
	if request.CompletedAt != nil && !request.CreatedAt.IsZero() {
		d := request.CompletedAt.Sub(request.CreatedAt)
		duration = s.formatDuration(d)
	}

	message := fmt.Sprintf(`✅ <b>งานซ่อมเสร็จสิ้น</b>

📋 <b>งาน:</b> %s
🔧 <b>ช่าง:</b> %s
⏱️ <b>ระยะเวลา:</b> %s
💰 <b>ค่าใช้จ่าย:</b> %s

📅 <b>เสร็จสิ้นเมื่อ:</b> %s

#เสร็จสิ้น #สำเร็จ`,
		request.Title,
		technician.FullName,
		duration,
		s.getCostText(&request.Cost),
		request.CompletedAt.Format("02/01/2006 15:04"))

	return s.SendMessage(message)
}

func (s *TelegramService) NotifyRejection(request *models.RepairRequest, reason string, admin *models.User) error {
	if !s.IsEnabled() {
		return nil
	}

	message := fmt.Sprintf(`❌ <b>ปฏิเสธงานซ่อม</b>

📋 <b>งาน:</b> %s
👤 <b>ผู้ปฏิเสธ:</b> %s

📝 <b>เหตุผล:</b>
%s

📅 <b>เวลา:</b> %s

#ปฏิเสธ #ยกเลิก`,
		request.Title,
		admin.FullName,
		reason,
		time.Now().Format("02/01/2006 15:04"))

	return s.SendMessage(message)
}

// Helper functions
func (s *TelegramService) getPriorityEmoji(priority string) string {
	switch priority {
	case "urgent":
		return "🚨"
	case "high":
		return "🔴"
	case "medium":
		return "🟡"
	case "low":
		return "🟢"
	default:
		return "⚪"
	}
}

func (s *TelegramService) getStatusEmoji(status string) string {
	switch status {
	case "pending":
		return "⏳"
	case "in_progress":
		return "🔧"
	case "waiting_part":
		return "📦"
	case "completed":
		return "✅"
	case "rejected":
		return "❌"
	default:
		return "❓"
	}
}

func (s *TelegramService) getPriorityText(priority string) string {
	switch priority {
	case "urgent":
		return "เร่งด่วน"
	case "high":
		return "สูง"
	case "medium":
		return "ปานกลาง"
	case "low":
		return "ต่ำ"
	default:
		return priority
	}
}

func (s *TelegramService) getStatusText(status string) string {
	switch status {
	case "pending":
		return "รอดำเนินการ"
	case "in_progress":
		return "กำลังดำเนินการ"
	case "waiting_part":
		return "รออะไหล่"
	case "completed":
		return "เสร็จสิ้น"
	case "rejected":
		return "ปฏิเสธ"
	default:
		return status
	}
}

func (s *TelegramService) getTechnicianName(technician *models.User) string {
	if technician != nil {
		return technician.FullName
	}
	return "ยังไม่ได้มอบหมาย"
}

func (s *TelegramService) getLocationText(location *string) string {
	if location != nil && *location != "" {
		return *location
	}
	return "ไม่ระบุ"
}

func (s *TelegramService) getCostText(cost *float64) string {
	if cost != nil && *cost > 0 {
		return fmt.Sprintf("%.2f บาท", *cost)
	}
	return "ไม่มีค่าใช้จ่าย"
}

func (s *TelegramService) truncateText(text string, maxLength int) string {
	if len(text) <= maxLength {
		return text
	}
	return text[:maxLength] + "..."
}

func (s *TelegramService) formatDuration(d time.Duration) string {
	hours := int(d.Hours())
	if hours < 1 {
		return fmt.Sprintf("%d นาที", int(d.Minutes()))
	} else if hours < 24 {
		return fmt.Sprintf("%d ชั่วโมง", hours)
	} else {
		days := hours / 24
		return fmt.Sprintf("%d วัน", days)
	}
}
