package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jay-khatri/fullstory/backend/database"
	"github.com/jay-khatri/fullstory/backend/graph/generated"
	"github.com/jay-khatri/fullstory/backend/graph/model"
)

func (r *queryResolver) Session(ctx context.Context, id string) (*model.Session, error) {
	eventObjs := []*database.EventsObject{}
	if res := database.DB.Order("created_at desc").Where(&database.EventsObject{VisitID: &id}).Find(&eventObjs); res.Error != nil {
		return nil, fmt.Errorf("error reading from events: %v", res.Error)
	}
	session := &model.Session{}
	for _, eventObj := range eventObjs {
		subSession := &model.Session{}
		if err := json.Unmarshal([]byte(*eventObj.Events), subSession); err != nil {
			return nil, fmt.Errorf("error decoding event data: %v", err)
		}
		session.VisitLocationDetails = subSession.VisitLocationDetails
		session.Events = append(subSession.Events, session.Events...)
	}
	return session, nil
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
