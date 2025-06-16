package main

import (
	"log"
	"os"

	"repair-system/api"
	"repair-system/config"
	"repair-system/middleware"
	"repair-system/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables (optional)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	// Set default environment variables if not set
	setDefaultEnv("DB_PATH", "repair_system.db")
	setDefaultEnv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production")
	setDefaultEnv("PORT", "1234")

	// Initialize database
	config.InitDB()

	// Initialize default settings
	settingsService := services.NewSettingsService()
	if err := settingsService.InitializeDefaultSettings(); err != nil {
		log.Printf("Warning: Failed to initialize default settings: %v", err)
	}

	// Initialize router
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowCredentials = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Initialize handlers
	authHandler := api.NewAuthHandler()
	repairRequestHandler := api.NewRepairRequestHandler()
	categoryHandler := api.NewCategoryHandler()
	userHandler := api.NewUserHandler()
	settingsHandler := api.NewSettingsHandler()
	uploadHandler := api.NewUploadHandler()

	// Public routes
	r.POST("/api/auth/register", authHandler.Register)
	r.POST("/api/auth/login", authHandler.Login)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Repair Request routes (all authenticated users can view, create)
		protected.GET("/repair-requests", repairRequestHandler.ListRepairRequests)
		protected.GET("/repair-requests/:id", repairRequestHandler.GetRepairRequest)
		protected.POST("/repair-requests", repairRequestHandler.CreateRepairRequest)

		// Category routes (all authenticated users can view)
		protected.GET("/categories", categoryHandler.ListCategories)
		protected.GET("/categories/:id", categoryHandler.GetCategory)

		// Upload routes (all authenticated users can upload)
		protected.POST("/upload/image", uploadHandler.UploadImage)
	}

	// Serve uploaded images (public access)
	r.GET("/uploads/images/:filename", uploadHandler.ServeImage)

	// Admin-only routes
	adminRoutes := r.Group("/api")
	adminRoutes.Use(middleware.AuthMiddleware())
	adminRoutes.Use(middleware.RequireAdmin())
	{
		// Category management (admin only)
		adminRoutes.POST("/categories", categoryHandler.CreateCategory)
		adminRoutes.PUT("/categories/:id", categoryHandler.UpdateCategory)
		adminRoutes.DELETE("/categories/:id", categoryHandler.DeleteCategory)

		// User management (admin only)
		adminRoutes.GET("/users", userHandler.ListUsers)
		adminRoutes.GET("/users/:id", userHandler.GetUser)
		adminRoutes.POST("/users", userHandler.CreateUser)
		adminRoutes.PUT("/users/:id", userHandler.UpdateUser)
		adminRoutes.DELETE("/users/:id", userHandler.DeleteUser)

		// Settings management (admin only)
		adminRoutes.GET("/settings", settingsHandler.GetSettings)
		adminRoutes.PUT("/settings", settingsHandler.UpdateSettings)
		adminRoutes.POST("/settings/test-telegram", settingsHandler.TestTelegram)
	}

	// Technician and Admin routes
	techRoutes := r.Group("/api")
	techRoutes.Use(middleware.AuthMiddleware())
	techRoutes.Use(middleware.RequireAdminOrTechnician())
	{
		// Repair Request management (technician/admin only)
		techRoutes.PUT("/repair-requests/:id", repairRequestHandler.UpdateRepairRequest)
		techRoutes.DELETE("/repair-requests/:id", repairRequestHandler.DeleteRepairRequest)
	}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Get port from environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Starting server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// setDefaultEnv sets environment variable if not already set
func setDefaultEnv(key, defaultValue string) {
	if os.Getenv(key) == "" {
		os.Setenv(key, defaultValue)
	}
}
