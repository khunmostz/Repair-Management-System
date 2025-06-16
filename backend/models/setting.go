package models

import "gorm.io/gorm"

type Setting struct {
	gorm.Model
	Key   string `gorm:"uniqueIndex;not null" json:"key"`
	Value string `gorm:"type:text" json:"value"` // Encrypted value
}

// TableName specifies the table name for the Setting model
func (Setting) TableName() string {
	return "settings"
}

// Predefined setting keys
const (
	// Telegram settings
	SettingTelegramEnabled            = "telegram_enabled"
	SettingTelegramBotToken           = "telegram_bot_token"
	SettingTelegramChatID             = "telegram_chat_id"
	SettingTelegramNotifyNewRequest   = "telegram_notify_new_request"
	SettingTelegramNotifyStatusChange = "telegram_notify_status_change"
	SettingTelegramNotifyAssignment   = "telegram_notify_assignment"
	SettingTelegramNotifyCompletion   = "telegram_notify_completion"

	// System settings
	SettingSiteName              = "site_name"
	SettingSiteDescription       = "site_description"
	SettingAdminEmail            = "admin_email"
	SettingAutoAssignTechnicians = "auto_assign_technicians"
	SettingRequireApproval       = "require_approval"
	SettingDefaultPriority       = "default_priority"
	SettingMaintenanceMode       = "maintenance_mode"
)
