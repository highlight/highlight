package store

import (
	"context"
	"errors"
	"sort"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/opensearch"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/queryparser"
	"github.com/samber/lo"
)

type ListErrorObjectsParams struct {
	After  *string
	Before *string
	Query  string
}

// Number of results per page
const LIMIT = 10

func (store *Store) PutEmbeddings(embeddings []*model.ErrorObjectEmbeddings) error {
	return store.db.Table("error_object_embeddings_partitioned").Model(&model.ErrorObjectEmbeddings{}).CreateInBatches(embeddings, 64).Error
}

func (store *Store) ListErrorObjects(errorGroup model.ErrorGroup, params ListErrorObjectsParams) (privateModel.ErrorObjectConnection, error) {

	var errorObjects []model.ErrorObject

	query := store.db.Where(&model.ErrorObject{ErrorGroupID: errorGroup.ID}).Limit(LIMIT + 1)

	if params.Query != "" {
		filters := queryparser.Parse(params.Query)

		if val, ok := filters.Attributes["email"]; ok {
			if len(val) > 0 && val[0] != "" {
				query.Joins("LEFT JOIN sessions ON error_objects.session_id = sessions.id").
					Where("sessions.project_id = ?", errorGroup.ProjectID). // Attaching project id so we can utilize the composite index sessions
					Where("sessions.email ILIKE ?", "%"+val[0]+"%")
			}
		}
	}

	var (
		endCursor       string
		startCursor     string
		hasNextPage     bool
		hasPreviousPage bool
	)

	if params.After != nil {
		query = query.Order("error_objects.id DESC").Where("error_objects.id < ?", *params.After)
	} else if params.Before != nil {
		query = query.Order("error_objects.id ASC").Where("error_objects.id > ?", *params.Before)
	} else {
		query = query.Order("error_objects.id DESC")
	}

	if err := query.Find(&errorObjects).Error; err != nil {
		return privateModel.ErrorObjectConnection{
			Edges:    []*privateModel.ErrorObjectEdge{},
			PageInfo: &privateModel.PageInfo{},
		}, err
	}

	if params.Before != nil {
		// Reverse the slice to maintain a descending order view
		sort.Slice(errorObjects, func(i, j int) bool {
			return errorObjects[i].ID < errorObjects[j].ID
		})
	}

	if len(errorObjects) == 0 {
		return privateModel.ErrorObjectConnection{
			Edges:    []*privateModel.ErrorObjectEdge{},
			PageInfo: &privateModel.PageInfo{},
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
	err := store.db.Where("id IN (?)", sessionIDs).Find(&sessions).Error
	if err != nil {
		return privateModel.ErrorObjectConnection{}, errors.New("Failed to preload sessions for error objects")
	}

	// Build a map of session IDs to sessions
	sessionMap := make(map[int]model.Session)
	for _, session := range sessions {
		sessionMap[session.ID] = session
	}

	edges := []*privateModel.ErrorObjectEdge{}

	for _, errorObject := range errorObjects {
		edge := &privateModel.ErrorObjectEdge{
			Cursor: strconv.Itoa(errorObject.ID),
			Node: &privateModel.ErrorObjectNode{
				ID:                 errorObject.ID,
				CreatedAt:          errorObject.CreatedAt,
				Event:              errorObject.Event,
				Timestamp:          errorObject.Timestamp,
				ErrorGroupSecureID: errorGroup.SecureID,
			},
		}

		// Attach the session we preloaded earlier to this error_object
		if errorObject.SessionID != nil {
			session, exists := sessionMap[*errorObject.SessionID]
			if exists {
				edge.Node.Session = &privateModel.ErrorObjectNodeSession{
					SecureID:    session.SecureID,
					Email:       session.Email,
					AppVersion:  session.AppVersion,
					Fingerprint: &session.Fingerprint,
				}
			}
		}

		edges = append(edges, edge)
	}

	if params.After != nil {
		hasPreviousPage = true // Assume we have a previous page if `after` is provided

		if len(edges) == LIMIT+1 {
			edges = edges[:LIMIT]
			hasNextPage = true
		}
	} else if params.Before != nil {
		hasNextPage = true // Assume we have a next page if `before` is provided

		if len(edges) == LIMIT+1 {
			edges = edges[:LIMIT]
			hasPreviousPage = true
		}

		edges = lo.Reverse(edges)
	} else {
		if len(edges) > LIMIT {
			edges = edges[:LIMIT]
			hasNextPage = true
		}
	}

	startCursor = edges[0].Cursor
	endCursor = edges[len(edges)-1].Cursor

	return privateModel.ErrorObjectConnection{
		Edges: edges,
		PageInfo: &privateModel.PageInfo{
			HasNextPage:     hasNextPage,
			HasPreviousPage: hasPreviousPage,
			StartCursor:     startCursor,
			EndCursor:       endCursor,
		},
	}, nil

}

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
	}).Take(&errorGroup).Updates(map[string]interface{}{
		"State":        params.State,
		"SnoozedUntil": params.SnoozedUntil,
	}).Error; err != nil {
		return errorGroup, err
	}

	eventType, err := getEventType(params.State)
	if err != nil {
		return errorGroup, err
	}

	eventData := map[string]interface{}{}

	if params.SnoozedUntil != nil {
		eventData["SnoozedUntil"] = params.SnoozedUntil
	}

	err = store.CreateErrorGroupActivityLog(ctx, model.ErrorGroupActivityLog{
		Admin:        admin,
		EventType:    eventType,
		ErrorGroupID: errorGroup.ID,
		EventData:    eventData,
	})

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
