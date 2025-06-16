package services

import (
	"errors"
	"os"
	"time"

	"repair-system/config"
	"repair-system/models"

	"golang.org/x/crypto/bcrypt"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) Register(username, password, email, fullName string, role models.UserRole) (*models.User, error) {
	// Check if user already exists
	var existingUser models.User
	if err := config.DB.Where("username = ? OR email = ?", username, email).First(&existingUser).Error; err == nil {
		return nil, errors.New("username or email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Username: username,
		Password: string(hashedPassword),
		Email:    email,
		FullName: fullName,
		Role:     role,
	}

	if err := config.DB.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) Login(username, password string) (string, *models.User, error) {
	var user models.User
	if err := config.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return "", nil, err
	}

	// Update last login
	user.LastLogin = time.Now()
	config.DB.Save(&user)

	return tokenString, &user, nil
}
