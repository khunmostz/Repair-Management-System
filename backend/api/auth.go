package api

import (
	"net/http"

	"repair-system/models"
	"repair-system/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		authService: services.NewAuthService(),
	}
}

type RegisterRequest struct {
	Username string          `json:"username" binding:"required"`
	Password string          `json:"password" binding:"required,min=6"`
	Email    string          `json:"email" binding:"required,email"`
	FullName string          `json:"fullName" binding:"required"`
	Role     models.UserRole `json:"role"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default role if not provided
	if req.Role == "" {
		req.Role = models.RoleRequester
	}

	user, err := h.authService.Register(req.Username, req.Password, req.Email, req.FullName, req.Role)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"ID":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"fullName": user.FullName,
			"role":     user.Role,
		},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, user, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"ID":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"fullName": user.FullName,
			"role":     user.Role,
		},
	})
}
