package store

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/queryparser"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/samber/lo"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

func (store *Store) FindOrCreateService(ctx context.Context, project model.Project, name string, attributes map[string]string) (*model.Service, error) {
	return redis.CachedEval(ctx, store.redis, fmt.Sprintf("service-%s-%d", name, project.ID), 150*time.Millisecond, time.Minute, func() (*model.Service, error) {
		var service model.Service

		if val, ok := attributes[string(semconv.ProcessRuntimeNameKey)]; ok {
			service.ProcessName = &val
		}

		if val, ok := attributes[string(semconv.ProcessRuntimeVersionKey)]; ok {
			service.ProcessVersion = &val
		}

		if val, ok := attributes[string(semconv.ProcessRuntimeDescriptionKey)]; ok {
			service.ProcessDescription = &val
		}

		err := store.db.Where(&model.Service{
			ProjectID: project.ID,
			Name:      name,
		}).FirstOrCreate(&service).Error

		return &service, err
	})

}

// Number of results per page
const SERVICE_LIMIT = 10

type ListServicesParams struct {
	After  *string
	Before *string
	Query  *string
}

func (store *Store) ListServices(project model.Project, params ListServicesParams) (privateModel.ServiceConnection, error) {

	var services []model.Service

	query := store.db.Where(&model.Service{ProjectID: project.ID}).Limit(SERVICE_LIMIT + 1)

	if params.Query != nil {
		filters := queryparser.Parse(*params.Query)

		if len(filters.Body) > 0 && filters.Body[0] != "" {
			query.Where("services.name ILIKE ?", "%"+filters.Body[0]+"%")
		}
	}

	var (
		endCursor       string
		startCursor     string
		hasNextPage     bool
		hasPreviousPage bool
	)

	if params.After != nil {
		query = query.Order("services.id DESC").Where("services.id < ?", *params.After)
	} else if params.Before != nil {
		query = query.Order("services.id ASC").Where("services.id > ?", *params.Before)
	} else {
		query = query.Order("services.id DESC")
	}

	if err := query.Find(&services).Error; err != nil {
		return privateModel.ServiceConnection{
			Edges:    []*privateModel.ServiceEdge{},
			PageInfo: &privateModel.PageInfo{},
		}, err
	}

	if params.Before != nil {
		// Reverse the slice to maintain a descending order view
		sort.Slice(services, func(i, j int) bool {
			return services[i].ID < services[j].ID
		})
	}

	if len(services) == 0 {
		return privateModel.ServiceConnection{
			Edges:    []*privateModel.ServiceEdge{},
			PageInfo: &privateModel.PageInfo{},
		}, nil
	}

	edges := []*privateModel.ServiceEdge{}

	for _, service := range services {
		edge := &privateModel.ServiceEdge{
			Cursor: strconv.Itoa(service.ID),
			Node: &privateModel.ServiceNode{
				ID:              service.ID,
				ProjectID:       service.ProjectID,
				Name:            service.Name,
				Status:          service.Status,
				GithubRepoPath:  service.GithubRepoPath,
				BuildPrefix:     service.BuildPrefix,
				GithubPrefix:    service.GithubPrefix,
				LastSeenVersion: service.LastSeenVersion,
				ErrorDetails:    service.ErrorDetails,
			},
		}

		edges = append(edges, edge)
	}

	if params.After != nil {
		hasPreviousPage = true // Assume we have a previous page if `after` is provided

		if len(edges) == SERVICE_LIMIT+1 {
			edges = edges[:SERVICE_LIMIT]
			hasNextPage = true
		}
	} else if params.Before != nil {
		hasNextPage = true // Assume we have a next page if `before` is provided

		if len(edges) == SERVICE_LIMIT+1 {
			edges = edges[:SERVICE_LIMIT]
			hasPreviousPage = true
		}

		edges = lo.Reverse(edges)
	} else {
		if len(edges) > SERVICE_LIMIT {
			edges = edges[:SERVICE_LIMIT]
			hasNextPage = true
		}
	}

	startCursor = edges[0].Cursor
	endCursor = edges[len(edges)-1].Cursor

	return privateModel.ServiceConnection{
		Edges: edges,
		PageInfo: &privateModel.PageInfo{
			HasNextPage:     hasNextPage,
			HasPreviousPage: hasPreviousPage,
			StartCursor:     startCursor,
			EndCursor:       endCursor,
		},
	}, nil

}
