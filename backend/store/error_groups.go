package store

import (
	"context"
	"errors"
	"strconv"
	"time"

	kafka_queue "github.com/highlight-run/highlight/backend/kafka-queue"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"gorm.io/gorm/clause"
)

func (store *Store) ListErrorObjects(ctx context.Context, ids []int64, totalCount int64) (privateModel.ErrorObjectResults, error) {

	var errorObjects []model.ErrorObject

	query := store.DB.WithContext(ctx).
		Where("id IN (?)", ids).
		Order("error_objects.timestamp DESC")

	if err := query.Find(&errorObjects).Error; err != nil {
		return privateModel.ErrorObjectResults{
			ErrorObjects: []*privateModel.ErrorObjectNode{},
			TotalCount:   0,
		}, err
	}

	if len(errorObjects) == 0 {
		return privateModel.ErrorObjectResults{
			ErrorObjects: []*privateModel.ErrorObjectNode{},
			TotalCount:   0,
		}, nil
	}

	// Extract the non-null session IDs
	var sessionIDs []int
	for _, errorObject := range errorObjects {
		if errorObject.SessionID != nil {
			sessionIDs = append(sessionIDs, *errorObject.SessionID)
		}
	}

	// Preload sessions for non-null session IDs
	var sessions []model.Session
	err := store.DB.WithContext(ctx).Where("id IN (?)", sessionIDs).Find(&sessions).Error
	if err != nil {
		return privateModel.ErrorObjectResults{}, errors.New("Failed to preload sessions for error objects")
	}

	// Build a map of session IDs to sessions
	sessionMap := make(map[int]model.Session)
	for _, session := range sessions {
		sessionMap[session.ID] = session
	}

	var errorGroupIds []int
	for _, errorObject := range errorObjects {
		errorGroupIds = append(errorGroupIds, errorObject.ErrorGroupID)
	}

	var errorGroups []model.ErrorGroup
	err = store.DB.WithContext(ctx).Where("id IN (?)", errorGroupIds).Find(&errorGroups).Error
	if err != nil {
		return privateModel.ErrorObjectResults{}, errors.New("Failed to preload error groups for error objects")
	}

	errorGroupMap := make(map[int]model.ErrorGroup)
	for _, errorGroup := range errorGroups {
		errorGroupMap[errorGroup.ID] = errorGroup
	}

	nodes := []*privateModel.ErrorObjectNode{}

	for _, errorObject := range errorObjects {
		node := &privateModel.ErrorObjectNode{
			ID:                 errorObject.ID,
			CreatedAt:          errorObject.CreatedAt,
			Event:              errorObject.Event,
			Timestamp:          errorObject.Timestamp,
			ServiceVersion:     errorObject.ServiceVersion,
			ServiceName:        errorObject.ServiceName,
			ErrorGroupSecureID: errorGroupMap[errorObject.ErrorGroupID].SecureID,
		}

		// Attach the session we preloaded earlier to this error_object
		if errorObject.SessionID != nil {
			session, exists := sessionMap[*errorObject.SessionID]
			if exists {
				node.Session = &privateModel.ErrorObjectNodeSession{
					SecureID:    session.SecureID,
					Email:       session.Email,
					Fingerprint: &session.Fingerprint,
					Excluded:    session.Excluded,
				}
			}
		}

		nodes = append(nodes, node)
	}

	return privateModel.ErrorObjectResults{
		ErrorObjects: nodes,
		TotalCount:   totalCount,
	}, nil
}

type UpdateErrorGroupParams struct {
	ID           int
	State        privateModel.ErrorState
	SnoozedUntil *time.Time
}

func (store *Store) UpdateErrorGroupStateByAdmin(ctx context.Context,
	admin model.Admin, params UpdateErrorGroupParams) (*model.ErrorGroup, error) {
	err := store.updateErrorGroupState(ctx, &admin, params)
	if err != nil {
		return nil, err
	}

	// For user-driven state updates, write the error group directly to Clickhouse.
	// Write to the data sync queue as well to guarantee eventual consistency.
	var errorGroup model.ErrorGroup
	if err = store.DB.WithContext(ctx).Where(&model.ErrorGroup{Model: model.Model{ID: params.ID}}).First(&errorGroup).Error; err != nil {
		return nil, err
	}

	err = store.ClickhouseClient.WriteErrorGroups(ctx, []*model.ErrorGroup{&errorGroup})
	if err != nil {
		return nil, err
	}

	return &errorGroup, nil
}

func (store *Store) UpdateErrorGroupStateBySystem(ctx context.Context,
	params UpdateErrorGroupParams) error {
	return store.updateErrorGroupState(ctx, nil, params)
}

func (store *Store) updateErrorGroupState(ctx context.Context,
	admin *model.Admin, params UpdateErrorGroupParams) error {

	if err := AssertRecordFound(store.DB.WithContext(ctx).Where(&model.ErrorGroup{
		Model: model.Model{
			ID: params.ID,
		},
	}).Model(&model.ErrorGroup{}).Clauses(clause.Returning{}).Updates(map[string]interface{}{
		"State":        params.State,
		"SnoozedUntil": params.SnoozedUntil,
	})); err != nil {
		return err
	}

	eventType, err := getEventType(params.State)
	if err != nil {
		return err
	}

	eventData := map[string]interface{}{}

	if params.SnoozedUntil != nil {
		eventData["SnoozedUntil"] = params.SnoozedUntil
	}

	err = store.CreateErrorGroupActivityLog(ctx, model.ErrorGroupActivityLog{
		Admin:        admin,
		EventType:    eventType,
		ErrorGroupID: params.ID,
		EventData:    eventData,
	})

	if err != nil {
		return err
	}

	if err := store.DataSyncQueue.Submit(ctx, strconv.Itoa(params.ID), &kafka_queue.Message{Type: kafka_queue.ErrorGroupDataSync, ErrorGroupDataSync: &kafka_queue.ErrorGroupDataSyncArgs{ErrorGroupID: params.ID}}); err != nil {
		return err
	}

	return nil

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
