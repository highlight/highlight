package store

import (
	"context"
	"fmt"
	"strconv"
	"testing"

	"github.com/aws/smithy-go/ptr"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestUpsertService(t *testing.T) {
	defer teardown(t)
	ctx := context.Background()
	project := model.Project{}
	store.DB.Create(&project)

	service, err := store.UpsertService(ctx, project, "public-graph", map[string]string{})
	assert.NoError(t, err)

	assert.NotNil(t, service.ID)

	foundService, err := store.UpsertService(ctx, project, "public-graph", map[string]string{})
	assert.NoError(t, err)
	assert.Equal(t, service.ID, foundService.ID)
}

func TestUpsertServiceWithAttributes(t *testing.T) {
	ctx := context.Background()

	util.RunTestWithDBWipe(t, store.DB, func(t *testing.T) {
		serviceName := "public-graph"
		project := model.Project{}
		store.DB.Create(&project)

		cacheKey := fmt.Sprintf("service-public-graph-%d", project.ID)
		err := store.Redis.Del(context.TODO(), cacheKey)
		assert.NoError(t, err)

		createdService, err := store.UpsertService(ctx, project, serviceName, map[string]string{
			"process.runtime.name":        "go",
			"process.runtime.version":     "go1.20.5",
			"process.runtime.description": "go version go1.20.5 darwin/arm64",
		})
		assert.NoError(t, err)
		assert.NotNil(t, createdService.ID)
		assert.Equal(t, "go", *createdService.ProcessName)
		assert.Equal(t, "go1.20.5", *createdService.ProcessVersion)
		assert.Equal(t, "go version go1.20.5 darwin/arm64", *createdService.ProcessDescription)
		assert.Nil(t, createdService.GithubRepoPath)

		err = store.Redis.Del(context.TODO(), cacheKey)
		assert.NoError(t, err)

		err = store.DB.Model(&createdService).Update("GithubRepoPath", "highlight/highlight").Error
		assert.NoError(t, err)

		updatedService, err := store.UpsertService(ctx, project, serviceName, map[string]string{
			"process.runtime.name":        "ruby",
			"process.runtime.version":     "2.6.10",
			"process.runtime.description": "ruby 2.6.10p210 (2022-04-12 revision 67958) [x86_64-linux]",
		})

		assert.NoError(t, err)
		assert.Equal(t, createdService.ID, updatedService.ID)
		assert.Equal(t, "ruby", *updatedService.ProcessName)
		assert.Equal(t, "2.6.10", *updatedService.ProcessVersion)
		assert.Equal(t, "ruby 2.6.10p210 (2022-04-12 revision 67958) [x86_64-linux]", *updatedService.ProcessDescription)
		assert.Equal(t, "highlight/highlight", *updatedService.GithubRepoPath)

		// hits cache
		cachedService, err := store.UpsertService(ctx, project, serviceName, map[string]string{
			"process.runtime.name":        *createdService.ProcessName,
			"process.runtime.version":     *createdService.ProcessVersion,
			"process.runtime.description": *createdService.ProcessDescription,
		})

		assert.NoError(t, err)
		assert.Equal(t, createdService.ID, cachedService.ID)
		assert.Equal(t, *updatedService.ProcessName, *cachedService.ProcessName)
		assert.Equal(t, *updatedService.ProcessVersion, *cachedService.ProcessVersion)
		assert.Equal(t, *updatedService.ProcessDescription, *cachedService.ProcessDescription)
		assert.Equal(t, *updatedService.GithubRepoPath, *cachedService.GithubRepoPath)
	})
}

func TestListServicesTraversing(t *testing.T) {
	ctx := context.TODO()

	defer teardown(t)
	project := model.Project{}
	store.DB.Create(&project)

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
		store.DB.Create(&newService)
		servicesIds = append(servicesIds, strconv.Itoa(newService.ID))
	}

	// Get first page
	connection, err := store.ListServices(ctx, project, ListServicesParams{})
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
	connection, err = store.ListServices(ctx, project, ListServicesParams{After: ptr.String(servicesIds[11])})
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
	connection, err = store.ListServices(ctx, project, ListServicesParams{After: ptr.String(servicesIds[1])})
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
	connection, err = store.ListServices(ctx, project, ListServicesParams{Before: ptr.String(servicesIds[0])})
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
	connection, err = store.ListServices(ctx, project, ListServicesParams{Before: ptr.String(servicesIds[10])})
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
