package store

import (
	"context"
	"errors"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type UpdateErrorGroupParams struct {
	ID           int
	State        privateModel.ErrorState
	SnoozedUntil *time.Time
}

func (store *Store) UpdateErrorGroupStateByAdmin(ctx context.Context,
	admin model.Admin, params UpdateErrorGroupParams) (model.ErrorGroup, error) {
	return store.updateErrorGroupState(ctx, &admin, params)
}

func (store *Store) UpdateErrorGroupStateBySystem(ctx context.Context,
	params UpdateErrorGroupParams) (model.ErrorGroup, error) {
	return store.updateErrorGroupState(ctx, nil, params)
}

func (store *Store) updateErrorGroupState(ctx context.Context,
	admin *model.Admin, params UpdateErrorGroupParams) (model.ErrorGroup, error) {

	var errorGroup model.ErrorGroup

	if err := store.db.Where(&model.ErrorGroup{
		Model: model.Model{
			ID: params.ID,
		},
	}).First(&errorGroup).Updates(map[string]interface{}{
		"State":        params.State,
		"SnoozedUntil": params.SnoozedUntil,
	}).Error; err != nil {
		return errorGroup, err
	}

	eventType, err := getEventType(params.State)
	if err != nil {
		return errorGroup, err
	}

	err = store.db.Create(&model.ErrorGroupActivityLog{
		Admin:        admin,
		EventType:    eventType,
		ErrorGroupID: errorGroup.ID,
	}).Error

	if err != nil {
		return errorGroup, err
	}

	if err := store.opensearch.UpdateSynchronous(opensearch.IndexErrorsCombined, errorGroup.ID, errorGroup); err != nil {
		return errorGroup, errors.New("error updating error group state in OpenSearch")
	}

	return errorGroup, nil

}

func getEventType(state privateModel.ErrorState) (model.ErrorGroupEventType, error) {
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
