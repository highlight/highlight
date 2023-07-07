package store

import (
	"context"
	"strconv"
	"testing"
	"time"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestListErrorObjectsNoData(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		errorGroup := model.ErrorGroup{
			State: privateModel.ErrorStateOpen,
			Event: "something broke!",
		}
		store.db.Create(&errorGroup)

		// No error objects
		connection, err := store.ListErrorObjects(errorGroup, ListErrorObjectsParams{})
		assert.NoError(t, err)

		assert.Equal(t, privateModel.ErrorObjectConnection{}, connection)
	})
}

func TestListErrorObjectsOneObjectNoSession(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
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
		assert.Equal(t, errorGroup.SecureID, edge.Node.ErrorGroupSecureID)
		assert.Nil(t, edge.Node.Session)

		assert.Equal(t, &privateModel.PageInfo{
			HasNextPage:     false,
			HasPreviousPage: false,
			StartCursor:     strconv.Itoa(errorObject.ID),
			EndCursor:       strconv.Itoa(errorObject.ID),
		}, connection.PageInfo)

	})
}

func TestListErrorObjectsOneObjectWithSession(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		errorGroup := model.ErrorGroup{
			State: privateModel.ErrorStateOpen,
			Event: "something broke!",
		}
		store.db.Create(&errorGroup)

		session := model.Session{
			AppVersion: ptr.String("123"),
			Email:      "chilly@mcwilly.com",
		}

		store.db.Create(&session)

		errorObject := model.ErrorObject{
			ErrorGroupID: errorGroup.ID,
			SessionID:    &session.ID,
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
		assert.Equal(t, errorGroup.SecureID, edge.Node.ErrorGroupSecureID)
		assert.Equal(t, &privateModel.ErrorObjectNodeSession{
			SecureID:       session.SecureID,
			UserProperties: session.UserProperties,
			AppVersion:     session.AppVersion,
		}, edge.Node.Session)

		assert.Equal(t, &privateModel.PageInfo{
			HasNextPage:     false,
			HasPreviousPage: false,
			StartCursor:     strconv.Itoa(errorObject.ID),
			EndCursor:       strconv.Itoa(errorObject.ID),
		}, connection.PageInfo)

		session = model.Session{
			Email: "scoutie@mcscout.com",
		}

		store.db.Create(&session)

		errorObject = model.ErrorObject{
			ErrorGroupID: errorGroup.ID,
			SessionID:    &session.ID,
		}

		store.db.Create(&errorObject)

		connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{
			Query: "email:scoutie@mcscout.com",
		})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 1)

	})
}

func TestListErrorObjectsSearchByEmail(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		errorGroup := model.ErrorGroup{
			State: privateModel.ErrorStateOpen,
			Event: "something broke!",
		}
		store.db.Create(&errorGroup)

		session1 := model.Session{
			Email: "chilly@mcwilly.com",
		}

		session2 := model.Session{
			Email: "scoutie@mcwoutie.com",
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

	})
}

func TestListErrorObjectsTraversing(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
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

	})
}

func TestUpdateErrorGroupStateByAdmin(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {

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

		_, err := store.UpdateErrorGroupStateByAdmin(context.TODO(), admin, params)
		assert.EqualError(t, err, "record not found")

		store.db.Create(&errorGroup)

		params.ID = errorGroup.ID

		updatedErrorGroup, err := store.UpdateErrorGroupStateByAdmin(context.TODO(), admin, params)
		assert.NoError(t, err)

		assert.Equal(t, updatedErrorGroup.State, params.State)
		assert.Equal(t, updatedErrorGroup.SnoozedUntil, params.SnoozedUntil)

		activityLogs, err := store.GetErrorGroupActivityLogs(errorGroup.ID)
		assert.NoError(t, err)

		assert.Len(t, activityLogs, 1)
		assert.Equal(t, activityLogs[0].AdminID, admin.ID)
		assert.Equal(t, activityLogs[0].ErrorGroupID, errorGroup.ID)
		assert.Equal(t, activityLogs[0].EventType, model.ErrorGroupIgnoredEvent)
		assert.NotNil(t, activityLogs[0].EventData)
	})
}

func TestUpdateErrorGroupStateBySystem(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		errorGroup := model.ErrorGroup{
			State: privateModel.ErrorStateOpen,
		}

		now := time.Now()
		params := UpdateErrorGroupParams{
			ID:           -1,
			State:        privateModel.ErrorStateIgnored,
			SnoozedUntil: &now,
		}

		_, err := store.UpdateErrorGroupStateBySystem(context.TODO(), params)
		assert.EqualError(t, err, "record not found")

		store.db.Create(&errorGroup)

		params.ID = errorGroup.ID

		updatedErrorGroup, err := store.UpdateErrorGroupStateBySystem(context.TODO(), params)
		assert.NoError(t, err)

		assert.Equal(t, updatedErrorGroup.State, params.State)
		assert.Equal(t, updatedErrorGroup.SnoozedUntil, params.SnoozedUntil)

		activityLogs, err := store.GetErrorGroupActivityLogs(errorGroup.ID)
		assert.NoError(t, err)

		assert.Len(t, activityLogs, 1)
		assert.Equal(t, activityLogs[0].AdminID, 0) // 0 means the system generated this
		assert.Equal(t, activityLogs[0].ErrorGroupID, errorGroup.ID)
		assert.Equal(t, activityLogs[0].EventType, model.ErrorGroupIgnoredEvent)
		assert.NotNil(t, activityLogs[0].EventData)
	})
}
