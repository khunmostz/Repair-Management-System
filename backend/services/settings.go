package services

import (
	"strconv"

	"repair-system/config"
	"repair-system/models"
)

type SettingsService struct {
	encryption *EncryptionService
}

func NewSettingsService() *SettingsService {
	return &SettingsService{
		encryption: NewEncryptionService(),
	}
}

// SetSetting stores an encrypted setting value
func (s *SettingsService) SetSetting(key, value string) error {
	// Encrypt sensitive values
	if s.isSensitiveKey(key) {
		encryptedValue, err := s.encryption.Encrypt(value)
		if err != nil {
			return err
		}
		value = encryptedValue
	}

	var setting models.Setting
	result := config.DB.Where("key = ?", key).First(&setting)

	if result.Error != nil {
		// Create new setting
		setting = models.Setting{
			Key:   key,
			Value: value,
		}
		return config.DB.Create(&setting).Error
	} else {
		// Update existing setting
		setting.Value = value
		return config.DB.Save(&setting).Error
	}
}

// GetSetting retrieves and decrypts a setting value
func (s *SettingsService) GetSetting(key string) (string, error) {
	var setting models.Setting
	if err := config.DB.Where("key = ?", key).First(&setting).Error; err != nil {
		return "", err
	}

	// Decrypt sensitive values
	if s.isSensitiveKey(key) {
		return s.encryption.Decrypt(setting.Value)
	}

	return setting.Value, nil
}

// GetSettingWithDefault retrieves a setting with a fallback default value
func (s *SettingsService) GetSettingWithDefault(key, defaultValue string) string {
	value, err := s.GetSetting(key)
	if err != nil {
		return defaultValue
	}
	return value
}

// GetBoolSetting retrieves a boolean setting
func (s *SettingsService) GetBoolSetting(key string) bool {
	value, err := s.GetSetting(key)
	if err != nil {
		return false
	}

	result, err := strconv.ParseBool(value)
	if err != nil {
		return false
	}

	return result
}

// SetBoolSetting stores a boolean setting
func (s *SettingsService) SetBoolSetting(key string, value bool) error {
	return s.SetSetting(key, strconv.FormatBool(value))
}

// GetAllSettings retrieves all settings (decrypted)
func (s *SettingsService) GetAllSettings() (map[string]string, error) {
	var settings []models.Setting
	if err := config.DB.Find(&settings).Error; err != nil {
		return nil, err
	}

	result := make(map[string]string)
	for _, setting := range settings {
		if s.isSensitiveKey(setting.Key) {
			// Decrypt sensitive values
			decrypted, err := s.encryption.Decrypt(setting.Value)
			if err != nil {
				return nil, err
			}
			result[setting.Key] = decrypted
		} else {
			result[setting.Key] = setting.Value
		}
	}

	return result, nil
}

// isSensitiveKey determines if a setting key contains sensitive data that should be encrypted
func (s *SettingsService) isSensitiveKey(key string) bool {
	sensitiveKeys := []string{
		models.SettingTelegramBotToken,
		// Add more sensitive keys here as needed
	}

	for _, sensitiveKey := range sensitiveKeys {
		if key == sensitiveKey {
			return true
		}
	}
	return false
}

// InitializeDefaultSettings creates default settings if they don't exist
func (s *SettingsService) InitializeDefaultSettings() error {
	defaults := map[string]string{
		models.SettingTelegramEnabled:            "false",
		models.SettingTelegramNotifyNewRequest:   "true",
		models.SettingTelegramNotifyStatusChange: "true",
		models.SettingTelegramNotifyAssignment:   "true",
		models.SettingTelegramNotifyCompletion:   "true",
		models.SettingSiteName:                   "Repair System",
		models.SettingSiteDescription:            "ระบบแจ้งซ่อมออนไลน์",
		models.SettingAdminEmail:                 "admin@example.com",
		models.SettingAutoAssignTechnicians:      "false",
		models.SettingRequireApproval:            "true",
		models.SettingDefaultPriority:            "medium",
		models.SettingMaintenanceMode:            "false",
	}

	for key, defaultValue := range defaults {
		// Check if setting already exists
		var setting models.Setting
		if err := config.DB.Where("key = ?", key).First(&setting).Error; err != nil {
			// Setting doesn't exist, create it
			if err := s.SetSetting(key, defaultValue); err != nil {
				return err
			}
		}
	}

	return nil
}
