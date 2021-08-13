package graph

import (
	"context"
	"fmt"
	"os"
	"strings"

	e "github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/client"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var (
	WhitelistedUID                        = os.Getenv("WHITELISTED_FIREBASE_ACCOUNT")
	SendAdminInviteEmailTemplateID        = "d-bca4f9a932ef418a923cbd2d90d2790b"
	SendGridSessionCommentEmailTemplateID = "d-6de8f2ba10164000a2b83d9db8e3b2e3"
	SendGridErrorCommentEmailTemplateId   = "d-7929ce90c6514282a57fdaf7af408704"
)

type Resolver struct {
	DB            *gorm.DB
	MailClient    *sendgrid.Client
	StripeClient  *client.API
	StorageClient *storage.StorageClient
}

func (r *Resolver) getCurrentAdmin(ctx context.Context) (*model.Admin, error) {
	return r.Query().Admin(ctx)
}

func (r *Resolver) isWhitelistedAccount(ctx context.Context) bool {
	uid := fmt.Sprintf("%v", ctx.Value(model.ContextKeys.UID))
	email := fmt.Sprintf("%v", ctx.Value(model.ContextKeys.Email))
	// Allow access to engineering@highlight.run or any verified @highlight.run email.
	return uid == WhitelistedUID || strings.Contains(email, "@highlight.run")
}

// These are authentication methods used to make sure that data is secured.
// This'll probably get expensive at some point; they can probably be cached.
func (r *Resolver) isAdminInOrganization(ctx context.Context, org_id int) (*model.Organization, error) {
	if util.IsTestEnv() {
		return nil, nil
	}
	if r.isWhitelistedAccount(ctx) {
		org := &model.Organization{}
		if err := r.DB.Where(&model.Organization{Model: model.Model{ID: org_id}}).First(&org).Error; err != nil {
			return nil, e.Wrap(err, "error querying org")
		}
		return org, nil
	}
	orgs, err := r.Query().Organizations(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error querying orgs")
	}
	for _, o := range orgs {
		if o.ID == org_id {
			return o, nil
		}
	}
	return nil, e.New("admin doesn't exist in organization")
}

func InputToParams(params *modelInputs.SearchParamsInput) *model.SearchParams {
	// Parse the inputType into the regular type.
	modelParams := &model.SearchParams{
		Browser:    params.Browser,
		OS:         params.Os,
		VisitedURL: params.VisitedURL,
		Referrer:   params.Referrer,
	}
	if params.Identified != nil {
		modelParams.Identified = *params.Identified
	}
	if params.FirstTime != nil {
		modelParams.FirstTime = *params.FirstTime
	}
	if params.HideViewed != nil {
		modelParams.HideViewed = *params.HideViewed
	}
	if params.DateRange != nil {
		modelParams.DateRange = &model.DateRange{}
		if params.DateRange.StartDate != nil {
			modelParams.DateRange.StartDate = *params.DateRange.StartDate
		}
		if params.DateRange.EndDate != nil {
			modelParams.DateRange.EndDate = *params.DateRange.EndDate
		}
	}
	if params.LengthRange != nil {
		modelParams.LengthRange = &model.LengthRange{}
		if params.LengthRange.Min != nil {
			modelParams.LengthRange.Min = *params.LengthRange.Min
		}
		if params.LengthRange.Max != nil {
			modelParams.LengthRange.Max = *params.LengthRange.Max
		}
	}
	for _, property := range params.UserProperties {
		var id int
		if property.ID != nil {
			id = *property.ID
		}
		newProperty := &model.UserProperty{
			ID:    id,
			Name:  property.Name,
			Value: property.Value,
		}
		modelParams.UserProperties = append(modelParams.UserProperties, newProperty)
	}
	for _, property := range params.ExcludedProperties {
		var id int
		if property.ID != nil {
			id = *property.ID
		}
		newProperty := &model.UserProperty{
			ID:    id,
			Name:  property.Name,
			Value: property.Value,
		}
		modelParams.ExcludedProperties = append(modelParams.ExcludedProperties, newProperty)
	}
	for _, property := range params.TrackProperties {
		var id int
		if property.ID != nil {
			id = *property.ID
		}
		newProperty := &model.UserProperty{
			ID:    id,
			Name:  property.Name,
			Value: property.Value,
		}
		modelParams.TrackProperties = append(modelParams.TrackProperties, newProperty)
	}
	return modelParams
}

func ErrorInputToParams(params *modelInputs.ErrorSearchParamsInput) *model.ErrorSearchParams {
	// Parse the inputType into the regular type.
	modelParams := &model.ErrorSearchParams{
		Browser:    params.Browser,
		OS:         params.Os,
		VisitedURL: params.VisitedURL,
		Event:      params.Event,
	}
	if params.State != nil {
		modelParams.State = params.State
	}
	if params.DateRange != nil {
		modelParams.DateRange = &model.DateRange{}
		if params.DateRange.StartDate != nil {
			modelParams.DateRange.StartDate = *params.DateRange.StartDate
		}
		if params.DateRange.EndDate != nil {
			modelParams.DateRange.EndDate = *params.DateRange.EndDate
		}
	}
	return modelParams
}

func (r *Resolver) isAdminErrorGroupOwner(ctx context.Context, errorGroupID int) (*model.ErrorGroup, error) {
	errorGroup := &model.ErrorGroup{}
	if err := r.DB.Where(&model.ErrorGroup{Model: model.Model{ID: errorGroupID}}).First(&errorGroup).Error; err != nil {
		return nil, e.Wrap(err, "error querying session")
	}
	_, err := r.isAdminInOrganization(ctx, errorGroup.OrganizationID)
	if err != nil {
		return nil, e.Wrap(err, "error validating admin in organization")
	}
	return errorGroup, nil
}

func (r *Resolver) _doesAdminOwnSession(ctx context.Context, session_id int) (session *model.Session, ownsSession bool, err error) {
	session = &model.Session{}
	if err = r.DB.Where(&model.Session{Model: model.Model{ID: session_id}}).First(&session).Error; err != nil {
		return nil, false, e.Wrap(err, "error querying session")
	}

	_, err = r.isAdminInOrganization(ctx, session.OrganizationID)
	if err != nil {
		return session, false, e.Wrap(err, "error validating admin in organization")
	}
	return session, true, nil
}

func (r *Resolver) canAdminViewSession(ctx context.Context, session_id int) (*model.Session, error) {
	session, isOwner, err := r._doesAdminOwnSession(ctx, session_id)
	if err == nil && isOwner {
		return session, nil
	}
	if session != nil && *session.IsPublic {
		return session, nil
	}
	return nil, err
}

func (r *Resolver) canAdminModifySession(ctx context.Context, session_id int) (*model.Session, error) {
	session, isOwner, err := r._doesAdminOwnSession(ctx, session_id)
	if err == nil && isOwner {
		return session, nil
	}
	return nil, err
}

func (r *Resolver) isAdminSegmentOwner(ctx context.Context, segment_id int) (*model.Segment, error) {
	segment := &model.Segment{}
	if err := r.DB.Where(&model.Segment{Model: model.Model{ID: segment_id}}).First(&segment).Error; err != nil {
		return nil, e.Wrap(err, "error querying segment")
	}
	_, err := r.isAdminInOrganization(ctx, segment.OrganizationID)
	if err != nil {
		return nil, e.Wrap(err, "error validating admin in organization")
	}
	return segment, nil
}

func (r *Resolver) isAdminErrorSegmentOwner(ctx context.Context, error_segment_id int) (*model.ErrorSegment, error) {
	segment := &model.ErrorSegment{}
	if err := r.DB.Where(&model.ErrorSegment{Model: model.Model{ID: error_segment_id}}).First(&segment).Error; err != nil {
		return nil, e.Wrap(err, "error querying error segment")
	}
	_, err := r.isAdminInOrganization(ctx, segment.OrganizationID)
	if err != nil {
		return nil, e.Wrap(err, "error validating admin in organization")
	}
	return segment, nil
}

func (r *Resolver) UpdateSessionsVisibility(organizationID int, newPlan modelInputs.PlanType, originalPlan modelInputs.PlanType) {
	isPlanUpgrade := true
	switch originalPlan {
	case modelInputs.PlanTypeFree:
		if newPlan == modelInputs.PlanTypeFree {
			isPlanUpgrade = false
		}
	case modelInputs.PlanTypeBasic:
		if newPlan == modelInputs.PlanTypeFree {
			isPlanUpgrade = false
		}
	case modelInputs.PlanTypeStartup:
		if newPlan == modelInputs.PlanTypeFree || newPlan == modelInputs.PlanTypeBasic {
			isPlanUpgrade = false
		}
	case modelInputs.PlanTypeEnterprise:
		if newPlan == modelInputs.PlanTypeFree || newPlan == modelInputs.PlanTypeBasic || newPlan == modelInputs.PlanTypeStartup {
			isPlanUpgrade = false
		}
	}
	if isPlanUpgrade {
		if err := r.DB.Model(&model.Session{}).Where(&model.Session{OrganizationID: organizationID, WithinBillingQuota: &model.F}).Updates(model.Session{WithinBillingQuota: &model.T}).Error; err != nil {
			log.Error(e.Wrap(err, "error updating within_billing_quota on sessions upon plan upgrade"))
		}
	}
}

func (r *queryResolver) getFieldFilters(ctx context.Context, organizationID int, params *modelInputs.SearchParamsInput) (customJoinClause string, whereClause string, err error) {
	// Find fields based on the search params
	//included fields
	fieldCheck := true
	visitedCheck := true
	referrerCheck := true
	fieldIds := []int{}
	fieldQuery := r.DB.Model(&model.Field{})
	visitedIds := []int{}
	referrerIds := []int{}
	visitedQuery := r.DB.Model(&model.Field{})
	referrerQuery := r.DB.Model(&model.Field{})

	fieldsSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.fieldsQuery"), tracer.Tag("org_id", organizationID))
	for _, prop := range params.UserProperties {
		if prop.Name == "contains" {
			fieldQuery = fieldQuery.Or("value ILIKE ? and type = ?", "%"+prop.Value+"%", "user")
		} else if prop.ID == nil || *prop.ID == 0 {
			fieldQuery = fieldQuery.Or("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "user")
		} else {
			fieldIds = append(fieldIds, *prop.ID)
		}
	}

	for _, prop := range params.TrackProperties {
		if prop.Name == "contains" {
			fieldQuery = fieldQuery.Or("value ILIKE ? and type = ?", "%"+prop.Value+"%", "track")
		} else if prop.ID == nil || *prop.ID == 0 {
			fieldQuery = fieldQuery.Or("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "track")
		} else {
			fieldIds = append(fieldIds, *prop.ID)
		}
	}

	if params.VisitedURL != nil {
		visitedQuery = visitedQuery.Or("name = ? and value ILIKE ?", "visited-url", "%"+*params.VisitedURL+"%")
	}

	if params.Referrer != nil {
		referrerQuery = referrerQuery.Or("name = ? and value ILIKE ?", "referrer", "%"+*params.Referrer+"%")
	}

	if len(params.UserProperties)+len(params.TrackProperties) > 0 {
		if len(params.UserProperties)+len(params.TrackProperties) != len(fieldIds) {
			var tempFieldIds []int
			if err := fieldQuery.Pluck("id", &tempFieldIds).Error; err != nil {
				return "", "", e.Wrap(err, "error querying initial set of session fields")
			}
			fieldIds = append(fieldIds, tempFieldIds...)
		}
		if len(fieldIds) == 0 {
			fieldCheck = false
		}
	}

	if params.VisitedURL != nil {
		if err := visitedQuery.Pluck("id", &visitedIds).Error; err != nil {
			return "", "", e.Wrap(err, "error querying visited-url fields")
		}
		if len(visitedIds) == 0 {
			visitedCheck = false
		}
	}

	if params.Referrer != nil {
		if err := referrerQuery.Pluck("id", &referrerIds).Error; err != nil {
			return "", "", e.Wrap(err, "error querying referrer fields")
		}
		if len(referrerIds) == 0 {
			referrerCheck = false
		}
	}

	//excluded fields
	notFieldIds := []int{}
	notFieldQuery := r.DB.Model(&model.Field{})

	for _, prop := range params.ExcludedProperties {
		if prop.Name == "contains" {
			notFieldQuery = notFieldQuery.Or("value ILIKE ? and type = ?", "%"+prop.Value+"%", "user")
		} else if prop.ID == nil || *prop.ID == 0 {
			notFieldQuery = notFieldQuery.Or("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "user")
		} else {
			notFieldIds = append(notFieldIds, *prop.ID)
		}
	}

	if len(params.ExcludedProperties) != len(notFieldIds) {
		var tempNotFieldIds []int
		if err := notFieldQuery.Pluck("id", &notFieldIds).Error; err != nil {
			return "", "", e.Wrap(err, "error querying initial set of excluded sessions fields")
		}
		notFieldIds = append(notFieldIds, tempNotFieldIds...)
	}

	//excluded track fields
	notTrackFieldIds := []int{}
	notTrackFieldQuery := r.DB.Model(&model.Field{})

	for _, prop := range params.ExcludedTrackProperties {
		if prop.Name == "contains" {
			notTrackFieldQuery = notTrackFieldQuery.Or("value ILIKE ? and type = ?", "%"+prop.Value+"%", "track")
		} else if prop.ID == nil || *prop.ID == 0 {
			notTrackFieldQuery = notTrackFieldQuery.Or("name = ? AND value = ? AND type = ?", prop.Name, prop.Value, "track")
		} else {
			notTrackFieldIds = append(notTrackFieldIds, *prop.ID)
		}
	}

	//pluck not field ids
	if len(params.ExcludedTrackProperties) != len(notTrackFieldIds) {
		var tempNotTrackFieldIds []int
		if err := notTrackFieldQuery.Pluck("id", &tempNotTrackFieldIds).Error; err != nil {
			return "", "", e.Wrap(err, "error querying initial set of excluded track sessions fields")
		}
		notTrackFieldIds = append(notTrackFieldIds, tempNotTrackFieldIds...)
	}

	fieldsSpan.Finish()

	if len(fieldIds) > 0 {
		t := strings.Replace(fmt.Sprint(fieldIds), " ", ",", -1)
		whereClause += fmt.Sprintf("AND (fieldIds && ARRAY%s::integer[])", t)
	}

	if len(visitedIds) > 0 {
		t := strings.Replace(fmt.Sprint(visitedIds), " ", ",", -1)
		whereClause += fmt.Sprintf("AND (fieldIds && ARRAY%s::integer[])", t)
	}

	if len(referrerIds) > 0 {
		t := strings.Replace(fmt.Sprint(referrerIds), " ", ",", -1)
		whereClause += fmt.Sprintf("AND (fieldIds && ARRAY%s::integer[])", t)
	}

	if len(notFieldIds) > 0 {
		t := strings.Replace(fmt.Sprint(notFieldIds), " ", ",", -1)
		whereClause += fmt.Sprintf("AND NOT (fieldIds && ARRAY%s::integer[])", t)
	}

	if len(notTrackFieldIds) > 0 {
		t := strings.Replace(fmt.Sprint(notTrackFieldIds), " ", ",", -1)
		whereClause += fmt.Sprintf("AND NOT (fieldIds && ARRAY%s::integer[])", t)
	}

	//if there should be fields but aren't no sessions are returned
	if !fieldCheck || !visitedCheck || !referrerCheck {
		whereClause += "AND (id != id) "
	}

	isUnfilteredQuery := len(fieldIds) == 0 && len(visitedIds) == 0 && len(referrerIds) == 0 && len(notFieldIds) == 0 && len(notTrackFieldIds) == 0
	if (!isUnfilteredQuery) {
		fieldsInnerJoinStatement := "INNER JOIN session_fields t ON s.id=t.session_id"
		fieldsSelectStatement := ", array_agg(t.field_id) fieldIds"
		customJoinClause = fmt.Sprintf("FROM (SELECT id, user_id, organization_id, processed, starred, first_time, os_name, os_version, browser_name, browser_version, city, state, postal, identifier, fingerprint, created_at, deleted_at, length, active_length, user_object, viewed, within_billing_quota, field_group %s FROM sessions s %s GROUP BY s.id) AS rows", fieldsSelectStatement, fieldsInnerJoinStatement)
	}

	return customJoinClause, whereClause, nil
}
