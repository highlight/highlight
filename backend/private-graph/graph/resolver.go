package graph

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	e "github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
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

func (r *Resolver) isDemoProject(project_id int) bool {
	return project_id == 0
}

// These are authentication methods used to make sure that data is secured.
// This'll probably get expensive at some point; they can probably be cached.

// isAdminInProjectOrDemoProject should be used for actions that you want admins in all projects
// and laymen in the demo project to have access to.
func (r *Resolver) isAdminInProjectOrDemoProject(ctx context.Context, project_id int) (*model.Project, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("isAdminInProjectOrDemoProject"))
	defer authSpan.Finish()
	var project *model.Project
	var err error
	if r.isDemoProject(project_id) {
		if err = r.DB.Model(&model.Project{}).Where("id = ?", 0).First(&project).Error; err != nil {
			return nil, e.Wrap(err, "error querying demo project")
		}
	} else {
		project, err = r.isAdminInProject(ctx, project_id)
		if err != nil {
			return nil, e.Wrap(err, "admin is not in project or demo project")
		}
	}
	return project, nil
}

// isAdminInProject should be used for actions that you only want admins in all projects to have access to.
// Use this on actions that you don't want laymen in the demo project to have access to.
func (r *Resolver) isAdminInProject(ctx context.Context, project_id int) (*model.Project, error) {
	if util.IsTestEnv() {
		return nil, nil
	}
	if r.isWhitelistedAccount(ctx) {
		project := &model.Project{}
		if err := r.DB.Where(&model.Project{Model: model.Model{ID: project_id}}).First(&project).Error; err != nil {
			return nil, e.Wrap(err, "error querying project")
		}
		return project, nil
	}
	projects, err := r.Query().Projects(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error querying projects")
	}
	for _, p := range projects {
		if p.ID == project_id {
			return p, nil
		}
	}
	return nil, e.New("admin doesn't exist in project")
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

func (r *Resolver) doesAdminOwnErrorGroup(ctx context.Context, errorGroupID *int, errorGroupSecureID *string) (eg *model.ErrorGroup, isOwner bool, err error) {
	errorGroup := &model.ErrorGroup{}
	if errorGroupID == nil && errorGroupSecureID == nil {
		return nil, false, errors.New("No ID was specified for the error group")
	}
	if errorGroupSecureID != nil {
		if err := r.DB.Where(&model.ErrorGroup{SecureID: *errorGroupSecureID}).First(&errorGroup).Error; err != nil {
			return nil, false, e.Wrap(err, "error querying error group by secureID: "+*errorGroupSecureID)
		}
	} else {
		if err := r.DB.Where(&model.ErrorGroup{Model: model.Model{ID: *errorGroupID}}).First(&errorGroup).Error; err != nil {
			return nil, false, e.Wrap(err, fmt.Sprintf("error querying error group by ID: %d", *errorGroupID))
		}
	}
	_, err = r.isAdminInProjectOrDemoProject(ctx, errorGroup.ProjectID)
	if err != nil {
		return errorGroup, false, e.Wrap(err, "error validating admin in project")
	}
	return errorGroup, true, nil
}

func (r *Resolver) canAdminViewErrorGroup(ctx context.Context, errorGroupID *int, errorGroupSecureID *string) (*model.ErrorGroup, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("canAdminViewErrorGroup"))
	defer authSpan.Finish()
	errorGroup, isOwner, err := r.doesAdminOwnErrorGroup(ctx, errorGroupID, errorGroupSecureID)
	if err == nil && isOwner {
		return errorGroup, nil
	}
	if errorGroup != nil && errorGroup.IsPublic {
		return errorGroup, nil
	}
	return nil, err
}

func (r *Resolver) canAdminModifyErrorGroup(ctx context.Context, errorGroupID *int, errorGroupSecureID *string) (*model.ErrorGroup, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("canAdminModifyErrorGroup"))
	defer authSpan.Finish()
	errorGroup, isOwner, err := r.doesAdminOwnErrorGroup(ctx, errorGroupID, errorGroupSecureID)
	if err == nil && isOwner {
		return errorGroup, nil
	}
	return nil, err
}

func (r *Resolver) _doesAdminOwnSession(ctx context.Context, session_id *int, session_secure_id *string) (session *model.Session, ownsSession bool, err error) {
	session = &model.Session{}
	if session_id == nil && session_secure_id == nil {
		return nil, false, errors.New("No ID was specified for the session")
	}
	if session_secure_id != nil {
		if err = r.DB.Where(&model.Session{SecureID: *session_secure_id}).First(&session).Error; err != nil {
			return nil, false, e.Wrap(err, "error querying session by secure_id: "+*session_secure_id)
		}
	} else {
		if err = r.DB.Where(&model.Session{Model: model.Model{ID: *session_id}}).First(&session).Error; err != nil {
			return nil, false, e.Wrap(err, fmt.Sprintf("error querying session by id: %d", *session_id))
		}
	}

	_, err = r.isAdminInProjectOrDemoProject(ctx, session.ProjectID)
	if err != nil {
		return session, false, e.Wrap(err, "error validating admin in project")
	}
	return session, true, nil
}

func (r *Resolver) canAdminViewSession(ctx context.Context, session_id *int, session_secure_id *string) (*model.Session, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("canAdminViewSession"))
	defer authSpan.Finish()
	session, isOwner, err := r._doesAdminOwnSession(ctx, session_id, session_secure_id)
	if err == nil && isOwner {
		return session, nil
	}
	if session != nil && *session.IsPublic {
		return session, nil
	}
	return nil, err
}

func (r *Resolver) canAdminModifySession(ctx context.Context, session_id *int, session_secure_id *string) (*model.Session, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("canAdminModifySession"))
	defer authSpan.Finish()
	session, isOwner, err := r._doesAdminOwnSession(ctx, session_id, session_secure_id)
	if err == nil && isOwner {
		return session, nil
	}
	return nil, err
}

func (r *Resolver) isAdminSegmentOwner(ctx context.Context, segment_id int) (*model.Segment, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("isAdminSegmentOwner"))
	defer authSpan.Finish()
	segment := &model.Segment{}
	if err := r.DB.Where(&model.Segment{Model: model.Model{ID: segment_id}}).First(&segment).Error; err != nil {
		return nil, e.Wrap(err, "error querying segment")
	}
	_, err := r.isAdminInProjectOrDemoProject(ctx, segment.ProjectID)
	if err != nil {
		return nil, e.Wrap(err, "error validating admin in project")
	}
	return segment, nil
}

func (r *Resolver) isAdminErrorSegmentOwner(ctx context.Context, error_segment_id int) (*model.ErrorSegment, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("isAdminErrorSegmentOwner"))
	defer authSpan.Finish()
	segment := &model.ErrorSegment{}
	if err := r.DB.Where(&model.ErrorSegment{Model: model.Model{ID: error_segment_id}}).First(&segment).Error; err != nil {
		return nil, e.Wrap(err, "error querying error segment")
	}
	_, err := r.isAdminInProjectOrDemoProject(ctx, segment.ProjectID)
	if err != nil {
		return nil, e.Wrap(err, "error validating admin in project")
	}
	return segment, nil
}

func (r *Resolver) UpdateSessionsVisibility(projectID int, newPlan modelInputs.PlanType, originalPlan modelInputs.PlanType) {
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
		if err := r.DB.Model(&model.Session{}).Where(&model.Session{ProjectID: projectID, WithinBillingQuota: &model.F}).Updates(model.Session{WithinBillingQuota: &model.T}).Error; err != nil {
			log.Error(e.Wrap(err, "error updating within_billing_quota on sessions upon plan upgrade"))
		}
	}
}

func (r *queryResolver) getFieldFilters(ctx context.Context, projectID int, params *modelInputs.SearchParamsInput) (whereClause string, err error) {
	if params.VisitedURL != nil {
		whereClause += andSessionHasFieldsWhere("fields.name = 'visited-url' AND fields.value ILIKE '%" + *params.VisitedURL + "%'")
	}

	if params.Referrer != nil {
		whereClause += andSessionHasFieldsWhere("fields.name = 'referrer' AND fields.value ILIKE '%" + *params.Referrer + "%'")
	}

	inclusiveFilters := []string{}
	inclusiveFilters = append(inclusiveFilters, getSQLFilters(params.UserProperties, "user")...)
	inclusiveFilters = append(inclusiveFilters, getSQLFilters(params.TrackProperties, "track")...)
	if len(inclusiveFilters) > 0 {
		whereClause += andSessionHasFieldsWhere(strings.Join(inclusiveFilters, " OR "))
	}

	exclusiveFilters := []string{}
	exclusiveFilters = append(exclusiveFilters, getSQLFilters(params.ExcludedProperties, "user")...)
	exclusiveFilters = append(exclusiveFilters, getSQLFilters(params.ExcludedTrackProperties, "track")...)
	if len(exclusiveFilters) > 0 {
		whereClause += andSessionDoesNotHaveFieldsWhere(strings.Join(exclusiveFilters, " OR "))
	}

	return whereClause, nil
}

func andSessionHasFieldsWhere(fieldConditions string) string {
	return "AND " + SessionHasFieldsWhere(fieldConditions)
}

func SessionHasFieldsWhere(fieldConditions string) string {
	return fmt.Sprintf(`EXISTS (
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

func andSessionDoesNotHaveFieldsWhere(fieldConditions string) string {
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

func andErrorGroupHasSessionsWhere(fieldConditions string) string {
	return fmt.Sprintf(`AND EXISTS (
		SELECT 1
		FROM error_objects
		JOIN sessions
		ON error_objects.session_id = sessions.id
		WHERE error_objects.error_group_id = error_groups.id
		AND (
			%s
		)
		LIMIT 1
	) `, fieldConditions)
}

func andErrorGroupHasErrorObjectWhere(fieldConditions string) string {
	return fmt.Sprintf(`AND EXISTS (
		SELECT 1
		FROM error_objects
		WHERE error_objects.error_group_id = error_groups.id
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

func (r *Resolver) SendPersonalSlackAlert(project *model.Project, admin *model.Admin, adminIds []int, viewLink, commentText, subjectScope string) error {
	// this is needed for posting DMs
	// if nil, user simply hasn't signed up for notifications, so return nil
	if project.SlackAccessToken == nil {
		return nil
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
	slackClient := slack.New(*project.SlackAccessToken)
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

func (r *Resolver) SendSlackAlertToUser(project *model.Project, admin *model.Admin, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput, viewLink, commentText, subjectScope string, base64Image *string) error {
	// this is needed for posting DMs
	// if nil, user simply hasn't signed up for notifications, so return nil
	if project.SlackAccessToken == nil {
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
	slackClient := slack.New(*project.SlackAccessToken)
	for _, slackUser := range taggedSlackUsers {
		if slackUser.WebhookChannelID != nil {
			_, _, _, err := slackClient.JoinConversation(*slackUser.WebhookChannelID)
			if err != nil {
				log.Error(e.Wrap(err, "failed to join slack channel"))
			}
			_, _, err = slackClient.PostMessage(*slackUser.WebhookChannelID, slack.MsgOptionBlocks(blockSet.BlockSet...))
			if err != nil {
				return e.Wrap(err, "error posting slack message via slack bot")
			}
		}
	}

	// Upload the screenshot to the user's Slack workspace.
	// We do this instead of upload it to S3 or somewhere else to defer authorization checks to Slack.
	// If we upload the image somewhere public, anyone with the link to the image will have access. The image could contain sensitive information.
	// By uploading to the user's Slack workspace, we limit the authorization of the image to only Slack members of the user's workspace.
	var uploadedFileKey string
	if base64Image != nil {
		var channels []string
		for _, slackUser := range taggedSlackUsers {
			channels = append(channels, *slackUser.WebhookChannelID)
		}

		// This key will be used as the file name for the file written to disk.
		// This needs to be unique. The uniqueness is guaranteed by the project ID, the admin who created the comment's ID, and the current time
		uploadedFileKey = fmt.Sprintf("slack-image-%d-%d-%d.png", project.ID, admin.ID, time.Now().UnixNano())

		// We are writing the base64 string to disk as a png. We need to do this because the Slack Go client
		// doesn't support uploading files as base64.
		// This is something we'll need to revisit when we start getting larger traffic for comments.
		// The reason for this is each task has disk space of 20GB, each image is around 200 KB. Ideally we do everything in memory without relying on disk.
		dec, err := base64.StdEncoding.DecodeString(*base64Image)
		if err != nil {
			log.Error(e.Wrap(err, "Failed to decode base64 image"))
		}
		f, err := os.Create(uploadedFileKey)
		if err != nil {
			log.Error(e.Wrap(err, "Failed to create file on disk"))
		}
		defer f.Close()
		if _, err := f.Write(dec); err != nil {
			log.Error(e.Wrap(err, "Failed to write file on disk"))
		}
		if err := f.Sync(); err != nil {
			log.Error("Failed to sync file on disk")
		}

		// We need to write the base64 image to disk, read the file, then upload it to Slack.
		// We can't send Slack a base64 string.
		fileUploadParams := slack.FileUploadParameters{
			Filetype: "image/png",
			Filename: fmt.Sprintf("Highlight %s Image.png", subjectScope),
			// These are the channels that will have access to the uploaded file.
			Channels: channels,
			// File:     uploadedFileKey,
			Content: fmt.Sprintf("data:image/png;base64,%s", *base64Image),

			Title: fmt.Sprintf("File from Highlight uploaded on behalf of %s", *admin.Name),
		}
		_, err = slackClient.UploadFile(fileUploadParams)

		if err != nil {
			log.Error(e.Wrap(err, "failed to upload file to Slack"))
		}

		if uploadedFileKey != "" {
			if err := os.Remove(uploadedFileKey); err != nil {
				log.Error(e.Wrap(err, "Failed to remove temporary session screenshot"))

			}
		}
	}

	return nil
}

// Returns the current Admin or an Admin with ID = 0 if the current Admin is a guest
func (r *Resolver) getCurrentAdminOrGuest(ctx context.Context) (currentAdmin *model.Admin, isGuest bool) {
	admin, err := r.getCurrentAdmin(ctx)
	isGuest = false
	if admin == nil || err != nil {
		isGuest = true
		admin = &model.Admin{
			// An Admin record was created manually with an ID of 0.
			Model: model.Model{
				ID: 0,
			},
		}
	}
	return admin, isGuest
}
