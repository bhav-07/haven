package db

import (
	"fmt"
	"sync"

	"github.com/bhav-07/haven/config"
	"github.com/gofiber/fiber/v2/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	DB     *gorm.DB
	dbOnce sync.Once
)

func InitializeDB() (*gorm.DB, error) {
	var err error

	// Use sync.Once to initialize the database connection only once
	dbOnce.Do(func() {
		conf := config.GetDBConfig()
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
			conf.Host, conf.User, conf.Password, conf.DBName, conf.Port, conf.SSLMode)

		DB, err = gorm.Open(postgres.Open(dsn))
		if err != nil {
			log.Error("Failed to connect to database", "error", err.Error())
		} else {
			log.Info("Database connected successfully")
		}
	})

	if DB == nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return DB, nil
}

func CloseDB(db *gorm.DB) {
	sqlDB, err := db.DB()
	if err != nil {
		log.Error("Failed to get DB connection", "error", err.Error())
		return
	}
	if err := sqlDB.Close(); err != nil {
		log.Error("Failed to close DB connection", "error", err.Error())
	}
}
