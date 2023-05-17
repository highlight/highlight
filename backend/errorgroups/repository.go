package errorgroups

import (
	"context"
	"errors"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"gorm.io/gorm"
)

type ErrorGroupsRepository struct {
	db         *gorm.DB
	opensearch *opensearch.Client
}

func NewRepository(db *gorm.DB, opensearch *opensearch.Client) *ErrorGroupsRepository {
	return &ErrorGroupsRepository{
		db:         db,
		opensearch: opensearch,
	}
}

func (repo *ErrorGroupsRepository) UpdateErrorGroupState(ctx context.Context, errorGroup *model.ErrorGroup,
	state privateModel.ErrorState, snoozedUntil *time.Time) (*model.ErrorGroup, error) {
	if err := repo.db.Where(&model.ErrorGroup{Model: model.Model{ID: errorGroup.ID}}).First(&errorGroup).Updates(map[string]interface{}{
		"State":        state,
		"SnoozedUntil": snoozedUntil,
	}).Error; err != nil {
		return nil, err
	}

	if err := repo.opensearch.UpdateSynchronous(opensearch.IndexErrorsCombined, errorGroup.ID, errorGroup); err != nil {
		return nil, errors.New("error updating error group state in OpenSearch")
	}

	return errorGroup, nil
}
