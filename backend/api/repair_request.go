package api

import (
	"net/http"
	"strconv"

	"repair-system/config"
	"repair-system/models"
	"repair-system/services"

	"github.com/gin-gonic/gin"
)

type RepairRequestHandler struct {
	telegramService *services.TelegramService
	settingsService *services.SettingsService
}

func NewRepairRequestHandler() *RepairRequestHandler {
	settingsService := services.NewSettingsService()
	return &RepairRequestHandler{
		telegramService: services.NewTelegramServiceWithSettings(settingsService),
		settingsService: settingsService,
	}
}

// ListRepairRequests handles GET /api/repair-requests
func (h *RepairRequestHandler) ListRepairRequests(c *gin.Context) {
	var requests []models.RepairRequest
	if err := config.DB.Preload("Category").Preload("Requester").Preload("Technician").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch repair requests"})
		return
	}
	c.JSON(http.StatusOK, requests)
}

// GetRepairRequest handles GET /api/repair-requests/:id
func (h *RepairRequestHandler) GetRepairRequest(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid repair request ID"})
		return
	}

	var request models.RepairRequest
	if err := config.DB.Preload("Category").Preload("Requester").Preload("Technician").Preload("Comments").Preload("PartsUsed").First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair request not found"})
		return
	}
	c.JSON(http.StatusOK, request)
}

// CreateRepairRequest handles POST /api/repair-requests
func (h *RepairRequestHandler) CreateRepairRequest(c *gin.Context) {
	var request models.RepairRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default status
	if request.Status == "" {
		request.Status = models.StatusPending
	}

	if err := config.DB.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create repair request"})
		return
	}

	// Load relationships for response and telegram notification
	config.DB.Preload("Category").Preload("Requester").First(&request, request.ID)

	// Send Telegram notification for new repair request
	if h.telegramService.IsEnabled() {
		go h.telegramService.NotifyNewRepairRequest(&request, &request.Requester)
	}

	c.JSON(http.StatusCreated, request)
}

// UpdateRepairRequest handles PUT /api/repair-requests/:id
func (h *RepairRequestHandler) UpdateRepairRequest(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid repair request ID"})
		return
	}

	var request models.RepairRequest
	if err := config.DB.Preload("Technician").First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair request not found"})
		return
	}

	// Store old values for notification comparison
	oldStatus := string(request.Status)
	oldTechnicianID := request.TechnicianID

	var updateData models.RepairRequest
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	if updateData.Title != "" {
		request.Title = updateData.Title
	}
	if updateData.Description != "" {
		request.Description = updateData.Description
	}
	if updateData.Location != "" {
		request.Location = updateData.Location
	}
	if updateData.CategoryID != 0 {
		request.CategoryID = updateData.CategoryID
	}
	if updateData.TechnicianID != nil {
		request.TechnicianID = updateData.TechnicianID
	}
	if updateData.Status != "" {
		request.Status = updateData.Status
	}
	if updateData.Priority != "" {
		request.Priority = updateData.Priority
	}
	if updateData.RejectionReason != "" {
		request.RejectionReason = updateData.RejectionReason
	}
	if updateData.Cost != 0 {
		request.Cost = updateData.Cost
	}
	if updateData.CompletedAt != nil {
		request.CompletedAt = updateData.CompletedAt
	}

	if err := config.DB.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update repair request"})
		return
	}

	// Load relationships for response and notifications
	config.DB.Preload("Category").Preload("Requester").Preload("Technician").First(&request, request.ID)

	// Send Telegram notifications for updates
	if h.telegramService.IsEnabled() {
		// Notify status change
		if string(request.Status) != oldStatus {
			go h.telegramService.NotifyStatusChange(&request, oldStatus, request.Technician)
		}

		// Notify assignment change
		if request.TechnicianID != oldTechnicianID && request.TechnicianID != nil {
			go h.telegramService.NotifyAssignment(&request, request.Technician)
		}

		// Notify completion
		if request.Status == models.StatusCompleted {
			go h.telegramService.NotifyCompletion(&request, request.Technician)
		}

		// Notify rejection
		if request.Status == models.StatusRejected && request.RejectionReason != "" {
			// Get admin user who made the rejection
			userValue, exists := c.Get("user")
			if exists {
				if admin, ok := userValue.(*models.User); ok {
					go h.telegramService.NotifyRejection(&request, request.RejectionReason, admin)
				}
			}
		}
	}

	c.JSON(http.StatusOK, request)
}

// DeleteRepairRequest handles DELETE /api/repair-requests/:id
func (h *RepairRequestHandler) DeleteRepairRequest(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid repair request ID"})
		return
	}

	var request models.RepairRequest
	if err := config.DB.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair request not found"})
		return
	}

	if err := config.DB.Delete(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete repair request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Repair request deleted successfully"})
}
