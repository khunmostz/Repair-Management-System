package api

import (
	"net/http"
	"time"

	"repair-system/models"
	"repair-system/services"

	"github.com/gin-gonic/gin"
)

type SettingsHandler struct {
	settingsService *services.SettingsService
}

func NewSettingsHandler() *SettingsHandler {
	return &SettingsHandler{
		settingsService: services.NewSettingsService(),
	}
}

type TelegramSettings struct {
	Enabled              bool   `json:"enabled"`
	BotToken             string `json:"botToken"`
	ChatID               string `json:"chatId"`
	NotifyOnNewRequest   bool   `json:"notifyOnNewRequest"`
	NotifyOnStatusChange bool   `json:"notifyOnStatusChange"`
	NotifyOnAssignment   bool   `json:"notifyOnAssignment"`
	NotifyOnCompletion   bool   `json:"notifyOnCompletion"`
}

type SystemSettings struct {
	SiteName              string `json:"siteName"`
	SiteDescription       string `json:"siteDescription"`
	AdminEmail            string `json:"adminEmail"`
	AutoAssignTechnicians bool   `json:"autoAssignTechnicians"`
	RequireApproval       bool   `json:"requireApproval"`
	DefaultPriority       string `json:"defaultPriority"`
	MaintenanceMode       bool   `json:"maintenanceMode"`
}

type Settings struct {
	Telegram TelegramSettings `json:"telegram"`
	System   SystemSettings   `json:"system"`
}

// GetSettings handles GET /api/settings
func (h *SettingsHandler) GetSettings(c *gin.Context) {
	// Initialize default settings if needed
	h.settingsService.InitializeDefaultSettings()

	settings := Settings{
		Telegram: TelegramSettings{
			Enabled:              h.settingsService.GetBoolSetting(models.SettingTelegramEnabled),
			BotToken:             "***hidden***", // Don't expose the actual token for security
			ChatID:               h.settingsService.GetSettingWithDefault(models.SettingTelegramChatID, ""),
			NotifyOnNewRequest:   h.settingsService.GetBoolSetting(models.SettingTelegramNotifyNewRequest),
			NotifyOnStatusChange: h.settingsService.GetBoolSetting(models.SettingTelegramNotifyStatusChange),
			NotifyOnAssignment:   h.settingsService.GetBoolSetting(models.SettingTelegramNotifyAssignment),
			NotifyOnCompletion:   h.settingsService.GetBoolSetting(models.SettingTelegramNotifyCompletion),
		},
		System: SystemSettings{
			SiteName:              h.settingsService.GetSettingWithDefault(models.SettingSiteName, "Repair System"),
			SiteDescription:       h.settingsService.GetSettingWithDefault(models.SettingSiteDescription, "ระบบแจ้งซ่อมออนไลน์"),
			AdminEmail:            h.settingsService.GetSettingWithDefault(models.SettingAdminEmail, "admin@example.com"),
			AutoAssignTechnicians: h.settingsService.GetBoolSetting(models.SettingAutoAssignTechnicians),
			RequireApproval:       h.settingsService.GetBoolSetting(models.SettingRequireApproval),
			DefaultPriority:       h.settingsService.GetSettingWithDefault(models.SettingDefaultPriority, "medium"),
			MaintenanceMode:       h.settingsService.GetBoolSetting(models.SettingMaintenanceMode),
		},
	}

	c.JSON(http.StatusOK, settings)
}

// UpdateSettings handles PUT /api/settings
func (h *SettingsHandler) UpdateSettings(c *gin.Context) {
	var settings Settings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update Telegram settings
	if err := h.settingsService.SetBoolSetting(models.SettingTelegramEnabled, settings.Telegram.Enabled); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update telegram enabled setting"})
		return
	}

	// Only update bot token if it's not the hidden placeholder
	if settings.Telegram.BotToken != "" && settings.Telegram.BotToken != "***hidden***" {
		if err := h.settingsService.SetSetting(models.SettingTelegramBotToken, settings.Telegram.BotToken); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update telegram bot token"})
			return
		}
	}

	if err := h.settingsService.SetSetting(models.SettingTelegramChatID, settings.Telegram.ChatID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update telegram chat ID"})
		return
	}

	if err := h.settingsService.SetBoolSetting(models.SettingTelegramNotifyNewRequest, settings.Telegram.NotifyOnNewRequest); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification settings"})
		return
	}

	if err := h.settingsService.SetBoolSetting(models.SettingTelegramNotifyStatusChange, settings.Telegram.NotifyOnStatusChange); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification settings"})
		return
	}

	if err := h.settingsService.SetBoolSetting(models.SettingTelegramNotifyAssignment, settings.Telegram.NotifyOnAssignment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification settings"})
		return
	}

	if err := h.settingsService.SetBoolSetting(models.SettingTelegramNotifyCompletion, settings.Telegram.NotifyOnCompletion); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification settings"})
		return
	}

	// Update System settings
	if err := h.settingsService.SetSetting(models.SettingSiteName, settings.System.SiteName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update site name"})
		return
	}

	if err := h.settingsService.SetSetting(models.SettingSiteDescription, settings.System.SiteDescription); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update site description"})
		return
	}

	if err := h.settingsService.SetSetting(models.SettingAdminEmail, settings.System.AdminEmail); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update admin email"})
		return
	}

	if err := h.settingsService.SetBoolSetting(models.SettingAutoAssignTechnicians, settings.System.AutoAssignTechnicians); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update auto assign setting"})
		return
	}

	if err := h.settingsService.SetBoolSetting(models.SettingRequireApproval, settings.System.RequireApproval); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update require approval setting"})
		return
	}

	if err := h.settingsService.SetSetting(models.SettingDefaultPriority, settings.System.DefaultPriority); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update default priority"})
		return
	}

	if err := h.settingsService.SetBoolSetting(models.SettingMaintenanceMode, settings.System.MaintenanceMode); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update maintenance mode"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully"})
}

// TestTelegram handles POST /api/settings/test-telegram
func (h *SettingsHandler) TestTelegram(c *gin.Context) {
	var testData struct {
		BotToken string `json:"botToken"`
		ChatID   string `json:"chatId"`
	}

	if err := c.ShouldBindJSON(&testData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// If bot token is the hidden placeholder, get the real token from database
	botToken := testData.BotToken
	if botToken == "" || botToken == "***hidden***" {
		realToken, err := h.settingsService.GetSetting(models.SettingTelegramBotToken)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bot token not found in database. Please set it first."})
			return
		}
		if realToken == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bot token is empty. Please set it first."})
			return
		}
		botToken = realToken
	}

	// Use chat ID from request or database
	chatID := testData.ChatID
	if chatID == "" {
		chatID = h.settingsService.GetSettingWithDefault(models.SettingTelegramChatID, "")
		if chatID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Chat ID is required"})
			return
		}
	}

	// Create a temporary telegram service for testing
	testService := &services.TelegramService{
		BotToken: botToken,
		ChatID:   chatID,
		Enabled:  true,
	}

	// Send test message
	message := `🔧 <b>ระบบแจ้งซ่อม - ทดสอบการแจ้งเตือน</b>

✅ การเชื่อมต่อ Telegram Bot สำเร็จ!
📅 <b>เวลา:</b> ` + time.Now().Format("02/01/2006 15:04") + `
🔗 <b>ระบบ:</b> ` + h.settingsService.GetSettingWithDefault(models.SettingSiteName, "Repair System")

	if err := testService.SendMessage(message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to send test message: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Telegram test completed successfully"})
}
