package store

import (
	"context"
	"fmt"
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestGetSession(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		_, err := store.GetSession(context.Background(), 1)
		assert.Error(t, err)

		session := model.Session{}
		store.db.Create(&session)

		foundSession, err := store.GetSession(context.Background(), session.ID)
		assert.NoError(t, err)
		assert.Equal(t, session.ID, foundSession.ID)
	})
}

func TestListServicesTraversing(t *testing.T) {
	util.RunTestWithDBWipe(t, store.db, func(t *testing.T) {
		project := model.Project{}
		store.db.Create(&project)

		// Create three pages
		// The first page has 10 items (hasPreviousPage = false, hasNextPage = true)
		// The second page has 10 items (hasPreviousPage = true, hasNextPage = true)
		// The last page has 1 item (hasPreviousPage = true, hasNextPage = false)
		for i := 1; i <= 21; i++ {
			store.db.Create(&model.Service{
				Name:      fmt.Sprintf("Service-%d", i),
				ProjectID: project.ID,
			})
		}

		// Get first page
		connection, err := store.ListServices(project, ListServicesParams{})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 10)
		cursors := lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
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
		connection, err = store.ListServices(project, ListServicesParams{After: ptr.String("12")})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 10)
		cursors = lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
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
		connection, err = store.ListServices(project, ListServicesParams{After: ptr.String("2")})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 1)
		cursors = lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
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
		connection, err = store.ListServices(project, ListServicesParams{Before: ptr.String("1")})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 10)
		cursors = lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
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
		connection, err = store.ListServices(project, ListServicesParams{Before: ptr.String("11")})
		assert.NoError(t, err)

		assert.Len(t, connection.Edges, 10)
		cursors = lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
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
