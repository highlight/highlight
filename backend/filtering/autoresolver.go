package filtering

import (
	"context"
)

type AutoResolverService struct {
	FilteringRepository
}

func (service *AutoResolverService) AutoResolveStaleErrors(ctx context.Context) {

}
