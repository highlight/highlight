package filtering

import (
	"context"

	"github.com/highlight-run/highlight/backend/errorgroups"
	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type AutoResolverService struct {
	*FilteringRepository
	*errorgroups.ErrorGroupsRepository
}

func (service *AutoResolverService) AutoResolveStaleErrors(ctx context.Context) {
	staleErrorGroups := []model.ErrorGroup{}

	for _, errorGroup := range staleErrorGroups {
		service.UpdateErrorGroupState(ctx, &errorGroup, privateModel.ErrorStateResolved, nil)
	}
}
