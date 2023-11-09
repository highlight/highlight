package store

import (
	"context"

	"github.com/highlight-run/highlight/backend/model"
)

func (store *Store) CreateErrorGroupActivityLog(ctx context.Context,
	params model.ErrorGroupActivityLog) error {
	return store.db.WithContext(ctx).Create(&params).Error
}

func (store *Store) GetErrorGroupActivityLogs(errorGroupID int) ([]model.ErrorGroupActivityLog, error) {
	errorGroupActivityLogs := []model.ErrorGroupActivityLog{}

	err := store.db.WithContext(context.TODO()).Where(&model.ErrorGroupActivityLog{
		ErrorGroupID: errorGroupID,
	}).Find(&errorGroupActivityLogs).Error

	if err != nil {
		return errorGroupActivityLogs, err
	}

	return errorGroupActivityLogs, nil
}
