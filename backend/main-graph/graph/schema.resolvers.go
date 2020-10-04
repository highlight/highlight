package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jay-khatri/fullstory/backend/main-graph/graph/generated"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/slack-go/slack"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func (r *mutationResolver) CreateOrganization(ctx context.Context, name string) (*model.Organization, error) {
	org := &model.Organization{
		Name: &name,
	}
	if err := r.DB.Create(org).Error; err != nil {
		return nil, e.Wrap(err, "error creating org")
	}
	return org, nil
}

func (r *queryResolver) Session(ctx context.Context, id int) (*model.Session, error) {
	session, err := r.isAdminSessionOwner(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	return session, nil
}

func (r *queryResolver) Events(ctx context.Context, sessionID int) ([]interface{}, error) {
	if _, err := r.isAdminSessionOwner(ctx, sessionID); err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	eventObjs := []*model.EventsObject{}
	if res := r.DB.Order("created_at desc").Where(&model.EventsObject{SessionID: sessionID}).Find(&eventObjs); res.Error != nil {
		return nil, fmt.Errorf("error reading from events: %v", res.Error)
	}
	allEvents := make(map[string][]interface{})
	for _, eventObj := range eventObjs {
		subEvents := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(eventObj.Events), &subEvents); err != nil {
			return nil, fmt.Errorf("error decoding event data: %v", err)
		}
		allEvents["events"] = append(subEvents["events"], allEvents["events"]...)
	}
	return allEvents["events"], nil
}

func (r *queryResolver) Sessions(ctx context.Context, organizationID int, count int, params []interface{}) ([]*model.Session, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin not found in org")
	}
	// list of maps, where each map represents a field query.
	sessionIDsToJoin := []map[int]bool{}
	sessions := []*model.Session{}
	query := r.DB.Where(&model.Session{OrganizationID: organizationID, Processed: true}).Where("length > ?", 1000).Order("created_at desc")
	ps, err := model.DecodeAndValidateParams(params)
	if err != nil {
		return nil, e.Wrap(err, "error decoding params")
	}
	for _, p := range ps {
		switch key := p.Action; key {
		case "more than":
			d, err := toDuration(p.Value.Value)
			if err != nil {
				return nil, e.Wrap(err, "error convering duration to int")
			}
			query = query.Where("length > ?", d.Milliseconds())
		case "less than":
			d, err := toDuration(p.Value.Value)
			if err != nil {
				return nil, e.Wrap(err, "error convering duration to int")
			}
			query = query.Where("length < ?", d.Milliseconds())
		case "last":
			d, err := toDuration(p.Value.Value)
			if err != nil {
				return nil, e.Wrap(err, "error convering duration to int")
			}
			query = query.Where("created_at > ?", time.Now().Add(-d))
		default:
			// TODO: this is a hacky solution because I don't know SQL well.
			// For every text filter, we create a new list of sessions, and they
			if p.Type != "text" {
				continue
			}
			sessionIdMap := make(map[int]bool)
			field := &model.Field{}
			res := r.DB.Where(&model.Field{OrganizationID: organizationID, Value: p.Value.Value, Name: p.Action}).First(field)
			if err := res.Error; err != nil || res.RecordNotFound() {
				return nil, e.Wrap(err, "error querying field")
			}
			rows, err := r.DB.Table("session_fields").Where("field_id = ?", field.ID).Rows()
			if err != nil {
				return nil, fmt.Errorf("error querying field_id on session_fields")
			}
			for rows.Next() {
				var sessionID int
				var fieldID int
				rows.Scan(&sessionID, &fieldID)
				sessionIdMap[sessionID] = true
			}
			rows.Close()
			sessionIDsToJoin = append(sessionIDsToJoin, sessionIdMap)
		}
	}
	res := query.Limit(count).Find(&sessions)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "no sessions found")
	}
	// If we have queries to parse with fields, we do an intersection of all the fields
	// and then a join with the results from the queries.
	if numFilters := len(sessionIDsToJoin); numFilters > 0 {
		countMap := make(map[int]int)
		wantedSessionIds := make(map[int]bool)
		for i := range sessionIDsToJoin {
			resultMap := sessionIDsToJoin[i]
			for k := range resultMap {
				countMap[k] += 1
			}
		}
		for k, v := range countMap {
			if v == numFilters {
				wantedSessionIds[k] = true
			}
		}
		filteredSessions := []*model.Session{}
		for i := range sessions {
			if val, _ := wantedSessionIds[sessions[i].ID]; val {
				filteredSessions = append(filteredSessions, sessions[i])
			}
		}
		fmt.Println(len(filteredSessions))
		return filteredSessions, nil
	}
	return sessions, nil
}

func (r *queryResolver) Fields(ctx context.Context, organizationID int) ([]*string, error) {
	rows, err := r.DB.Model(&model.Field{}).
		Where(&model.Field{OrganizationID: organizationID}).
		Select("distinct(name)").Rows()
	if err != nil {
		return nil, e.Wrap(err, "error querying field suggestion")
	}
	defer rows.Close()
	fields := []*string{}
	for rows.Next() {
		var field string
		rows.Scan(&field)
		fields = append(fields, &field)
	}
	return fields, nil
}

func (r *queryResolver) FieldSuggestion(ctx context.Context, organizationID int, field string, query string) ([]*string, error) {
	fields := []model.Field{}
	res := r.DB.Where(&model.Field{OrganizationID: organizationID, Name: field}).
		Order(fmt.Sprintf(`levenshtein(value, '%v')`, query)).
		Limit(5).
		Find(&fields)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error querying field suggestion")
	}
	fieldStrings := []*string{}
	for i := range fields {
		fieldStrings = append(fieldStrings, &fields[i].Value)
	}
	return fieldStrings, nil
}

func (r *queryResolver) Organizations(ctx context.Context) ([]*model.Organization, error) {
	admin, err := r.Query().Admin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieiving user")
	}
	orgs := []*model.Organization{}
	if err := r.DB.Model(&admin).Association("Organizations").Find(&orgs).Error; err != nil {
		return nil, e.Wrap(err, "error getting associated organizations")
	}
	return orgs, nil
}

func (r *queryResolver) Admin(ctx context.Context) (*model.Admin, error) {
	uid := fmt.Sprintf("%v", ctx.Value("uid"))
	admin := &model.Admin{UID: &uid}
	res := r.DB.Where(&model.Admin{UID: &uid}).First(&admin)
	if err := res.Error; err != nil || res.RecordNotFound() {
		// If the user doesn't exist yet, we create
		// one along with their own org.
		fbuser, err := AuthClient.GetUser(context.Background(), uid)
		if err != nil {
			return nil, e.Wrap(err, "error retrieiving user from firebase api")
		}
		newOrg, err := r.Mutation().CreateOrganization(ctx, fbuser.DisplayName)
		if err != nil {
			return nil, e.Wrap(err, "error creating new organization")
		}
		newAdmin := &model.Admin{
			UID:           &uid,
			Name:          &fbuser.DisplayName,
			Email:         &fbuser.Email,
			Organizations: []model.Organization{*newOrg},
		}
		if err := r.DB.Create(newAdmin).Error; err != nil {
			return nil, e.Wrap(err, "error creating new admin")
		}
		admin = newAdmin

		msg := slack.WebhookMessage{Text: fmt.Sprintf("```NEW USER \nid: %v\nname: %v\nemail: %v```", newAdmin.ID, *newAdmin.Name, *newAdmin.Email)}
		err = slack.PostWebhook("https://hooks.slack.com/services/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", &msg)
		if err != nil {
			log.Errorf("error sending slack hook: %v", err)
		}
	}
	return admin, nil
}

func (r *sessionResolver) UserObject(ctx context.Context, obj *model.Session) (interface{}, error) {
	return obj.UserObject, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Session returns generated.SessionResolver implementation.
func (r *Resolver) Session() generated.SessionResolver { return &sessionResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type sessionResolver struct{ *Resolver }
