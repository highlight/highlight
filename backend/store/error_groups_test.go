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

func TestListErrorObjects(t *testing.T) {
	util.RunTestWithDBWipe(t, "TestListErrorObjects", store.db, func(t *testing.T) {
		errorGroup := model.ErrorGroup{
			State: privateModel.ErrorStateOpen,
			Event: "something broke!",
		}
		store.db.Create(&errorGroup)

		// No error objects
		connection, err := store.ListErrorObjects(errorGroup, ListErrorObjectsParams{})
		assert.NoError(t, err)

		assert.Equal(t, privateModel.ErrorObjectConnection{}, connection)

		// One error object
		userProperties := map[string]string{
			"email": "chilly@mcwilly.com",
		}
		session := model.Session{
			AppVersion: ptr.String("123"),
		}
		err = session.SetUserProperties(userProperties)
		assert.NoError(t, err)

		store.db.Create(&session)

		errorObject := model.ErrorObject{
			ErrorGroupID: errorGroup.ID,
			SessionID:    &session.ID,
		}
		store.db.Create(&errorObject)
		connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 1)

		edge := connection.Edges[0]

		assert.Equal(t, strconv.Itoa(errorObject.ID), edge.Cursor)
		assert.Equal(t, errorObject.ID, edge.Node.ID)
		assert.WithinDuration(t, errorObject.CreatedAt, edge.Node.CreatedAt, 10*time.Second)
		assert.Equal(t, errorObject.Event, edge.Node.Event)
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

	})
}

func TestListErrorObjectsTraversing(t *testing.T) {
	util.RunTestWithDBWipe(t, "TestListErrorObjectsTraversing", store.db, func(t *testing.T) {
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
		assert.Equal(t, cursors, []string{"1", "2", "3", "4", "5", "6", "7", "8", "9", "10"})
		assert.Equal(t, &privateModel.PageInfo{
			HasNextPage:     true,
			HasPreviousPage: false,
			StartCursor:     "1",
			EndCursor:       "10",
		}, connection.PageInfo)

		// Get second page using `After` cursor
		connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{After: ptr.String("10")})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 10)
		cursors = lo.Map(connection.Edges, func(edge *privateModel.ErrorObjectEdge, index int) string {
			return edge.Cursor
		})
		assert.Equal(t, cursors, []string{"11", "12", "13", "14", "15", "16", "17", "18", "19", "20"})
		assert.Equal(t, &privateModel.PageInfo{
			HasNextPage:     true,
			HasPreviousPage: true,
			StartCursor:     "11",
			EndCursor:       "20",
		}, connection.PageInfo)

		// Get last page using `After` cursor
		connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{After: ptr.String("20")})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 1)
		cursors = lo.Map(connection.Edges, func(edge *privateModel.ErrorObjectEdge, index int) string {
			return edge.Cursor
		})
		assert.Equal(t, cursors, []string{"21"})
		assert.Equal(t, &privateModel.PageInfo{
			HasNextPage:     false,
			HasPreviousPage: true,
			StartCursor:     "21",
			EndCursor:       "21",
		}, connection.PageInfo)

		// Go back to second page using `Before` cursor
		connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{Before: ptr.String("21")})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 10)
		cursors = lo.Map(connection.Edges, func(edge *privateModel.ErrorObjectEdge, index int) string {
			return edge.Cursor
		})
		assert.Equal(t, cursors, []string{"11", "12", "13", "14", "15", "16", "17", "18", "19", "20"})
		assert.Equal(t, &privateModel.PageInfo{
			HasNextPage:     true,
			HasPreviousPage: true,
			StartCursor:     "11",
			EndCursor:       "20",
		}, connection.PageInfo)

		// Go back to first page using `Before` cursor
		connection, err = store.ListErrorObjects(errorGroup, ListErrorObjectsParams{Before: ptr.String("11")})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 10)
		cursors = lo.Map(connection.Edges, func(edge *privateModel.ErrorObjectEdge, index int) string {
			return edge.Cursor
		})
		assert.Equal(t, cursors, []string{"1", "2", "3", "4", "5", "6", "7", "8", "9", "10"})
		assert.Equal(t, &privateModel.PageInfo{
			HasNextPage:     true,
			HasPreviousPage: false,
			StartCursor:     "1",
			EndCursor:       "10",
		}, connection.PageInfo)

	})
}

func TestUpdateErrorGroupStateByAdmin(t *testing.T) {
	util.RunTestWithDBWipe(t, "TestUpdateErrorGroupStateByAdmin", store.db, func(t *testing.T) {
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
	util.RunTestWithDBWipe(t, "UpdateErrorGroupStateBySystem", store.db, func(t *testing.T) {
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
