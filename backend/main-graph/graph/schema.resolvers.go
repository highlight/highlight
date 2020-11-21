package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/jay-khatri/fullstory/backend/main-graph/graph/generated"
	"github.com/jay-khatri/fullstory/backend/model"

	e "github.com/pkg/errors"
	"github.com/rs/xid"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
)

func (r *mutationResolver) CreateOrganization(ctx context.Context, name string) (*model.Organization, error) {
	admin, err := r.Query().Admin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error getting admin")
	}
	org := &model.Organization{
		Name:   &name,
		Admins: []model.Admin{*admin},
	}
	if err := r.DB.Create(org).Error; err != nil {
		return nil, e.Wrap(err, "error creating org")
	}
	msg := slack.WebhookMessage{Text: fmt.
		Sprintf("```NEW WORKSPACE \nid: %v\nname: %v\nadmin_email: %v```", org.ID, *org.Name, *admin.Email)}
	if err := slack.PostWebhook("https://hooks.slack.com/services/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", &msg); err != nil {
		log.Errorf("error sending slack hook: %v", err)
	}
	return org, nil
}

func (r *mutationResolver) SendAdminInvite(ctx context.Context, organizationID int, email string) (*string, error) {
	org, err := r.isAdminInOrganization(ctx, organizationID)
	if err != nil {
		return nil, e.Wrap(err, "error querying org")
	}
	var secret string
	if org.Secret == nil {
		uid := xid.New().String()
		if err := r.DB.Model(org).Updates(&model.Organization{Secret: &uid}).Error; err != nil {
			return nil, e.Wrap(err, "error updating uid in org secret")
		}
		secret = uid
	} else {
		secret = *org.Secret
	}
	inviteLink := os.Getenv("FRONTEND_URI") + "/" + strconv.Itoa(organizationID) + "/invite/" + secret
	to := &mail.Email{Address: email}
	subject := "Highlight Invite Link!"
	content := fmt.Sprintf(`
	Hi there, <br><br>

	You've just been invited to the '%v' Highlight workspace! <br><br>

	Click <a href="%v">this</a> link, login, and you should be good to go!<br><br>

	Cheers, <br>
	The Highlight Team <br>
	`, *org.Name, inviteLink)

	from := mail.NewEmail("Highlight", "notifications@highlight.run")
	message := mail.NewSingleEmail(from, subject, to, content, fmt.Sprintf("<p>%v</p>", content))
	_, err = r.MailClient.Send(message)
	if err != nil {
		return nil, fmt.Errorf("error sending sendgrid email: %v", err)
	}
	return &email, nil
}

func (r *mutationResolver) AddAdminToOrganization(ctx context.Context, organizationID int, inviteID string) (*int, error) {
	org := &model.Organization{}
	res := r.DB.Where(&model.Organization{Model: model.Model{ID: organizationID}}).First(&org)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error querying org")
	}
	if org.Secret == nil || (org.Secret != nil && *org.Secret != inviteID) {
		return nil, e.New("invalid invite id")
	}
	admin, err := r.Query().Admin(ctx)
	if err != nil {
		return nil, e.New("error querying admin")
	}
	if err := r.DB.Model(org).Association("Admins").Append(admin).Error; err != nil {
		return nil, e.Wrap(err, "error adding admin to association")
	}
	return &org.ID, nil
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

func (r *queryResolver) Messages(ctx context.Context, sessionID int) ([]interface{}, error) {

	if _, err := r.isAdminSessionOwner(ctx, sessionID); err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	messagesObj := []*model.MessagesObject{}
	if res := r.DB.Order("created_at desc").Where(&model.MessagesObject{SessionID: sessionID}).Find(&messagesObj); res.Error != nil {
		return nil, fmt.Errorf("error reading from messages: %v", res.Error)
	}
	allEvents := make(map[string][]interface{})
	for _, messageObj := range messagesObj {
		subMessage := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(messageObj.Messages), &subMessage); err != nil {
			return nil, fmt.Errorf("error decoding message data: %v", err)
		}
		allEvents["messages"] = append(subMessage["messages"], allEvents["messages"]...)
	}
	return allEvents["messages"], nil
}

func (r *queryResolver) Resources(ctx context.Context, sessionID int) ([]interface{}, error) {
	if _, err := r.isAdminSessionOwner(ctx, sessionID); err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	resourcesObject := []*model.ResourcesObject{}
	if res := r.DB.Order("created_at desc").Where(&model.ResourcesObject{SessionID: sessionID}).Find(&resourcesObject); res.Error != nil {
		return nil, fmt.Errorf("error reading from resources: %v", res.Error)
	}
	allResources := make(map[string][]interface{})
	for _, resourceObj := range resourcesObject {
		subResources := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(resourceObj.Resources), &subResources); err != nil {
			return nil, fmt.Errorf("error decoding resource data: %v", err)
		}
		allResources["resources"] = append(subResources["resources"], allResources["resources"]...)
	}
	return allResources["resources"], nil
}

func (r *queryResolver) Admins(ctx context.Context, organizationID int) ([]*model.Admin, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin not found in org")
	}
	admins := []*model.Admin{}
	err := r.DB.Model(
		&model.Organization{Model: model.Model{ID: organizationID}}).Association("Admins").Find(&admins).Error
	if err != nil {
		return nil, e.Wrap(err, "error getting associated admins")
	}
	return admins, nil
}

func (r *queryResolver) IsIntegrated(ctx context.Context, organizationID int) (*bool, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin not found in org")
	}
	sessions := []*model.Session{}
	err := r.DB.Where(
		&model.Session{OrganizationID: organizationID}).Find(&sessions).Error
	if err != nil {
		return nil, e.Wrap(err, "error getting associated admins")
	}
	f, t := false, true
	if len(sessions) > 0 {
		return &t, nil
	}
	return &f, nil
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
			// For every text filter, we create a new list of sessions, and then do a join.
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
	res := query.Find(&sessions)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "no sessions found")
	}
	// If we have queries to parse with fields, we do an intersection of all the fields
	// and then a join with the results from the queries.
	if numFilters := len(sessionIDsToJoin); numFilters > 0 {
		countMap := make(map[int]int)
		for i := range sessionIDsToJoin {
			resultMap := sessionIDsToJoin[i]
			for k := range resultMap {
				countMap[k] += 1
			}
		}
		wantedSessionIds := make(map[int]bool)
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
		if len(filteredSessions) < count {
			count = len(filteredSessions)
		}
		return filteredSessions[:count], nil
	}
	if len(sessions) < count {
		count = len(sessions)
	}
	return sessions[:count], nil
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
		Limit(15).
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

func (r *queryResolver) Organization(ctx context.Context, id int) (*model.Organization, error) {
	org, err := r.isAdminInOrganization(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "error querying organization")
	}
	return org, nil
}

func (r *queryResolver) Admin(ctx context.Context) (*model.Admin, error) {
	uid := fmt.Sprintf("%v", ctx.Value("uid"))
	admin := &model.Admin{UID: &uid}
	res := r.DB.Where(&model.Admin{UID: &uid}).First(&admin)
	if err := res.Error; err != nil || res.RecordNotFound() {
		fbuser, err := AuthClient.GetUser(context.Background(), uid)
		if err != nil {
			return nil, e.Wrap(err, "error retrieiving user from firebase api")
		}
		newAdmin := &model.Admin{
			UID:   &uid,
			Name:  &fbuser.DisplayName,
			Email: &fbuser.Email,
		}
		if err := r.DB.Create(newAdmin).Error; err != nil {
			return nil, e.Wrap(err, "error creating new admin")
		}
		admin = newAdmin
		msg := slack.WebhookMessage{Text: fmt.
			Sprintf("```NEW USER \nid: %v\nname: %v\nemail: %v```", newAdmin.ID, *newAdmin.Name, *newAdmin.Email)}
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
