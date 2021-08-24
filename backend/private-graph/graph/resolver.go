package graph

import (
	"context"
	"fmt"
	"os"
	"strings"

	e "github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"github.com/stripe/stripe-go/client"
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

func (r *Resolver) isDemoOrg(org_id int) bool {
	return org_id == 0
}

// These are authentication methods used to make sure that data is secured.
// This'll probably get expensive at some point; they can probably be cached.

// isAdminInOrganizationOrDemoOrg should be used for actions that you want admins in all organizations
// and laymen in the demo org to have access to.
func (r *Resolver) isAdminInOrganizationOrDemoOrg(ctx context.Context, org_id int) (*model.Organization, error) {
	var org *model.Organization
	var err error
	if r.isDemoOrg(org_id) {
		if err = r.DB.Model(&model.Organization{}).Where("id = ?", 0).First(&org).Error; err != nil {
			return nil, e.Wrap(err, "error querying demo org")
		}
	} else {
		org, err = r.isAdminInOrganization(ctx, org_id)
		if err != nil {
			return nil, e.Wrap(err, "admin is not in organization or demo org")
		}
	}
	return org, nil
}

// isAdminInOrganization should be used for actions that you only want admins in all organizations to have access to.
// Use this on actions that you don't want laymen in the demo org to have access to.
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
	_, err := r.isAdminInOrganizationOrDemoOrg(ctx, errorGroup.OrganizationID)
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

	_, err = r.isAdminInOrganizationOrDemoOrg(ctx, session.OrganizationID)
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
	_, err := r.isAdminInOrganizationOrDemoOrg(ctx, segment.OrganizationID)
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
	_, err := r.isAdminInOrganizationOrDemoOrg(ctx, segment.OrganizationID)
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

func (r *queryResolver) getFieldFilters(ctx context.Context, organizationID int, params *modelInputs.SearchParamsInput) (whereClause string, err error) {
	if params.VisitedURL != nil {
		whereClause += andHasFieldsWhere("fields.name = 'visited-url' AND fields.value ILIKE '%" + *params.VisitedURL + "%'")
	}

	if params.Referrer != nil {
		whereClause += andHasFieldsWhere("fields.name = 'referrer' AND fields.value ILIKE '%" + *params.Referrer + "%'")
	}

	inclusiveFilters := []string{}
	inclusiveFilters = append(inclusiveFilters, getSQLFilters(params.UserProperties, "user")...)
	inclusiveFilters = append(inclusiveFilters, getSQLFilters(params.TrackProperties, "track")...)
	if len(inclusiveFilters) > 0 {
		whereClause += andHasFieldsWhere(strings.Join(inclusiveFilters, " OR "))
	}

	exclusiveFilters := []string{}
	exclusiveFilters = append(exclusiveFilters, getSQLFilters(params.ExcludedProperties, "user")...)
	exclusiveFilters = append(exclusiveFilters, getSQLFilters(params.ExcludedTrackProperties, "track")...)
	if len(exclusiveFilters) > 0 {
		whereClause += andDoesNotHaveFieldsWhere(strings.Join(exclusiveFilters, " OR "))
	}

	return whereClause, nil
}

func andHasFieldsWhere(fieldConditions string) string {
	return fmt.Sprintf(`AND EXISTS (
		SELECT 1
		FROM session_fields
		JOIN fields
		ON session_fields.field_id = fields.id
		WHERE session_fields.session_id = sessions.id
		AND (
			%s
		)
		LIMIT 1
	) `, fieldConditions)
}

func andDoesNotHaveFieldsWhere(fieldConditions string) string {
	return fmt.Sprintf(`AND NOT EXISTS (
		SELECT 1
		FROM session_fields
		JOIN fields
		ON session_fields.field_id = fields.id
		WHERE session_fields.session_id = sessions.id
		AND (
			%s
		)
		LIMIT 1
	) `, fieldConditions)
}

// Takes a list of user search inputs, and converts them into a list of SQL filters
// propertyType: 'user' or 'track'
func getSQLFilters(userPropertyInputs []*modelInputs.UserPropertyInput, propertyType string) []string {
	sqlFilters := []string{}
	for _, prop := range userPropertyInputs {
		if prop.Name == "contains" {
			sqlFilters = append(sqlFilters, "(fields.type = '"+propertyType+"' AND fields.value ILIKE '%"+prop.Value+"%')")
		} else if prop.ID == nil || *prop.ID == 0 {
			sqlFilters = append(sqlFilters, "(fields.type = '"+propertyType+"' AND fields.name = '"+prop.Name+"' AND fields.value = '"+prop.Value+"')")
		} else {
			sqlFilters = append(sqlFilters, fmt.Sprintf("(fields.id = %d)", *prop.ID))
		}
	}
	return sqlFilters
}

func (r *Resolver) SendEmailAlert(tos []*mail.Email, authorName, viewLink, textForEmail, templateID string, sessionImage *string) error {
	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", "notifications@highlight.run")
	m.SetFrom(from)
	m.SetTemplateID(templateID)

	p := mail.NewPersonalization()
	p.AddTos(tos...)
	p.SetDynamicTemplateData("Author_Name", authorName)
	p.SetDynamicTemplateData("Comment_Link", viewLink)
	p.SetDynamicTemplateData("Comment_Body", textForEmail)

	if sessionImage != nil {
		p.SetDynamicTemplateData("Session_Image", sessionImage)
		a := mail.NewAttachment()
		a.SetContent(*sessionImage)
		a.SetFilename("session-image.png")
		a.SetContentID("sessionImage")
		a.SetType("image/png")
		m.AddAttachment(a)
	}

	m.AddPersonalizations(p)

	_, err := r.MailClient.Send(m)
	if err != nil {
		return e.Wrap(err, "error sending sendgrid email for comments mentions")
	}

	return nil
}

func (r *Resolver) SendPersonalSlackAlert(org *model.Organization, admin *model.Admin, adminIds []int, viewLink, commentText, subjectScope string) error {
	// this is needed for posting DMs
	if org.SlackAccessToken == nil {
		return e.New("slack access token is nil")
	}

	var admins []*model.Admin
	if err := r.DB.Find(&admins, adminIds).Where("slack_im_channel_id IS NOT NULL").Error; err != nil {
		return e.Wrap(err, "error fetching admins")
	}
	// return early if no admins w/ slack_im_channel_id
	if len(admins) < 1 {
		return nil
	}

	var blockSet slack.Blocks

	determiner := "a"
	if subjectScope == "error" {
		determiner = "an"
	}
	message := fmt.Sprintf("You were tagged in %s %s comment.", determiner, subjectScope)
	if admin.Email != nil && *admin.Email != "" {
		message = fmt.Sprintf("%s tagged you in %s %s comment.", *admin.Email, determiner, subjectScope)
	}
	if admin.Name != nil && *admin.Name != "" {
		message = fmt.Sprintf("%s tagged you in %s %s comment.", *admin.Name, determiner, subjectScope)
	}
	blockSet.BlockSet = append(blockSet.BlockSet, slack.NewHeaderBlock(&slack.TextBlockObject{Type: slack.PlainTextType, Text: message}))

	button := slack.NewButtonBlockElement(
		"",
		"click",
		slack.NewTextBlockObject(
			slack.PlainTextType,
			strings.Title(fmt.Sprintf("Visit %s", subjectScope)),
			false,
			false,
		),
	)
	button.URL = viewLink
	blockSet.BlockSet = append(blockSet.BlockSet,
		slack.NewSectionBlock(
			nil,
			[]*slack.TextBlockObject{{Type: slack.MarkdownType, Text: fmt.Sprintf("> %s", commentText)}}, slack.NewAccessory(button),
		),
	)

	blockSet.BlockSet = append(blockSet.BlockSet, slack.NewDividerBlock())
	slackClient := slack.New(*org.SlackAccessToken)
	for _, a := range admins {
		if a.SlackIMChannelID != nil {
			_, _, err := slackClient.PostMessage(*a.SlackIMChannelID, slack.MsgOptionBlocks(blockSet.BlockSet...))
			if err != nil {
				return e.Wrap(err, "error posting slack message")
			}
		}
	}

	return nil
}
