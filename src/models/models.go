package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email     string  `json:"email" gorm:"type:text;unique;not null"`
	Name      string  `json:"name" gorm:"type:text;not null"`
	Spaces    []Space `gorm:"many2many:user_spaces;"`
	Character string  `json:"character" gorm:"default:Alex"`
}

type Space struct {
	gorm.Model
	Name      string `json:"name" gorm:"type:text;not null"`
	CreatedBy uint   `json:"created_by" gorm:"not null"`
	Members   []User `gorm:"many2many:user_spaces;"`
	Map       string `json:"map" gorm:"default:officecozy"`
}
