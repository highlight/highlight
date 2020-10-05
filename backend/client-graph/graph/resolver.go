package graph

import (
	"github.com/go-redis/redis/v8"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jinzhu/gorm"

	e "github.com/pkg/errors"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB    *gorm.DB
	Redis *redis.Client
}

func (r *Resolver) AppendProperties(sessionID int, propertiesObject map[string]string) error {
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: sessionID}}).First(&session)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return e.Wrap(err, "error receiving session")
	}

	modelFields := []model.Field{}
	for fk, fv := range propertiesObject {
		// Get the field with org_id, name, value
		field := &model.Field{}
		res = r.DB.Where(&model.Field{OrganizationID: session.OrganizationID, Name: fk, Value: fv}).First(&field)
		// If the field doesn't exist, we create it.
		if err := res.Error; err != nil || res.RecordNotFound() {
			f := &model.Field{OrganizationID: session.OrganizationID, Name: fk, Value: fv}
			if err := r.DB.Create(f).Error; err != nil {
				return e.Wrap(err, "error creating field")
			}
			field = f
		}
		modelFields = append(modelFields, *field)
	}

	re := r.DB.Model(&session).Association("Fields").Append(modelFields)
	if err := re.Error; err != nil {
		return e.Wrap(err, "error updating fields")
	}
	return nil
}
