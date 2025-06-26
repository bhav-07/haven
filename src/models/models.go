package models

import (
	"encoding/json"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email     string  `json:"email" gorm:"type:text;unique;not null"`
	Name      string  `json:"name" gorm:"type:text;not null"`
	Spaces    []Space `gorm:"many2many:user_spaces;"`
	Character string  `json:"character" gorm:"default:Alex"`
	Nickname  string  `json:"nickname" gorm:"type:text"`
}

type Space struct {
	gorm.Model
	Name            string          `json:"name" gorm:"type:text;not null"`
	CreatedBy       uint            `json:"created_by" gorm:"not null"`
	Members         []User          `gorm:"many2many:user_spaces;"`
	Map             string          `json:"map" gorm:"default:officecozy"`
	SpaceWhiteboard SpaceWhiteboard `json:"whiteboard" gorm:"foreignKey:SpaceID"`
}

type SpaceWhiteboard struct {
	gorm.Model
	SpaceID  uint            `json:"space_id" gorm:"uniqueIndex;not null"`
	Elements json.RawMessage `json:"elements" gorm:"type:jsonb;default:'[]'::jsonb"`
	AppState json.RawMessage `json:"app_state" gorm:"type:jsonb;default:'{}'::jsonb"`
}

type KanbanTasks struct {
	gorm.Model
	SpaceID     uint   `json:"space_id" gorm:"not null"`
	Title       string `json:"title" gorm:"type:text;not null"`
	Description string `json:"description" gorm:"type:text"`
	Status      string `json:"status" gorm:"type:text;not null;default:'TODO'"`
	Priority    string `json:"priority" gorm:"type:text;not null;default:'MEDIUM'"`
	DueDate     string `json:"due_date" gorm:"type:text;not null"`
}
