package store

import (
	"github.com/highlight-run/highlight/backend/opensearch"
	"gorm.io/gorm"
)

type Store struct {
	db         *gorm.DB
	opensearch *opensearch.Client
}

func NewStore(db *gorm.DB, opensearch *opensearch.Client) *Store {
	return &Store{
		db:         db,
		opensearch: opensearch,
	}
}
