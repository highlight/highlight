package repositories

import (
	"github.com/highlight-run/highlight/backend/errorgroups"
	"github.com/highlight-run/highlight/backend/filtering"
)

type Repositories struct {
	Filtering   *filtering.FilteringRepository
	ErrorGroups *errorgroups.ErrorGroupsRepository
}
