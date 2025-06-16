package middleware

import (
	"net/http"

	"repair-system/models"

	"github.com/gin-gonic/gin"
)

// RequireRole middleware checks if the user has the required role
func RequireRole(roles ...models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user from context (set by AuthMiddleware)
		userInterface, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			c.Abort()
			return
		}

		user, ok := userInterface.(models.User)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
			c.Abort()
			return
		}

		// Check if user has any of the required roles
		for _, role := range roles {
			if user.Role == role {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		c.Abort()
	}
}

// RequireAdmin middleware checks if the user is an admin
func RequireAdmin() gin.HandlerFunc {
	return RequireRole(models.RoleAdmin)
}

// RequireTechnician middleware checks if the user is a technician or admin
func RequireTechnician() gin.HandlerFunc {
	return RequireRole(models.RoleTechnician, models.RoleAdmin)
}

// RequireAdminOrTechnician middleware checks if the user is admin or technician
func RequireAdminOrTechnician() gin.HandlerFunc {
	return RequireRole(models.RoleAdmin, models.RoleTechnician)
}
