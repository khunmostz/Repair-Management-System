package config

import (
	"log"
	"os"

	"repair-system/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	// Get database path from environment variable or use default
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "repair_system.db"
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	err = db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.RepairRequest{},
		&models.Comment{},
		&models.PartUsed{},
		&models.Setting{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db
	log.Println("Database connected and migrated successfully")
}
