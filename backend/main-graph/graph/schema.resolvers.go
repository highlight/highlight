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
	modelInputs "github.com/jay-khatri/fullstory/backend/main-graph/graph/model"
	"github.com/jay-khatri/fullstory/backend/model"
	e "github.com/pkg/errors"
	"github.com/rs/xid"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	stripe "github.com/stripe/stripe-go"
)

func (r *errorObjectResolver) Trace(ctx context.Context, obj *model.ErrorObject) ([]*model.StackFrame, error) {
	frames := []*model.StackFrame{}
	if obj.Trace != nil {
		if err := json.Unmarshal([]byte(*obj.Trace), &frames); err != nil {
			return nil, fmt.Errorf("error decoding stack frame data: %v", err)
		}
	}
	return frames, nil
}

func (r *mutationResolver) CreateOrganization(ctx context.Context, name string) (*model.Organization, error) {
	admin, err := r.Query().Admin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error getting admin")
	}
	trialEnd := time.Now().AddDate(0, 0, 14)

	params := &stripe.CustomerParams{}
	c, err := r.StripeClient.Customers.New(params)
	if err != nil {
		return nil, e.Wrap(err, "error creating stripe customer")
	}

	org := &model.Organization{
		StripeCustomerID: &c.ID,
		Name:             &name,
		Admins:           []model.Admin{*admin},
		TrialEndDate:     &trialEnd,
		BillingEmail:     admin.Email,
	}
	if err := r.DB.Create(org).Error; err != nil {
		return nil, e.Wrap(err, "error creating org")
	}
	if err := r.DB.Create(&model.RecordingSettings{
		OrganizationID: org.ID,
		Details:        nil,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error creating new recording settings")
	}
	msg := slack.WebhookMessage{Text: fmt.
		Sprintf("```NEW WORKSPACE \nid: %v\nname: %v\nadmin_email: %v```", org.ID, *org.Name, *admin.Email)}
	if err := slack.PostWebhook("https://hooks.slack.com/services/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", &msg); err != nil {
		log.Errorf("error sending slack hook: %v", err)
	}
	return org, nil
}

func (r *mutationResolver) EditOrganization(ctx context.Context, id int, name *string, billingEmail *string) (*model.Organization, error) {
	org, err := r.isAdminInOrganization(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "error querying org")
	}
	if err := r.DB.Model(org).Updates(&model.Organization{
		Name:         name,
		BillingEmail: billingEmail,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields")
	}
	return org, nil
}

func (r *mutationResolver) MarkSessionAsViewed(ctx context.Context, id int) (*model.Session, error) {
	_, err := r.isAdminSessionOwner(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	session := &model.Session{}
	res := r.DB.Where(&model.Session{Model: model.Model{ID: id}}).First(&session)
	if err := res.Update(&model.Session{
		Viewed: true,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error writing session as viewed")
	}

	return session, nil
}

func (r *mutationResolver) DeleteOrganization(ctx context.Context, id int) (*bool, error) {
	if err := r.DB.Delete(&model.Organization{Model: model.Model{ID: id}}).Error; err != nil {
		return nil, e.Wrap(err, "error deleting organization")
	}
	t := true
	return &t, nil
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

func (r *mutationResolver) CreateSegment(ctx context.Context, organizationID int, name string, params modelInputs.SearchParamsInput) (*model.Segment, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin is not in organization")
	}
	modelParams := InputToParams(&params)
	// Convert to json to store in the db.
	paramBytes, err := json.Marshal(modelParams)
	if err != nil {
		return nil, e.Wrap(err, "error unmarshaling search params")
	}
	paramString := string(paramBytes)

	segment := &model.Segment{
		Name:           &name,
		Params:         &paramString,
		OrganizationID: organizationID,
	}
	if err := r.DB.Create(segment).Error; err != nil {
		return nil, e.Wrap(err, "error creating segment")
	}
	return segment, nil
}

func (r *mutationResolver) EditSegment(ctx context.Context, id int, organizationID int, params modelInputs.SearchParamsInput) (*bool, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin is not in organization")
	}
	modelParams := InputToParams(&params)
	// Convert to json to store in the db.
	paramBytes, err := json.Marshal(modelParams)
	if err != nil {
		return nil, e.Wrap(err, "error unmarshaling search params")
	}
	paramString := string(paramBytes)
	if err := r.DB.Model(&model.Segment{Model: model.Model{ID: id}}).Updates(&model.Segment{
		Params: &paramString,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error writing new recording settings")
	}
	t := true
	return &t, nil
}

func (r *mutationResolver) DeleteSegment(ctx context.Context, segmentID int) (*bool, error) {
	if err := r.DB.Delete(&model.Segment{Model: model.Model{ID: segmentID}}).Error; err != nil {
		return nil, e.Wrap(err, "error deleting segment")
	}
	t := true
	return &t, nil
}

func (r *mutationResolver) EditRecordingSettings(ctx context.Context, organizationID int, details *string) (*model.RecordingSettings, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin not found in org")
	}
	rec := &model.RecordingSettings{}
	res := r.DB.Where(&model.RecordingSettings{Model: model.Model{ID: organizationID}}).First(&rec)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error querying record")
	}
	if err := r.DB.Model(rec).Updates(&model.RecordingSettings{
		OrganizationID: organizationID,
		Details:        details,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error writing new recording settings")
	}
	return rec, nil
}

func (r *mutationResolver) CreateOrUpdateSubscription(ctx context.Context, organizationID int, plan modelInputs.Plan) (*string, error) {
	org, err := r.isAdminInOrganization(ctx, organizationID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in organization")
	}

	// For older workspaces, if there's no customer ID, we create a StripeCustomer obj.
	if org.StripeCustomerID == nil {
		params := &stripe.CustomerParams{}
		c, err := r.StripeClient.Customers.New(params)
		if err != nil {
			return nil, e.Wrap(err, "error creating stripe customer")
		}
		if err := r.DB.Model(org).Updates(&model.Organization{
			StripeCustomerID: &c.ID,
		}).Error; err != nil {
			return nil, e.Wrap(err, "error updating org fields")
		}
		org.StripeCustomerID = &c.ID
	}

	// Check if there's already a subscription on the user. If there is, we do an update and return early.
	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions")
	c, err := r.StripeClient.Customers.Get(*org.StripeCustomerID, params)
	if err != nil {
		return nil, e.Wrap(err, "couldn't retrieve stripe customer data")
	}
	// If there's a single subscription on the user and a single price item on the subscription
	if len(c.Subscriptions.Data) == 1 && len(c.Subscriptions.Data[0].Items.Data) == 1 {
		plan := ToPriceID(plan)
		subscriptionParams := &stripe.SubscriptionParams{
			CancelAtPeriodEnd: stripe.Bool(false),
			ProrationBehavior: stripe.String(string(stripe.SubscriptionProrationBehaviorCreateProrations)),
			Items: []*stripe.SubscriptionItemsParams{
				{
					ID:   stripe.String(c.Subscriptions.Data[0].Items.Data[0].ID),
					Plan: &plan,
				},
			},
		}
		_, err := r.StripeClient.Subscriptions.Update(c.Subscriptions.Data[0].ID, subscriptionParams)
		if err != nil {
			return nil, e.Wrap(err, "couldn't update subscription")
		}
		ret := ""
		return &ret, nil
	}

	// If there's no existing subscription, we create a checkout.
	checkoutSessionParams := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String(os.Getenv("FRONTEND_URI") + "/" + strconv.Itoa(organizationID) + "/billing/success"),
		CancelURL:  stripe.String(os.Getenv("FRONTEND_URI") + "/" + strconv.Itoa(organizationID) + "/billing/checkoutCanceled"),
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		Customer: org.StripeCustomerID,
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			Items: []*stripe.CheckoutSessionSubscriptionDataItemsParams{
				{
					Plan: stripe.String(ToPriceID(plan)),
				},
			},
		},
		Mode: stripe.String(string(stripe.CheckoutSessionModeSubscription)),
	}

	stripeSession, err := r.StripeClient.CheckoutSessions.New(checkoutSessionParams)
	if err != nil {
		return nil, e.Wrap(err, "error creating CheckoutSession in stripe")
	}

	return &stripeSession.ID, nil
}

func (r *queryResolver) Session(ctx context.Context, id int) (*model.Session, error) {
	if _, err := r.isAdminSessionOwner(ctx, id); err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	sessionObj := &model.Session{}
	res := r.DB.Preload("Fields").Where(&model.Session{Model: model.Model{ID: id}}).First(&sessionObj)
	if res.Error != nil {
		return nil, fmt.Errorf("error reading from session: %v", res.Error)
	}
	return sessionObj, nil
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

func (r *queryResolver) Errors(ctx context.Context, organizationID int) ([]*model.ErrorObject, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin not found in org")
	}
	errorObjs := []*model.ErrorObject{}
	if res := r.DB.Order("created_at desc").Where(&model.ErrorObject{OrganizationID: organizationID}).Find(&errorObjs); res.Error != nil {
		return nil, fmt.Errorf("error reading from errors: %v", res.Error)
	}
	return errorObjs, nil
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

func (r *queryResolver) SessionsBeta(ctx context.Context, organizationID int, count int, params *modelInputs.SearchParamsInput) (*model.SessionResults, error) {
	// Find fields based on the search params
	//included fields
	fieldCheck := true
	visitedCheck := true
	referrerCheck := true
	fieldIds := []int{}
	visitedIds := []int{}
	referrerIds := []int{}
	fieldQuery := r.DB.Model(&model.Field{})
	visitedQuery := r.DB.Model(&model.Field{})
	referrerQuery := r.DB.Model(&model.Field{})

	for _, prop := range params.UserProperties {
		if prop.Name == "contains" {
			fieldQuery = fieldQuery.Or("value ILIKE ? and type = ?", "%"+prop.Value+"%", "user")
		} else {
			fieldQuery = fieldQuery.Or("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "user")
		}
	}

	for _, prop := range params.TrackProperties {
		if prop.Name == "contains" {
			fieldQuery = fieldQuery.Or("value ILIKE ? and type = ?", "%"+prop.Value+"%", "track")
		} else {
			fieldQuery = fieldQuery.Or("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "track")
		}
	}

	if params.VisitedURL != nil {
		visitedQuery = visitedQuery.Or("name = ? and value ILIKE ?", "visited-url", "%"+*params.VisitedURL+"%")
	}

	if params.Referrer != nil {
		referrerQuery = referrerQuery.Or("name = ? and value ILIKE ?", "referrer", "%"+*params.Referrer+"%")
	}

	if len(params.UserProperties)+len(params.TrackProperties) > 0 {
		if err := fieldQuery.Pluck("id", &fieldIds).Error; err != nil {
			return nil, e.Wrap(err, "error querying initial set of session fields")
		}
		if len(fieldIds) == 0 {
			fieldCheck = false
		}
	}

	if params.VisitedURL != nil {
		if err := visitedQuery.Pluck("id", &visitedIds).Error; err != nil {
			return nil, e.Wrap(err, "error querying visited-url fields")
		}
		if len(visitedIds) > 0 {
			fieldIds = append(fieldIds, visitedIds...)
		} else {
			visitedCheck = false
		}
	}

	if params.Referrer != nil {
		if err := referrerQuery.Pluck("id", &referrerIds).Error; err != nil {
			return nil, e.Wrap(err, "error querying referrer fields")
		}
		if len(referrerIds) > 0 {
			fieldIds = append(fieldIds, referrerIds...)
		} else {
			referrerCheck = false
		}
	}

	//excluded fields
	notFieldIds := []int{}
	notFieldQuery := r.DB.Model(&model.Field{})

	for _, prop := range params.ExcludedProperties {
		if prop.Name == "contains" {
			notFieldQuery = notFieldQuery.Or("name = 'identifier' AND value ILIKE ? and type = ?", "%"+prop.Value+"%", "user")
			notFieldQuery = notFieldQuery.Or("name = 'name' AND value ILIKE ? and type = ?", "%"+prop.Value+"%", "user")
		} else {
			notFieldQuery = notFieldQuery.Or("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "user")
		}
	}

	//pluck not field ids
	if len(params.ExcludedProperties) > 0 {
		if err := notFieldQuery.Pluck("id", &notFieldIds).Error; err != nil {
			return nil, e.Wrap(err, "error querying initial set of excluded sessions fields")
		}
	}

	//find all session with those fields (if any)
	queriedSessions := []model.Session{}

	queryString := `SELECT id, user_id, organization_id, processed, os_name, os_version, browser_name,  
	browser_version, city, state, postal, identifier, created_at, deleted_at, length, user_object, viewed 
	FROM (SELECT id, user_id, organization_id, processed, os_name, os_version, browser_name,  
	browser_version, city, state, postal, identifier, created_at, deleted_at, length, user_object, viewed, array_agg(t.field_id) fieldIds 
	FROM sessions s INNER JOIN session_fields t ON s.id=t.session_id GROUP BY s.id) AS rows `

	//WHERE (organization_id = ?) AND (length > ?", organizationID, 1000)
	//query = query.Where("processed = ?", true).Order("created_at desc")
	queryString += fmt.Sprintf("WHERE (organization_id = %d) ", organizationID)
	queryString += fmt.Sprintf("AND (length > %d) ", 1000)
	queryString += "AND (processed = true) "
	queryString += "AND (deleted_at IS NULL) "

	if len(fieldIds) > 0 {
		queryString += "AND ("
		for idx, id := range fieldIds {
			if idx == 0 {
				queryString += fmt.Sprintf("(fieldIds @> ARRAY[%d]::int[]) ", id)
			} else {
				queryString += fmt.Sprintf("OR (fieldIds @> ARRAY[%d]::int[]) ", id)
			}
		}
		queryString += ") "
	}

	if len(notFieldIds) > 0 {
		for _, id := range notFieldIds {
			queryString += fmt.Sprintf("AND NOT (fieldIds @> ARRAY[%d]::int[]) ", id)
		}
	}

	if d := params.DateRange; d != nil {
		queryString += fmt.Sprintf("AND (created_at > '%s') AND (created_at < '%s') ", d.StartDate.Format("2006-01-02 15:04:05"), d.EndDate.Format("2006-01-02 15:04:05"))
	}

	if os := params.Os; os != nil {
		queryString += fmt.Sprintf("AND (os_name = '%s') ", *os)
	}

	if identified := params.Identified; identified != nil && *identified {
		queryString += "AND (length(identifier) > 0) "
	}

	if viewed := params.HideViewed; viewed != nil && *viewed {
		queryString += "AND (viewed = false) "
	}

	if browser := params.Browser; browser != nil {
		queryString += fmt.Sprintf("AND (browser_name = '%s') ", *browser)
	}

	//if there should be fields but aren't no sessions are returned
	if !fieldCheck || !visitedCheck || !referrerCheck {
		queryString += "AND (id != id) "
	}

	queryString += "ORDER BY created_at DESC"

	if err := r.DB.Raw(queryString).Scan(&queriedSessions).Error; err != nil {
		return nil, e.Wrap(err, "error querying filtered sessions")
	}

	if len(queriedSessions) < count {
		count = len(queriedSessions)
	}
	sessionList := &model.SessionResults{
		Sessions:   queriedSessions[:count],
		TotalCount: len(queriedSessions),
	}
	return sessionList, nil
}

func (r *queryResolver) BillingDetails(ctx context.Context, organizationID int) (modelInputs.Plan, error) {
	none := modelInputs.PlanNone
	org, err := r.isAdminInOrganization(ctx, organizationID)
	if err != nil {
		return none, e.Wrap(err, "admin not found in org")
	}
	if org.StripeCustomerID == nil {
		return none, nil
	}
	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions")
	c, err := r.StripeClient.Customers.Get(*org.StripeCustomerID, params)
	if err != nil {
		return none, e.Wrap(err, "couldn't retrieve customer")
	}
	if len(c.Subscriptions.Data) == 0 {
		return none, nil
	}
	if len(c.Subscriptions.Data[0].Items.Data) == 0 {
		return none, nil
	}
	plan := FromPriceID(c.Subscriptions.Data[0].Items.Data[0].Plan.ID)
	return plan, nil
}

func (r *queryResolver) FieldSuggestionBeta(ctx context.Context, organizationID int, name string, query string) ([]*model.Field, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "error querying organization")
	}
	fields := []*model.Field{}
	res := r.DB.Where(&model.Field{OrganizationID: organizationID, Name: name}).
		Where("length(value) > ?", 0).
		Where("value ILIKE ?", "%"+query+"%").
		Limit(8).
		Find(&fields)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error querying field suggestion")
	}
	return fields, nil
}

func (r *queryResolver) PropertySuggestion(ctx context.Context, organizationID int, query string, typeArg string) ([]*model.Field, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "error querying organization")
	}
	fields := []*model.Field{}
	res := r.DB.Where(&model.Field{OrganizationID: organizationID, Type: typeArg}).
		Where("length(value) > ?", 0).
		Where("value ILIKE ?", "%"+query+"%").
		Limit(8).
		Find(&fields)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "error querying field suggestion")
	}
	return fields, nil
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
			return nil, e.Wrap(err, "error retrieving user from firebase api")
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

func (r *queryResolver) Segments(ctx context.Context, organizationID int) ([]*model.Segment, error) {
	if _, err := r.isAdminInOrganization(ctx, organizationID); err != nil {
		return nil, e.Wrap(err, "admin not found in org")
	}
	// list of maps, where each map represents a field query.
	segments := []*model.Segment{}
	if err := r.DB.Where(model.Segment{OrganizationID: organizationID}).Find(&segments).Error; err != nil {
		log.Errorf("error querying segments from organization: %v", err)
	}
	return segments, nil
}

func (r *queryResolver) RecordingSettings(ctx context.Context, organizationID int) (*model.RecordingSettings, error) {
	recordingSettings := &model.RecordingSettings{OrganizationID: organizationID}
	if res := r.DB.Where(&model.RecordingSettings{OrganizationID: organizationID}).First(&recordingSettings); res.RecordNotFound() || res.Error != nil {
		newRecordSettings := &model.RecordingSettings{
			OrganizationID: organizationID,
			Details:        nil,
		}
		if err := r.DB.Create(newRecordSettings).Error; err != nil {
			return nil, e.Wrap(err, "error creating new recording settings")
		}
		recordingSettings = newRecordSettings
	}
	return recordingSettings, nil
}

func (r *segmentResolver) Params(ctx context.Context, obj *model.Segment) (*model.SearchParams, error) {
	params := &model.SearchParams{}
	if obj.Params == nil {
		return params, nil
	}
	if err := json.Unmarshal([]byte(*obj.Params), params); err != nil {
		return nil, e.Wrapf(err, "error unmarshaling segment params")
	}
	return params, nil
}

func (r *sessionResolver) UserObject(ctx context.Context, obj *model.Session) (interface{}, error) {
	return obj.UserObject, nil
}

func (r *stackFrameResolver) Args(ctx context.Context, obj *model.StackFrame) ([]*string, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *stackFrameResolver) Source(ctx context.Context, obj *model.StackFrame) (*string, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *stackFrameResolver) IsEval(ctx context.Context, obj *model.StackFrame) (*bool, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *stackFrameResolver) IsNative(ctx context.Context, obj *model.StackFrame) (*bool, error) {
	panic(fmt.Errorf("not implemented"))
}

// ErrorObject returns generated.ErrorObjectResolver implementation.
func (r *Resolver) ErrorObject() generated.ErrorObjectResolver { return &errorObjectResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Segment returns generated.SegmentResolver implementation.
func (r *Resolver) Segment() generated.SegmentResolver { return &segmentResolver{r} }

// Session returns generated.SessionResolver implementation.
func (r *Resolver) Session() generated.SessionResolver { return &sessionResolver{r} }

// StackFrame returns generated.StackFrameResolver implementation.
func (r *Resolver) StackFrame() generated.StackFrameResolver { return &stackFrameResolver{r} }

type errorObjectResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type segmentResolver struct{ *Resolver }
type sessionResolver struct{ *Resolver }
type stackFrameResolver struct{ *Resolver }
