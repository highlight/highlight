package projectfilters

import "github.com/highlight-run/highlight/backend/model"

type ProjectFilterSettings struct {
	model.Model
	Project                            *model.Project
	ProjectID                          int
	FilterSessionsWithoutError         bool `gorm:"default:false"`
	AutoResolveStaleErrorsDaysInterval *int
}
