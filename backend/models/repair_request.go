package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type RepairStatus string

const (
	StatusPending     RepairStatus = "pending"
	StatusInProgress  RepairStatus = "in_progress"
	StatusWaitingPart RepairStatus = "waiting_part"
	StatusCompleted   RepairStatus = "completed"
	StatusRejected    RepairStatus = "rejected"
)

type RepairPriority string

const (
	PriorityLow    RepairPriority = "low"
	PriorityMedium RepairPriority = "medium"
	PriorityHigh   RepairPriority = "high"
	PriorityUrgent RepairPriority = "urgent"
)

type RepairRequest struct {
	ID              uint           `gorm:"primarykey" json:"ID"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	Title           string         `gorm:"not null" json:"title"`
	Description     string         `gorm:"type:text;not null" json:"description"`
	Location        string         `json:"location"`
	CategoryID      uint           `json:"categoryId"`
	Category        Category       `json:"category"`
	RequesterID     uint           `json:"requesterId"`
	Requester       User           `json:"requester"`
	TechnicianID    *uint          `json:"technicianId"`
	Technician      *User          `json:"technician"`
	Status          RepairStatus   `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	Priority        RepairPriority `gorm:"type:varchar(20);default:'medium'" json:"priority"`
	Images          pq.StringArray `gorm:"type:text[]" json:"images"`
	CompletedAt     *time.Time     `json:"completedAt"`
	RejectionReason string         `json:"rejectionReason"`
	Comments        []Comment      `json:"comments"`
	Cost            float64        `json:"cost"`
	PartsUsed       []PartUsed     `json:"partsUsed"`
}

// TableName specifies the table name for the RepairRequest model
func (RepairRequest) TableName() string {
	return "repair_requests"
}

type Comment struct {
	ID              uint           `gorm:"primarykey" json:"ID"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	RepairRequestID uint           `json:"repairRequestId"`
	UserID          uint           `json:"userId"`
	User            User           `json:"user"`
	Content         string         `gorm:"type:text;not null" json:"content"`
}

type PartUsed struct {
	ID              uint           `gorm:"primarykey" json:"ID"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	RepairRequestID uint           `json:"repairRequestId"`
	Name            string         `json:"name"`
	Quantity        int            `json:"quantity"`
	UnitPrice       float64        `json:"unitPrice"`
}
