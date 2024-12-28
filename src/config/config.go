package config

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file. Using environment variables.")
	}
}

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

func GetDBConfig() *DBConfig {
	return &DBConfig{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		SSLMode:  os.Getenv("DB_SSLMODE"),
	}
}

func GetGoogleOauthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes:       []string{"profile", "email"},
		Endpoint:     google.Endpoint,
	}
}

func GetCORSConfig() *cors.Config {
	allowedOrigin := "http://localhost:5173"
	return &cors.Config{
		AllowCredentials: true,
		AllowOrigins:     allowedOrigin, // Use environment-based origin
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, Set-Cookie",
		ExposeHeaders:    "Set-Cookie",
		MaxAge:           3600,
	}
}
