package store

import (
	"fmt"
	"strconv"
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFindOrCreateService(t *testing.T) {
	defer teardown(t)
	project := model.Project{}
	store.db.Create(&project)

	service, err := store.FindOrCreateService(project, "public-graph")
	assert.NoError(t, err)

	assert.NotNil(t, service.ID)

	foundService, err := store.FindOrCreateService(project, "public-graph")
	assert.NoError(t, err)
	assert.Equal(t, service.ID, foundService.ID)
}

func TestListServicesTraversing(t *testing.T) {
	defer teardown(t)
	project := model.Project{}
	store.db.Create(&project)

	// Create three pages
	// The first page has 10 items (hasPreviousPage = false, hasNextPage = true)
	// The second page has 10 items (hasPreviousPage = true, hasNextPage = true)
	// The last page has 1 item (hasPreviousPage = true, hasNextPage = false)
	var servicesIds []string
	for i := 0; i <= 20; i++ {
		newService := model.Service{
			Name:      fmt.Sprintf("Service-%d", i),
			ProjectID: project.ID,
			Status:    "healthy",
		}
		store.db.Create(&newService)
		servicesIds = append(servicesIds, strconv.Itoa(newService.ID))
	}

	// Get first page
	connection, err := store.ListServices(project, ListServicesParams{})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 10)
	cursors := lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{servicesIds[20], servicesIds[19], servicesIds[18], servicesIds[17], servicesIds[16], servicesIds[15], servicesIds[14], servicesIds[13], servicesIds[12], servicesIds[11]}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     true,
		HasPreviousPage: false,
		StartCursor:     servicesIds[20],
		EndCursor:       servicesIds[11],
	}, connection.PageInfo)

	// Get second page using `After` cursor
	connection, err = store.ListServices(project, ListServicesParams{After: ptr.String(servicesIds[11])})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 10)
	cursors = lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{servicesIds[10], servicesIds[9], servicesIds[8], servicesIds[7], servicesIds[6], servicesIds[5], servicesIds[4], servicesIds[3], servicesIds[2], servicesIds[1]}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     true,
		HasPreviousPage: true,
		StartCursor:     servicesIds[10],
		EndCursor:       servicesIds[1],
	}, connection.PageInfo)

	// Get last page using `After` cursor
	connection, err = store.ListServices(project, ListServicesParams{After: ptr.String(servicesIds[1])})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 1)
	cursors = lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{servicesIds[0]}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     false,
		HasPreviousPage: true,
		StartCursor:     servicesIds[0],
		EndCursor:       servicesIds[0],
	}, connection.PageInfo)

	// Go back to second page using `Before` cursor
	connection, err = store.ListServices(project, ListServicesParams{Before: ptr.String(servicesIds[0])})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 10)
	cursors = lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{servicesIds[10], servicesIds[9], servicesIds[8], servicesIds[7], servicesIds[6], servicesIds[5], servicesIds[4], servicesIds[3], servicesIds[2], servicesIds[1]}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     true,
		HasPreviousPage: true,
		StartCursor:     servicesIds[10],
		EndCursor:       servicesIds[1],
	}, connection.PageInfo)

	// Go back to first page using `Before` cursor
	connection, err = store.ListServices(project, ListServicesParams{Before: ptr.String(servicesIds[10])})
	assert.NoError(t, err)

	assert.Len(t, connection.Edges, 10)
	cursors = lo.Map(connection.Edges, func(edge *privateModel.ServiceEdge, index int) string {
		return edge.Cursor
	})
	assert.Equal(t, []string{servicesIds[20], servicesIds[19], servicesIds[18], servicesIds[17], servicesIds[16], servicesIds[15], servicesIds[14], servicesIds[13], servicesIds[12], servicesIds[11]}, cursors)
	assert.Equal(t, &privateModel.PageInfo{
		HasNextPage:     true,
		HasPreviousPage: false,
		StartCursor:     servicesIds[20],
		EndCursor:       servicesIds[11],
	}, connection.PageInfo)
}
