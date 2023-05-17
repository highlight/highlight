package filtering

import (
	"context"
	"testing"
)

func TestAutoResolveStaleErrors(t *testing.T) {
	service := AutoResolverService{setupRepository()}

	service.AutoResolveStaleErrors(context.TODO())

}
