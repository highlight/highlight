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

func NewRepository(db *gorm.DB, opensearch *opensearch.Client) ErrorGroupsRepository {
	return ErrorGroupsRepository{
		db:         db,
		opensearch: opensearch,
	}
}

type UpdateErrorGroupParams struct {
	ID           int
	State        privateModel.ErrorState
	SnoozedUntil *time.Time
}

func (repo *ErrorGroupsRepository) UpdateErrorGroupStateByAdmin(ctx context.Context,
	admin model.Admin, params UpdateErrorGroupParams) (model.ErrorGroup, error) {
	return repo.updateErrorGroupState(ctx, &admin, params)
}

func (repo *ErrorGroupsRepository) UpdateErrorGroupStateBySystem(ctx context.Context,
	params UpdateErrorGroupParams) (model.ErrorGroup, error) {
	return repo.updateErrorGroupState(ctx, nil, params)
}

func (repo *ErrorGroupsRepository) updateErrorGroupState(ctx context.Context,
	admin *model.Admin, params UpdateErrorGroupParams) (model.ErrorGroup, error) {

	var errorGroup model.ErrorGroup

	if err := repo.db.Where(&model.ErrorGroup{
		Model: model.Model{
			ID: params.ID,
		},
	}).First(&errorGroup).Updates(map[string]interface{}{
		"State":        params.State,
		"SnoozedUntil": params.SnoozedUntil,
	}).Error; err != nil {
		return errorGroup, err
	}

	eventType, err := getEventType(params.State, params.SnoozedUntil)
	if err != nil {
		return errorGroup, err
	}

	result := repo.db.Create(&model.ErrorGroupActivityLog{
		Admin:     admin,
		EventType: eventType,
	})

	if result.Error != nil {
		return errorGroup, err
	}

	if err := repo.opensearch.UpdateSynchronous(opensearch.IndexErrorsCombined, errorGroup.ID, errorGroup); err != nil {
		return errorGroup, errors.New("error updating error group state in OpenSearch")
	}

	return errorGroup, nil

}

func getEventType(state privateModel.ErrorState, snoozedUntil *time.Time) (model.ErrorGroupEventType, error) {
	if snoozedUntil != nil {
		return model.ErrorGroupSnoozedEvent, nil
	}

	var event model.ErrorGroupEventType

	switch state {
	case privateModel.ErrorStateResolved:
		return model.ErrorGroupResolvedEvent, nil
	case privateModel.ErrorStateOpen:
		return model.ErrorGroupOpenedEvent, nil
	case privateModel.ErrorStateIgnored:
		return model.ErrorGroupIgnoredEvent, nil
	}

	return event, errors.New("unable to determine event type")
}
