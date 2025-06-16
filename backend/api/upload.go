package api

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// UploadImage handles POST /api/upload/image
func (h *UploadHandler) UploadImage(c *gin.Context) {
	// Create uploads directory if it doesn't exist
	uploadsDir := "uploads/images"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Parse multipart form
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
		return
	}

	// Limit to 3 files
	if len(files) > 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 3 images allowed"})
		return
	}

	var uploadedFiles []string
	allowedExtensions := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}

	for _, file := range files {
		// Check file size (max 5MB)
		if file.Size > 5*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("File %s is too large (max 5MB)", file.Filename)})
			return
		}

		// Check file extension
		ext := strings.ToLower(filepath.Ext(file.Filename))
		isAllowed := false
		for _, allowedExt := range allowedExtensions {
			if ext == allowedExt {
				isAllowed = true
				break
			}
		}
		if !isAllowed {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("File type %s not allowed", ext)})
			return
		}

		// Generate unique filename
		filename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
		filePath := filepath.Join(uploadsDir, filename)

		// Save file
		src, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open uploaded file"})
			return
		}
		defer src.Close()

		dst, err := os.Create(filePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
			return
		}
		defer dst.Close()

		if _, err = io.Copy(dst, src); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		// Return relative path for storage in database
		uploadedFiles = append(uploadedFiles, "/uploads/images/"+filename)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Files uploaded successfully",
		"files":   uploadedFiles,
	})
}

// ServeImage handles GET /uploads/images/:filename
func (h *UploadHandler) ServeImage(c *gin.Context) {
	filename := c.Param("filename")
	filePath := filepath.Join("uploads/images", filename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	c.File(filePath)
}
