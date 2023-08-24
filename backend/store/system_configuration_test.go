package store

import (
	"context"
	"github.com/lib/pq"
	"testing"

	"github.com/stretchr/testify/assert"
	_ "gorm.io/driver/postgres"
)

func TestStore_GetSystemConfiguration(t *testing.T) {
	defer teardown(t)

	cfg, err := store.GetSystemConfiguration(context.Background())
	assert.NoError(t, err)
	assert.Equal(t, pq.StringArray{"ENOENT.*", "connect ECONNREFUSED.*"}, cfg.ErrorFilters)
}
