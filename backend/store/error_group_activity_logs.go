package store

import (
	"context"

	"github.com/highlight-run/highlight/backend/model"
)

func (store *Store) CreateErrorGroupActivityLog(ctx context.Context,
	params model.ErrorGroupActivityLog) error {
	return store.DB.WithContext(ctx).Create(&params).Error
}

func (store *Store) GetErrorGroupActivityLogs(ctx context.Context, errorGroupID int) ([]model.ErrorGroupActivityLog, error) {
	errorGroupActivityLogs := []model.ErrorGroupActivityLog{}

	err := store.DB.WithContext(ctx).Where(&model.ErrorGroupActivityLog{
		ErrorGroupID: errorGroupID,
	}).Find(&errorGroupActivityLogs).Error

	if err != nil {
		return errorGroupActivityLogs, err
	}

	return errorGroupActivityLogs, nil
}
