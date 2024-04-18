package store

import (
	"context"
	"strconv"
	"testing"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestListErrorObjectsNoData(t *testing.T) {
	defer teardown(t)

	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
		Event: "something broke!",
	}
	store.db.Create(&errorGroup)

	// No error objects
	connection, err := store.ListErrorObjects(errorGroup, ListErrorObjectsParams{})
	assert.NoError(t, err)

	assert.Equal(t, privateModel.ErrorObjectConnection{
		Edges:    []*privateModel.ErrorObjectEdge{},
		PageInfo: &privateModel.PageInfo{},
	}, connection)
}

func TestListErrorObjectsOneObjectNoSession(t *testing.T) {
	defer teardown(t)
	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
		Event: "something broke!",
	}
	store.db.Create(&errorGroup)

	// One error object, no session
	errorObject := model.ErrorObject{
		ErrorGroupID: errorGroup.ID,
	}
	store.db.Create(&errorObject)
	connection, err := store.ListErrorObjects(errorGroup, ListErrorObjectsParams{})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 1)

	edge := connection.Edges[0]

	assert.Equal(t, strconv.Itoa(errorObject.ID), edge.Cursor)
	assert.Equal(t, errorObject.ID, edge.Node.ID)
	assert.WithinDuration(t, errorObject.CreatedAt, edge.Node.CreatedAt, 10*time.Second)
	assert.Equal(t, errorObject.Event, edge.Node.Event)
	assert.WithinDuration(t, errorObject.Timestamp, edge.Node.Timestamp, 10*time.Second)
	assert.Equal(t, errorGroup.SecureID, edge.Node.ErrorGroupSecureID)
	assert.Nil(t, edge.Node.Session)

	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     false,
		HasPreviousPage: false,
		StartCursor:     strconv.Itoa(errorObject.ID),
		EndCursor:       strconv.Itoa(errorObject.ID),
	}, connection.PageInfo)
}

func TestListErrorObjectsOneObjectWithSession(t *testing.T) {
	teardown(t)

	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
		Event: "something broke!",
	}
	store.db.Create(&errorGroup)

	session := model.Session{
		AppVersion:  ptr.String("123"),
		Email:       ptr.String("chilly@mcwilly.com"),
		Fingerprint: 1234,
	}

	store.db.Create(&session)

	errorObject := model.ErrorObject{
		ErrorGroupID:   errorGroup.ID,
		SessionID:      &session.ID,
		ServiceVersion: "1.0.0",
	}
	store.db.Create(&errorObject)
	connection, err := store.ListErrorObjects(errorGroup, ListErrorObjectsParams{})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 1)

	edge := connection.Edges[0]

	assert.Equal(t, strconv.Itoa(errorObject.ID), edge.Cursor)
	assert.Equal(t, errorObject.ID, edge.Node.ID)
	assert.WithinDuration(t, errorObject.CreatedAt, edge.Node.CreatedAt, 10*time.Second)
	assert.Equal(t, errorObject.Event, edge.Node.Event)
	assert.Equal(t, errorObject.ServiceVersion, edge.Node.ServiceVersion)
	assert.Equal(t, errorGroup.SecureID, edge.Node.ErrorGroupSecureID)
	assert.Equal(t, &privateModel.ErrorObjectNodeSession{
		SecureID:    session.SecureID,
		Email:       session.Email,
		Fingerprint: &session.Fingerprint,
		Excluded:    session.Excluded,
	}, edge.Node.Session)

	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     false,
		HasPreviousPage: false,
		StartCursor:     strconv.Itoa(errorObject.ID),
		EndCursor:       strconv.Itoa(errorObject.ID),
	}, connection.PageInfo)
}

func TestListErrorObjectsSearchByEmail(t *testing.T) {
	defer teardown(t)
	errorGroup := model.ErrorGroup{
		State:     privateModel.ErrorStateOpen,
		Event:     "something broke!",
		ProjectID: 1,
	}
	store.db.Create(&errorGroup)

	session1 := model.Session{
		Email:     ptr.String("chilly@mcwilly.com"),
		ProjectID: 1,
	}

	session2 := model.Session{
		Email:     ptr.String("scoutie@mcwoutie.com"),
		ProjectID: 1,
	}

	store.db.Create(&session1)
	store.db.Create(&session2)

	store.db.Create(&model.ErrorObject{
		ErrorGroupID: errorGroup.ID,
		SessionID:    &session1.ID,
	})

	store.db.Create(&model.ErrorObject{
		ErrorGroupID: errorGroup.ID,
		SessionID:    &session2.ID,
	})

	connection, err := store.ListErrorObjects(errorGroup, ListErrorObjectsParams{
		Query: "email:scoutie@mcwoutie.com",
	})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 1)

	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{
		Query: "email:mcwoutie",
	})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 1)
}

func TestListErrorObjectsSearchBySessionAndEmail(t *testing.T) {
	defer teardown(t)
	errorGroup := model.ErrorGroup{
		State:     privateModel.ErrorStateOpen,
		Event:     "something broke!",
		ProjectID: 1,
	}
	store.db.Create(&errorGroup)

	session1 := model.Session{
		Email:     ptr.String("foo@example.com"),
		ProjectID: 1,
		Excluded:  false,
	}

	session2 := model.Session{
		Email:     ptr.String("bar@example.com"),
		ProjectID: 1,
		Excluded:  true,
	}

	store.db.Create(&session1)
	store.db.Create(&session2)

	store.db.Create(&model.ErrorObject{
		ErrorGroupID: errorGroup.ID,
		SessionID:    &session1.ID,
	})

	store.db.Create(&model.ErrorObject{
		ErrorGroupID: errorGroup.ID,
		SessionID:    &session2.ID,
	})

	connection, err := store.ListErrorObjects(errorGroup, ListErrorObjectsParams{
		Query: "has_session:false email:",
	})
	assert.NoError(t, err)
	assert.Len(t, connection.Edges, 2)

	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{
		Query: "has_session:true email:",
	})
	assert.NoError(t, err)
	assert.Len(t, connection.Edges, 1)

	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{
		Query: "email:foo has_session:false",
	})
	assert.NoError(t, err)
	assert.Len(t, connection.Edges, 1)

	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{
		Query: "email:foo has_session:true",
	})
	assert.NoError(t, err)
	assert.Len(t, connection.Edges, 1)

	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{
		Query: "email:bar has_session:false",
	})
	assert.NoError(t, err)
	assert.Len(t, connection.Edges, 0)

	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{
		Query: "email:bar has_session:true",
	})
	assert.NoError(t, err)
	assert.Len(t, connection.Edges, 0)
}

func TestListErrorObjectsTraversing(t *testing.T) {
	defer teardown(t)

	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
	}
	store.db.Create(&errorGroup)

	// Create three pages
	// The first page has 10 items (hasPreviousPage = false, hasNextPage = true)
	// The second page has 10 items (hasPreviousPage = true, hasNextPage = true)
	// The last page has 1 item (hasPreviousPage = true, hasNextPage = false)
	for i := 1; i <= 21; i++ {
		store.db.Create(&model.ErrorObject{
			ErrorGroupID: errorGroup.ID,
			ID:           i,
		})
	}

	// Get first page
	connection, err := store.ListErrorObjects(errorGroup, ListErrorObjectsParams{})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 10)
	cursors := lo.Map(connection.Edges, func(edge *privateModel.ErrorObjectEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{"21", "20", "19", "18", "17", "16", "15", "14", "13", "12"}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     true,
		HasPreviousPage: false,
		StartCursor:     "21",
		EndCursor:       "12",
	}, connection.PageInfo)

	// Get second page using `After` cursor
	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{After: ptr.String("12")})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 10)
	cursors = lo.Map(connection.Edges, func(edge *privateModel.ErrorObjectEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{"11", "10", "9", "8", "7", "6", "5", "4", "3", "2"}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     true,
		HasPreviousPage: true,
		StartCursor:     "11",
		EndCursor:       "2",
	}, connection.PageInfo)

	// Get last page using `After` cursor
	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{After: ptr.String("2")})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 1)
	cursors = lo.Map(connection.Edges, func(edge *privateModel.ErrorObjectEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{"1"}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     false,
		HasPreviousPage: true,
		StartCursor:     "1",
		EndCursor:       "1",
	}, connection.PageInfo)

	// Go back to second page using `Before` cursor
	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{Before: ptr.String("1")})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 10)
	cursors = lo.Map(connection.Edges, func(edge *privateModel.ErrorObjectEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{"11", "10", "9", "8", "7", "6", "5", "4", "3", "2"}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     true,
		HasPreviousPage: true,
		StartCursor:     "11",
		EndCursor:       "2",
	}, connection.PageInfo)

	// Go back to first page using `Before` cursor
	connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{Before: ptr.String("11")})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 10)
	cursors = lo.Map(connection.Edges, func(edge *privateModel.ErrorObjectEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{"21", "20", "19", "18", "17", "16", "15", "14", "13", "12"}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     true,
		HasPreviousPage: false,
		StartCursor:     "21",
		EndCursor:       "12",
	}, connection.PageInfo)
}

func TestUpdateErrorGroupStateByAdmin(t *testing.T) {
	defer teardown(t)

	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
	}

	admin := model.Admin{}
	store.db.Create(&admin)

	now := time.Now()
	params := UpdateErrorGroupParams{
		ID:           -1,
		State:        privateModel.ErrorStateIgnored,
		SnoozedUntil: &now,
	}

	unchangedErrorGroup, err := store.UpdateErrorGroupStateByAdmin(context.TODO(), admin, params)
	assert.EqualError(t, err, "record not found")
	assert.Nil(t, unchangedErrorGroup)

	store.db.Create(&errorGroup)

	params.ID = errorGroup.ID

	updatedErrorGroup, err := store.UpdateErrorGroupStateByAdmin(context.TODO(), admin, params)
	assert.NoError(t, err)

	assert.Equal(t, params.State, updatedErrorGroup.State)
	assert.Equal(t, params.SnoozedUntil.Format(time.RFC3339), updatedErrorGroup.SnoozedUntil.Format(time.RFC3339))

	activityLogs, err := store.GetErrorGroupActivityLogs(errorGroup.ID)
	assert.NoError(t, err)

	assert.Len(t, activityLogs, 1)
	assert.Equal(t, admin.ID, activityLogs[0].AdminID)
	assert.Equal(t, errorGroup.ID, activityLogs[0].ErrorGroupID)
	assert.Equal(t, model.ErrorGroupIgnoredEvent, activityLogs[0].EventType)
	assert.NotNil(t, activityLogs[0].EventData)
}

func TestUpdateErrorGroupStateBySystem(t *testing.T) {
	defer teardown(t)
	errorGroup := model.ErrorGroup{
		State: privateModel.ErrorStateOpen,
	}

	now := time.Now()
	params := UpdateErrorGroupParams{
		ID:           -1,
		State:        privateModel.ErrorStateIgnored,
		SnoozedUntil: &now,
	}

	err := store.UpdateErrorGroupStateBySystem(context.TODO(), params)
	assert.EqualError(t, err, "record not found")

	store.db.Create(&errorGroup)

	params.ID = errorGroup.ID

	err = store.UpdateErrorGroupStateBySystem(context.TODO(), params)
	assert.NoError(t, err)

	var updatedErrorGroup *model.ErrorGroup
	store.db.Model(model.ErrorGroup{}).Where("id = ?", params.ID).First(&updatedErrorGroup)

	assert.Equal(t, params.State, updatedErrorGroup.State)
	assert.Equal(t, params.SnoozedUntil.Format(time.RFC3339), updatedErrorGroup.SnoozedUntil.Format(time.RFC3339))

	activityLogs, err := store.GetErrorGroupActivityLogs(errorGroup.ID)
	assert.NoError(t, err)

	assert.Len(t, activityLogs, 1)
	assert.Equal(t, 0, activityLogs[0].AdminID) // 0 means the system generated this
	assert.Equal(t, errorGroup.ID, activityLogs[0].ErrorGroupID)
	assert.Equal(t, model.ErrorGroupIgnoredEvent, activityLogs[0].EventType)
	assert.NotNil(t, activityLogs[0].EventData)
}
