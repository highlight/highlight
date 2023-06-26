package store

import "github.com/highlight-run/highlight/backend/model"

func (store *Store) GetSession(sessionID int) (model.Session, error) {
	var session model.Session

	err := store.db.Where(&model.Session{
		Model: model.Model{
			ID: sessionID,
		},
	}).First(&session).Error

	return session, err
}
