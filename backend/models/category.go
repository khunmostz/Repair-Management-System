package models

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID          uint           `gorm:"primarykey" json:"ID"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"uniqueIndex;not null" json:"name"`
	Description string         `json:"description"`
}

// TableName specifies the table name for the Category model
func (Category) TableName() string {
	return "categories"
}
