package models

type User struct {
	BaseModel
	Email string `json:"email" gorm:"unique;not null"`
	Name  string `json:"name" gorm:"not null"`
}
