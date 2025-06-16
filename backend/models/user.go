package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin      UserRole = "admin"
	RoleTechnician UserRole = "technician"
	RoleRequester  UserRole = "requester"
)

type User struct {
	ID          uint           `gorm:"primarykey" json:"ID"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Username    string         `gorm:"uniqueIndex;not null" json:"username"`
	Password    string         `gorm:"not null" json:"-"`
	Email       string         `gorm:"uniqueIndex;not null" json:"email"`
	FullName    string         `json:"fullName"`
	Role        UserRole       `gorm:"type:varchar(20);not null" json:"role"`
	PhoneNumber string         `json:"phoneNumber"`
	TelegramID  string         `json:"telegramId"`
	LastLogin   time.Time      `json:"lastLogin"`
}

// TableName specifies the table name for the User model
func (User) TableName() string {
	return "users"
}
