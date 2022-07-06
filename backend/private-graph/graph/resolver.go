package graph

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/highlight-run/highlight/backend/timeseries"
	"io/ioutil"
	"math/big"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/leonelquinteros/hubspot"
	"github.com/samber/lo"

	"github.com/pkg/errors"

	"github.com/clearbit/clearbit-go/clearbit"
	"github.com/highlight-run/workerpool"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	"github.com/slack-go/slack/slackevents"
	stripe "github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
	"github.com/stripe/stripe-go/v72/webhook"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"

	Email "github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/pricing"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var (
	WhitelistedUID = os.Getenv("WHITELISTED_FIREBASE_ACCOUNT")
)

type Resolver struct {
	DB                     *gorm.DB
	TDB                    timeseries.DB
	MailClient             *sendgrid.Client
	StripeClient           *client.API
	StorageClient          *storage.StorageClient
	LambdaClient           *lambda.Client
	ClearbitClient         *clearbit.Client
	PrivateWorkerPool      *workerpool.WorkerPool
	OpenSearch             *opensearch.Client
	SubscriptionWorkerPool *workerpool.WorkerPool
	HubspotApi             HubspotApiInterface
}

// For a given session, an EventCursor is the address of an event in the list of events,
// that can be used for incremental fetching.
// The EventIndex must always be specified, with the EventObjectIndex optionally
// specified for optimization purposes.
type EventsCursor struct {
	EventIndex       int
	EventObjectIndex *int
}

func (r *Resolver) getCurrentAdmin(ctx context.Context) (*model.Admin, error) {
	return r.Query().Admin(ctx)
}

func (r *Resolver) getCustomVerifiedAdminEmailDomain(admin *model.Admin) (string, error) {
	domain, err := r.getVerifiedAdminEmailDomain(admin)
	if err != nil {
		return "", e.Wrap(err, "error getting verified admin email domain")
	}

	// this is just the top 10 email domains as of June 6, 2016, and protonmail.com
	if map[string]bool{"gmail.com": true, "yahoo.com": true, "hotmail.com": true, "aol.com": true, "hotmail.co.uk": true, "protonmail.com": true, "hotmail.fr": true, "msn.com": true, "yahoo.fr": true, "wanadoo.fr": true, "orange.fr": true}[strings.ToLower(domain)] {
		return "", nil
	}

	return domain, nil
}

type HubspotApiInterface interface {
	CreateContactForAdmin(adminID int, email string, userDefinedRole string, userDefinedPersona string, first string, last string, phone string) (*int, error)
	CreateCompanyForWorkspace(workspaceID int, adminEmail string, name string) (*int, error)
	CreateContactCompanyAssociation(adminID int, workspaceID int) error
	UpdateContactProperty(adminID int, properties []hubspot.Property) error
	UpdateCompanyProperty(workspaceID int, properties []hubspot.Property) error
}

func (r *Resolver) getVerifiedAdminEmailDomain(admin *model.Admin) (string, error) {
	if admin.EmailVerified == nil || !*admin.EmailVerified {
		return "", e.New("admin email is not verified")
	}
	if admin.Email == nil {
		return "", e.New("admin email is nil")
	}
	components := strings.Split(*admin.Email, "@")
	if len(components) < 2 {
		return "", e.New("invalid admin email")
	}
	domain := components[1]
	return domain, nil
}

func (r *Resolver) getTaggedAdmins(taggedAdmins []*modelInputs.SanitizedAdminInput, isGuestCreatingSession bool) (admins []model.Admin) {
	if !isGuestCreatingSession {
		for _, a := range taggedAdmins {
			admins = append(admins,
				model.Admin{
					Model: model.Model{ID: a.ID},
				},
			)
		}
	}
	return
}

func (r *Resolver) formatSanitizedAuthor(admin *model.Admin) *modelInputs.SanitizedAdmin {
	name := ""
	email := ""
	photo_url := ""

	if admin.Name != nil {
		name = *admin.Name
	}
	if admin.Email != nil {
		email = *admin.Email
	}
	if admin.PhotoURL != nil {
		photo_url = *admin.PhotoURL
	}

	sanitizedAdmin := &modelInputs.SanitizedAdmin{
		ID:       admin.ID,
		Name:     &name,
		Email:    email,
		PhotoURL: &photo_url,
	}

	return sanitizedAdmin
}

func (r *Resolver) isWhitelistedAccount(ctx context.Context) bool {
	uid := fmt.Sprintf("%v", ctx.Value(model.ContextKeys.UID))
	email := fmt.Sprintf("%v", ctx.Value(model.ContextKeys.Email))
	// Allow access to engineering@highlight.run or any verified @highlight.run / @runhighlight.com email.
	_, isAdmin := lo.Find(HighlightAdminEmailDomains, func(domain string) bool { return strings.Contains(email, domain) })
	return isAdmin || uid == WhitelistedUID
}

func (r *Resolver) isDemoProject(project_id int) bool {
	return project_id == 0
}

func (r *Resolver) isDemoWorkspace(workspace_id int) bool {
	return workspace_id == 0
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

func (r *Resolver) isAdminInWorkspaceOrDemoWorkspace(ctx context.Context, workspace_id int) (*model.Workspace, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("isAdminInWorkspaceOrDemoWorkspace"))
	defer authSpan.Finish()
	var workspace *model.Workspace
	var err error
	if r.isDemoWorkspace(workspace_id) {
		if err = r.DB.Model(&model.Workspace{}).Where("id = ?", 0).First(&workspace).Error; err != nil {
			return nil, e.Wrap(err, "error querying demo workspace")
		}
	} else {
		workspace, err = r.isAdminInWorkspace(ctx, workspace_id)
		if err != nil {
			return nil, e.Wrap(err, "admin is not in workspace or demo workspace")
		}
	}
	return workspace, nil
}

func (r *Resolver) GetWorkspace(workspaceID int) (*model.Workspace, error) {
	var workspace model.Workspace
	if err := r.DB.Where(&model.Workspace{Model: model.Model{ID: workspaceID}}).First(&workspace).Error; err != nil {
		return nil, e.Wrap(err, "error querying workspace")
	}
	return &workspace, nil
}

func (r *Resolver) addAdminMembership(ctx context.Context, workspaceId int, inviteID string) (*int, error) {
	workspace := &model.Workspace{}
	if err := r.DB.Model(workspace).Where("id = ?", workspaceId).First(workspace).Error; err != nil {
		return nil, e.Wrap(err, "500: error querying workspace")
	}
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.New("500: error querying admin")
	}

	inviteLink := &model.WorkspaceInviteLink{}
	if err := r.DB.Where(&model.WorkspaceInviteLink{WorkspaceID: &workspaceId, Secret: &inviteID}).First(&inviteLink).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, e.New("404: Invite not found")
		}
		return nil, e.Wrap(err, "500: error querying for invite Link")
	}

	// Non-admin specific invites don't have a specific invitee. Only block if the invite is for a specific admin and the emails don't match.
	if inviteLink.InviteeEmail != nil {
		// check case-insensitively because email addresses are case-insensitive.
		if !strings.EqualFold(*inviteLink.InviteeEmail, *admin.Email) {
			return nil, e.New("403: This invite is not valid for the admin.")
		}
	}

	if r.IsInviteLinkExpired(inviteLink) {
		if err := r.DB.Delete(inviteLink).Error; err != nil {
			return nil, e.Wrap(err, "500: error while trying to delete expired invite link")
		}
		return nil, e.New("405: This invite link has expired.")
	}

	if err := r.DB.Model(workspace).Association("Admins").Append(admin); err != nil {
		return nil, e.Wrap(err, "500: error adding admin to association")
	}

	// Only delete the invite for specific-admin invites. Specific-admin invites are 1-time use only.
	// Non-admin specific invites are multi-use and only have an expiration date.
	if inviteLink.InviteeEmail != nil {
		if err := r.DB.Delete(inviteLink).Error; err != nil {
			return nil, e.Wrap(err, "500: error while trying to delete used invite link")
		}
	}
	return &admin.ID, nil
}

func (r *Resolver) DeleteAdminAssociation(ctx context.Context, obj interface{}, adminID int) (*int, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.New("error querying admin while deleting admin association")
	}
	if admin.ID == adminID {
		return nil, e.New("Admin tried deleting their own association")
	}

	if err := r.DB.Model(obj).Association("Admins").Delete(model.Admin{Model: model.Model{ID: adminID}}); err != nil {
		return nil, e.Wrap(err, "error deleting admin association")
	}

	return &adminID, nil
}

func (r *Resolver) isAdminInWorkspace(ctx context.Context, workspaceID int) (*model.Workspace, error) {
	if r.isWhitelistedAccount(ctx) {
		return r.GetWorkspace(workspaceID)
	}

	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving user")
	}

	workspace := model.Workspace{}
	if err := r.DB.Order("name asc").
		Where(&model.Workspace{Model: model.Model{ID: workspaceID}}).
		Model(&admin).Association("Workspaces").Find(&workspace); err != nil {
		return nil, e.Wrap(err, "error getting associated workspaces")
	}

	if workspaceID != workspace.ID {
		return nil, e.New("workspace is not associated to the current admin")
	}

	return &workspace, nil
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

func (r *Resolver) SetErrorFrequencies(errorGroups []*model.ErrorGroup, lookbackPeriod int) error {
	endDate := time.Now().UTC()
	startDate := endDate.AddDate(0, 0, -1*lookbackPeriod)
	startDateFormatted := startDate.Format("2006-01-02")

	aggQuery :=
		fmt.Sprintf(`{"bool": {
			"must": [
				{
					"terms": {
					"routing.keyword" : [%s]
				}},
				{
					"range": {
					"timestamp": {
						"gte": "%s"
					}
				}}
			]
		}}`,
			strings.Join(lo.Map(errorGroups, func(e *model.ErrorGroup, i int) string { return strconv.Itoa(e.ID) }), ","),
			startDateFormatted)
	aggOptions := opensearch.SearchOptions{
		MaxResults: pointy.Int(0),
		Aggregation: &opensearch.TermsAggregation{
			Field: "routing.keyword",
			SubAggregation: &opensearch.DateHistogramAggregation{
				Field:            "timestamp",
				CalendarInterval: "day",
				SortOrder:        "desc",
				Format:           "yyyy-MM-dd",
			},
		},
	}

	ignored := []struct{}{}
	_, aggResults, err := r.OpenSearch.Search([]opensearch.Index{opensearch.IndexErrorsCombined}, -1, aggQuery, aggOptions, &ignored)
	if err != nil {
		return err
	}

	errFreqs := map[int][]int64{}
	for _, ar1 := range aggResults {
		freqMap := map[string]int64{}
		for _, ar2 := range ar1.SubAggregationResults {
			freqMap[ar2.Key] = ar2.DocCount
		}

		freqs := []int64{}
		for curDate := startDate; !curDate.After(endDate); curDate = curDate.AddDate(0, 0, 1) {
			curDateFormatted := curDate.Format("2006-01-02")
			freq, ok := freqMap[curDateFormatted]
			if !ok {
				freq = 0
			}
			freqs = append(freqs, freq)
		}

		errorGroupId, err := strconv.Atoi(ar1.Key)
		if err != nil {
			return err
		}

		errFreqs[errorGroupId] = freqs
	}

	for _, eg := range errorGroups {
		eg.ErrorFrequency = errFreqs[eg.ID]
	}

	return nil
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
	if params.DeviceID != nil {
		modelParams.DeviceID = params.DeviceID
	}
	if params.ShowLiveSessions != nil {
		modelParams.ShowLiveSessions = *params.ShowLiveSessions
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
	modelParams.Environments = append(modelParams.Environments, params.Environments...)
	modelParams.AppVersions = append(modelParams.AppVersions, params.AppVersions...)
	modelParams.Query = params.Query
	return modelParams
}

func ErrorInputToParams(params *modelInputs.ErrorSearchParamsInput) *model.ErrorSearchParams {
	// Parse the inputType into the regular type.
	modelParams := &model.ErrorSearchParams{
		Browser:    params.Browser,
		OS:         params.Os,
		VisitedURL: params.VisitedURL,
		Event:      params.Event,
		Query:      params.Query,
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

func (r *Resolver) doesAdminOwnErrorGroup(ctx context.Context, errorGroupSecureID string, preloadFields bool) (eg *model.ErrorGroup, isOwner bool, err error) {
	errorGroup := &model.ErrorGroup{}

	var db = r.DB
	if preloadFields {
		db = r.DB.Preload("Fields")
	}
	if err := db.Where(&model.ErrorGroup{SecureID: errorGroupSecureID}).First(&errorGroup).Error; err != nil {
		return nil, false, e.Wrap(err, "error querying error group by secureID: "+errorGroupSecureID)
	}

	_, err = r.isAdminInProjectOrDemoProject(ctx, errorGroup.ProjectID)
	if err != nil {
		return errorGroup, false, e.Wrap(err, "error validating admin in project")
	}
	return errorGroup, true, nil
}

func (r *Resolver) canAdminViewErrorGroup(ctx context.Context, errorGroupSecureID string, preloadFields bool) (*model.ErrorGroup, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("canAdminViewErrorGroup"))
	defer authSpan.Finish()
	errorGroup, isOwner, err := r.doesAdminOwnErrorGroup(ctx, errorGroupSecureID, preloadFields)
	if err == nil && isOwner {
		return errorGroup, nil
	}
	if errorGroup != nil && errorGroup.IsPublic {
		return errorGroup, nil
	}
	return nil, err
}

func (r *Resolver) canAdminModifyErrorGroup(ctx context.Context, errorGroupSecureID string) (*model.ErrorGroup, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("canAdminModifyErrorGroup"))
	defer authSpan.Finish()
	errorGroup, isOwner, err := r.doesAdminOwnErrorGroup(ctx, errorGroupSecureID, false)
	if err == nil && isOwner {
		return errorGroup, nil
	}
	return nil, err
}

func (r *Resolver) _doesAdminOwnSession(ctx context.Context, session_secure_id string) (session *model.Session, ownsSession bool, err error) {
	session = &model.Session{}
	if err = r.DB.Where(&model.Session{SecureID: session_secure_id}).First(&session).Error; err != nil {
		return nil, false, e.Wrap(err, "error querying session by secure_id: "+session_secure_id)
	}

	_, err = r.isAdminInProjectOrDemoProject(ctx, session.ProjectID)
	if err != nil {
		return session, false, e.Wrap(err, "error validating admin in project")
	}
	return session, true, nil
}

func (r *Resolver) canAdminViewSession(ctx context.Context, session_secure_id string) (*model.Session, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("canAdminViewSession"))
	defer authSpan.Finish()
	session, isOwner, err := r._doesAdminOwnSession(ctx, session_secure_id)
	if err == nil && isOwner {
		return session, nil
	}
	if session != nil && *session.IsPublic {
		return session, nil
	}
	return nil, err
}

func (r *Resolver) canAdminModifySession(ctx context.Context, session_secure_id string) (*model.Session, error) {
	authSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal.auth", tracer.ResourceName("canAdminModifySession"))
	defer authSpan.Finish()
	session, isOwner, err := r._doesAdminOwnSession(ctx, session_secure_id)
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

func (r *Resolver) UpdateSessionsVisibility(workspaceID int, newPlan modelInputs.PlanType, originalPlan modelInputs.PlanType) {
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
		if err := r.DB.Model(&model.Session{}).
			Where("project_id in (SELECT id FROM projects WHERE workspace_id=?)", workspaceID).
			Where(&model.Session{WithinBillingQuota: &model.F}).
			Updates(model.Session{WithinBillingQuota: &model.T}).Error; err != nil {
			log.Error(e.Wrap(err, "error updating within_billing_quota on sessions upon plan upgrade"))
		}
	}
}

func (r *Resolver) SendEmailAlert(tos []*mail.Email, ccs []*mail.Email, authorName, viewLink, textForEmail, templateID string, sessionImage *string) error {
	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", Email.SendGridOutboundEmail)
	m.SetFrom(from)
	m.SetTemplateID(templateID)

	p := mail.NewPersonalization()
	p.AddTos(tos...)
	p.AddCCs(ccs...)
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

func (r *Resolver) CreateSlackBlocks(admin *model.Admin, viewLink, commentText, action string, subjectScope string) (blockSet slack.Blocks) {
	determiner := "a"
	if subjectScope == "error" {
		determiner = "an"
	}
	message := fmt.Sprintf("You were %s in %s %s comment.", action, determiner, subjectScope)
	if admin.Email != nil && *admin.Email != "" {
		message = fmt.Sprintf("%s %s you in %s %s comment.", *admin.Email, action, determiner, subjectScope)
	}
	if admin.Name != nil && *admin.Name != "" {
		message = fmt.Sprintf("%s %s you in %s %s comment.", *admin.Name, action, determiner, subjectScope)
	}
	blockSet.BlockSet = append(blockSet.BlockSet, slack.NewHeaderBlock(&slack.TextBlockObject{Type: slack.PlainTextType, Text: message}))

	button := slack.NewButtonBlockElement(
		"",
		"click",
		slack.NewTextBlockObject(
			slack.PlainTextType,
			"View Thread",
			false,
			false,
		),
	)
	button.URL = viewLink
	blockSet.BlockSet = append(blockSet.BlockSet,
		slack.NewSectionBlock(
			&slack.TextBlockObject{Type: slack.MarkdownType, Text: fmt.Sprintf("> %s", commentText)},
			nil, slack.NewAccessory(button),
		),
	)

	blockSet.BlockSet = append(blockSet.BlockSet, slack.NewDividerBlock())
	return
}

func (r *Resolver) SendSlackThreadReply(workspace *model.Workspace, admin *model.Admin, viewLink, commentText, action string, subjectScope string, threadIDs []int) error {
	if workspace.SlackAccessToken == nil {
		return nil
	}
	slackClient := slack.New(*workspace.SlackAccessToken)
	blocks := r.CreateSlackBlocks(admin, viewLink, commentText, action, subjectScope)
	for _, threadID := range threadIDs {
		thread := &model.CommentSlackThread{}
		if err := r.DB.Where(&model.CommentSlackThread{Model: model.Model{ID: threadID}}).First(&thread).Error; err != nil {
			return e.Wrap(err, "error querying slack thread")
		}
		opts := []slack.MsgOption{
			slack.MsgOptionBlocks(blocks.BlockSet...),
			slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
			slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any media that are in the Slack message.*/
			slack.MsgOptionTS(thread.ThreadTS),
		}
		_, _, err := slackClient.PostMessage(thread.SlackChannelID, opts...)
		if err != nil {
			log.Error(err)
		}
	}
	return nil
}

func (r *Resolver) SendSlackAlertToUser(workspace *model.Workspace, admin *model.Admin, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput, viewLink, commentText, action string, subjectScope string, base64Image *string, sessionCommentID *int, errorCommentID *int) error {
	// this is needed for posting DMs
	// if nil, user simply hasn't signed up for notifications, so return nil
	if workspace.SlackAccessToken == nil {
		return nil
	}
	slackClient := slack.New(*workspace.SlackAccessToken)

	blocks := r.CreateSlackBlocks(admin, viewLink, commentText, action, subjectScope)

	// Prepare to upload the screenshot to the user's Slack workspace.
	// We do this instead of upload it to S3 or somewhere else to defer authorization checks to Slack.
	// If we upload the image somewhere public, anyone with the link to the image will have access. The image could contain sensitive information.
	// By uploading to the user's Slack workspace, we limit the authorization of the image to only Slack members of the user's workspace.
	var uploadedFileKey string
	if base64Image != nil {
		// This key will be used as the file name for the file written to disk.
		// This needs to be unique. The uniqueness is guaranteed by the project ID, the admin who created the comment's ID, and the current time
		uploadedFileKey = fmt.Sprintf("slack-image-%d-%d-%d.png", workspace.ID, admin.ID, time.Now().UnixNano())

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
	}

	for _, slackUser := range taggedSlackUsers {
		if slackUser.WebhookChannelID != nil {
			_, _, _, err := slackClient.JoinConversation(*slackUser.WebhookChannelID)
			if err != nil {
				log.Warn(e.Wrap(err, "failed to join slack channel"))
			}
			opts := []slack.MsgOption{
				slack.MsgOptionBlocks(blocks.BlockSet...),
				slack.MsgOptionDisableLinkUnfurl(),  /** Disables showing a preview of any links that are in the Slack message.*/
				slack.MsgOptionDisableMediaUnfurl(), /** Disables showing a preview of any media that are in the Slack message.*/
			}
			_, respTs, err := slackClient.PostMessage(*slackUser.WebhookChannelID, opts...)

			if err != nil {
				log.Error(e.Wrap(err, "error posting slack message via slack bot"))
			} else {
				thread := &model.CommentSlackThread{
					SlackChannelID: *slackUser.WebhookChannelID,
					ThreadTS:       respTs,
				}
				if sessionCommentID != nil {
					thread.SessionCommentID = *sessionCommentID
				} else if errorCommentID != nil {
					thread.ErrorCommentID = *errorCommentID
				}
				r.DB.Create(thread)
			}
			if uploadedFileKey != "" {
				// We need to write the base64 image to disk, read the file, then upload it to Slack.
				// We can't send Slack a base64 string.
				fileUploadParams := slack.FileUploadParameters{
					Filetype: "image/png",
					Filename: fmt.Sprintf("Highlight %s Image.png", subjectScope),
					// These are the channels that will have access to the uploaded file.
					Channels: []string{*slackUser.WebhookChannelID},
					File:     uploadedFileKey,
					Title:    fmt.Sprintf("File from Highlight uploaded on behalf of %s", *admin.Name),
					// include the image in the initial comment's thread
					ThreadTimestamp: respTs,
				}
				_, err = slackClient.UploadFile(fileUploadParams)

				if err != nil {
					log.Error(e.Wrap(err, "failed to upload file to Slack"))
				}
			}
		}
	}
	if uploadedFileKey != "" {
		if err := os.Remove(uploadedFileKey); err != nil {
			log.Error(e.Wrap(err, "Failed to remove temporary session screenshot"))
		}
	}

	return nil
}

// GetSessionChunk Given a session and session-relative timestamp, finds the chunk and chunk-relative timestamp.
func (r *Resolver) GetSessionChunk(sessionID int, ts int) (chunkIdx int, chunkTs int) {
	chunkTs = ts
	var chunks []*model.EventChunk
	if err := r.DB.Order("chunk_index ASC").Model(&model.EventChunk{}).Where(&model.EventChunk{SessionID: sessionID}).
		Scan(&chunks).Error; err != nil {
		log.Error(e.Wrap(err, "error retrieving event chunks from DB"))
		return
	}
	if len(chunks) > 1 {
		t := chunks[0].Timestamp
		absTime := t + int64(ts)
		for i, chunk := range chunks[1:] {
			if chunk.Timestamp > absTime {
				break
			}
			chunkIdx = i + 1
			t = chunk.Timestamp
		}
		chunkTs = int(absTime - t)
	}
	return
}

func (r *Resolver) getSessionScreenshot(ctx context.Context, projectID int, sessionID int, ts int, chunk int) ([]byte, error) {
	res, err := r.LambdaClient.GetSessionScreenshot(ctx, projectID, sessionID, ts, chunk)
	if err != nil {
		return nil, e.Wrap(err, "failed to make screenshot render request")
	}
	if res.StatusCode != 200 {
		return nil, errors.New(fmt.Sprintf("screenshot render returned %d", res.StatusCode))
	}
	b, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, e.Wrap(err, "failed to read body of screenshot render response")
	}
	return b, nil
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

func (r *Resolver) SendAdminInviteImpl(adminName string, projectOrWorkspaceName string, inviteLink string, email string) (*string, error) {
	to := &mail.Email{Address: email}

	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", Email.SendGridOutboundEmail)
	m.SetFrom(from)
	m.SetTemplateID(Email.SendAdminInviteEmailTemplateID)

	p := mail.NewPersonalization()
	p.AddTos(to)
	p.SetDynamicTemplateData("Admin_Invitor", adminName)
	p.SetDynamicTemplateData("Organization_Name", projectOrWorkspaceName)
	p.SetDynamicTemplateData("Invite_Link", inviteLink)

	m.AddPersonalizations(p)
	if resp, sendGridErr := r.MailClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
		estr := "error sending sendgrid email -> "
		estr += fmt.Sprintf("resp-code: %v; ", resp)
		if sendGridErr != nil {
			estr += fmt.Sprintf("err: %v", sendGridErr.Error())
		}
		return nil, e.New(estr)
	}
	return &inviteLink, nil
}

func (r *Resolver) SendWorkspaceRequestEmail(fromName string, fromEmail string, workspaceName string, toName string, toEmail string, inviteLink string) (*string, error) {
	to := &mail.Email{Address: toEmail}

	m := mail.NewV3Mail()
	from := mail.NewEmail("Highlight", Email.SendGridOutboundEmail)
	m.SetFrom(from)
	m.SetTemplateID(Email.SendGridRequestAccessEmailTemplateID)

	p := mail.NewPersonalization()
	p.AddTos(to)
	p.SetDynamicTemplateData("Requester_Name", fromName)
	p.SetDynamicTemplateData("Requester_Email", fromEmail)
	p.SetDynamicTemplateData("Workspace_Admin", toName)
	p.SetDynamicTemplateData("Workspace_Name", workspaceName)
	p.SetDynamicTemplateData("Invite_Link", inviteLink)

	m.AddPersonalizations(p)
	if resp, sendGridErr := r.MailClient.Send(m); sendGridErr != nil || resp.StatusCode >= 300 {
		estr := "error sending sendgrid email -> "
		estr += fmt.Sprintf("resp-code: %v; ", resp)
		if sendGridErr != nil {
			estr += fmt.Sprintf("err: %v", sendGridErr.Error())
		}
		return nil, e.New(estr)
	}
	return &inviteLink, nil
}

func (r *Resolver) MarshalEnvironments(environments []*string) (*string, error) {
	envBytes, err := json.Marshal(environments)
	if err != nil {
		return nil, e.Wrap(err, "error parsing environments")
	}
	envString := string(envBytes)

	return &envString, nil
}

func (r *Resolver) MarshalSlackChannelsToSanitizedSlackChannels(slackChannels []*modelInputs.SanitizedSlackChannelInput) (*string, error) {
	sanitizedChannels := []*modelInputs.SanitizedSlackChannel{}
	// For each of the new slack channels, confirm that they exist in the "IntegratedSlackChannels" string.
	for _, ch := range slackChannels {
		sanitizedChannels = append(sanitizedChannels, &modelInputs.SanitizedSlackChannel{WebhookChannel: ch.WebhookChannelName, WebhookChannelID: ch.WebhookChannelID})
	}
	channelsBytes, err := json.Marshal(sanitizedChannels)
	if err != nil {
		return nil, e.Wrap(err, "error parsing channels")
	}
	channelsString := string(channelsBytes)

	return &channelsString, nil
}

func (r *Resolver) MarshalAlertEmails(emails []*string) (*string, error) {
	emailBytes, err := json.Marshal(emails)
	if err != nil {
		return nil, e.Wrap(err, "error parsing emails")
	}
	channelsString := string(emailBytes)

	return &channelsString, nil
}

func (r *Resolver) UnmarshalStackTrace(stackTraceString string) ([]*modelInputs.ErrorTrace, error) {
	var unmarshalled []*modelInputs.ErrorTrace
	if err := json.Unmarshal([]byte(stackTraceString), &unmarshalled); err != nil {
		// Stack trace may not be able to be unmarshalled as the format may differ
		// based on the error source. This should not be treated as an error.
		return nil, nil
	}

	// Keep only non-empty stack frames
	empty := modelInputs.ErrorTrace{}
	var ret []*modelInputs.ErrorTrace
	for _, frame := range unmarshalled {
		if frame != nil && *frame != empty {
			ret = append(ret, frame)
		}
	}

	return ret, nil
}

func (r *Resolver) validateAdminRole(ctx context.Context) error {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return e.Wrap(err, "error retrieving admin")
	}

	if admin.Role == nil || *admin.Role != model.AdminRole.ADMIN {
		return e.New("admin does not have role=ADMIN")
	}

	return nil
}

// GenerateRandomBytes returns securely generated random bytes.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	// Note that err == nil only if we read len(b) bytes.
	if err != nil {
		return nil, err
	}

	return b, nil
}

// GenerateRandomString returns a securely generated random string.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func GenerateRandomString(n int) (string, error) {
	const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-"
	ret := make([]byte, n)
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		ret[i] = letters[num.Int64()]
	}

	return string(ret), nil
}

// GenerateRandomStringURLSafe returns a URL-safe, base64 encoded
// securely generated random string.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func (r *Resolver) GenerateRandomStringURLSafe(n int) (string, error) {
	b, err := GenerateRandomBytes(n)
	return base64.URLEncoding.EncodeToString(b), err
}

func (r *Resolver) updateBillingDetails(stripeCustomerID string) error {
	customerParams := &stripe.CustomerParams{}
	customerParams.AddExpand("subscriptions")
	c, err := r.StripeClient.Customers.Get(stripeCustomerID, customerParams)
	if err != nil {
		return e.Wrapf(err, "STRIPE_INTEGRATION_ERROR error retrieving Stripe customer data for customer %s", stripeCustomerID)
	}

	subscriptions := c.Subscriptions.Data
	pricing.FillProducts(r.StripeClient, subscriptions)

	// Default to free tier
	tier := modelInputs.PlanTypeFree
	var billingPeriodStart *time.Time
	var billingPeriodEnd *time.Time
	var nextInvoiceDate *time.Time

	// Loop over each subscription item in each of the customer's subscriptions
	// and set the workspace's tier if the Stripe product has one
	for _, subscription := range subscriptions {
		for _, subscriptionItem := range subscription.Items.Data {
			if _, productTier, _ := pricing.GetProductMetadata(subscriptionItem.Price); productTier != nil {
				tier = *productTier
				startTimestamp := time.Unix(subscription.CurrentPeriodStart, 0)
				endTimestamp := time.Unix(subscription.CurrentPeriodEnd, 0)
				nextInvoiceTimestamp := time.Unix(subscription.NextPendingInvoiceItemInvoice, 0)

				billingPeriodStart = &startTimestamp
				billingPeriodEnd = &endTimestamp
				if subscription.NextPendingInvoiceItemInvoice != 0 {
					nextInvoiceDate = &nextInvoiceTimestamp
				}
			}
		}
	}

	workspace := model.Workspace{}
	if err := r.DB.Model(&model.Workspace{}).
		Where(model.Workspace{StripeCustomerID: &stripeCustomerID}).
		Find(&workspace).Error; err != nil {
		return e.Wrapf(err, "STRIPE_INTEGRATION_ERROR error retrieving workspace for customer %s", stripeCustomerID)
	}

	if err := r.DB.Model(&model.Workspace{}).
		Where(model.Workspace{Model: model.Model{ID: workspace.ID}}).
		Updates(map[string]interface{}{
			"PlanTier":           string(tier),
			"BillingPeriodStart": billingPeriodStart,
			"BillingPeriodEnd":   billingPeriodEnd,
			"NextInvoiceDate":    nextInvoiceDate,
			"AllowMeterOverage":  tier != modelInputs.PlanTypeFree,
		}).Error; err != nil {
		return e.Wrapf(err, "STRIPE_INTEGRATION_ERROR error updating workspace fields for customer %s", stripeCustomerID)
	}

	// Plan has been updated, report the latest usage data to Stripe
	if err := pricing.ReportUsageForWorkspace(r.DB, r.StripeClient, workspace.ID); err != nil {
		return e.Wrap(err, "STRIPE_INTEGRATION_ERROR error reporting usage after updating details")
	}

	// mark sessions as within billing quota on plan upgrade
	// this code is repeated as the first time, the user already has a billing plan and the function returns early.
	// here, the user doesn't already have a billing plan, so it's considered an upgrade unless the plan is free
	r.PrivateWorkerPool.SubmitRecover(func() {
		r.UpdateSessionsVisibility(workspace.ID, tier, modelInputs.PlanTypeFree)
	})

	return nil
}

func getWorkspaceIdFromUrl(parsedUrl *url.URL) (int, error) {
	pathParts := strings.Split(parsedUrl.Path, "/")
	if len(pathParts) < 2 {
		return -1, e.New("invalid url")
	}
	workspaceId, err := strconv.Atoi(pathParts[1])
	if err != nil {
		return -1, e.Wrap(err, "couldn't parse out workspace id")
	}

	return workspaceId, nil
}

func getIdForPageFromUrl(parsedUrl *url.URL, page string) (string, error) {
	pathParts := strings.Split(parsedUrl.Path, "/")
	if len(pathParts) < 4 {
		return "", e.New("invalid url")
	}
	if pathParts[2] != page || len(pathParts[3]) <= 0 {
		return "", e.New(fmt.Sprintf("url isn't for %s pages", page))
	}

	return pathParts[3], nil
}

func (r *Resolver) SlackEventsWebhook(signingSecret string) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		body, err := ioutil.ReadAll(req.Body)
		if err != nil {
			log.Error(e.Wrap(err, "couldn't read request body"))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// verify request is from slack
		sv, err := slack.NewSecretsVerifier(req.Header, signingSecret)
		if err != nil {
			log.Error(e.Wrap(err, "error verifying request headers"))
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		if _, err := sv.Write(body); err != nil {
			log.Error(e.Wrap(err, "error when verifying request"))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if err := sv.Ensure(); err != nil {
			log.Error(e.Wrap(err, "couldn't verify that request is from slack with the signing secret"))
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		// parse events payload
		eventsAPIEvent, err := slackevents.ParseEvent(json.RawMessage(body), slackevents.OptionNoVerifyToken())
		if err != nil {
			log.Error(e.Wrap(err, "error parsing body as a slack event"))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if eventsAPIEvent.Type == slackevents.URLVerification {
			var r *slackevents.ChallengeResponse
			err := json.Unmarshal([]byte(body), &r)
			if err != nil {
				log.Error(e.Wrap(err, "error parsing body as a slack challenge body"))
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "text")
			if _, err := w.Write([]byte(r.Challenge)); err != nil {
				log.Error(e.Wrap(err, "couldn't respond to slack challenge request"))
				return
			}
		}

		log.Infof("Slack event received with event type: %s", eventsAPIEvent.InnerEvent.Type)

		if eventsAPIEvent.InnerEvent.Type == slackevents.LinkShared {
			go (func() {
				defer util.Recover()
				ev := eventsAPIEvent.InnerEvent.Data.(*slackevents.LinkSharedEvent)

				workspaceIdToSlackTeamMap := map[int]*slack.TeamInfo{}
				workspaceIdToWorkspaceMap := map[int]*model.Workspace{}
				urlToSlackAttachment := map[string]slack.Attachment{}
				var senderSlackClient *slack.Client

				for _, link := range ev.Links {
					u, err := url.Parse(link.URL)
					if err != nil {
						log.Error(e.Wrap(err, "couldn't parse url to unfurl"))
						continue
					}

					workspaceId, err := getWorkspaceIdFromUrl(u)
					if err != nil {
						log.Error(err)
						continue
					}

					if workspaceIdToWorkspaceMap[workspaceId] == nil {
						ws, err := r.GetWorkspace(workspaceId)
						if err != nil {
							log.Error(e.Wrapf(err, "couldn't get workspace with workspace ID: %d (unfurl url: %s)", workspaceId, link))
							continue
						}
						workspaceIdToWorkspaceMap[workspaceId] = ws
					}

					workspace := workspaceIdToWorkspaceMap[workspaceId]

					slackAccessToken := workspace.SlackAccessToken

					if slackAccessToken == nil || len(*slackAccessToken) <= 0 {
						log.Error(fmt.Errorf("workspace doesn't have a slack access token (unfurl url: %s)", link))
						continue
					}

					slackClient := slack.New(*slackAccessToken)

					if workspaceIdToSlackTeamMap[workspaceId] == nil {
						teamInfo, err := slackClient.GetTeamInfo()
						if err != nil {
							log.Error(e.Wrapf(err, "couldn't get slack team information (unfurl url: %s)", link))
							continue
						}

						workspaceIdToSlackTeamMap[workspaceId] = teamInfo
					}

					if workspaceIdToSlackTeamMap[workspaceId].ID != eventsAPIEvent.TeamID {
						log.Error(fmt.Errorf(
							"slack workspace is not authorized to view this highlight workspace (\"%s\" != \"%s\", unfurl url: %s)",
							workspaceIdToSlackTeamMap[workspaceId].ID, eventsAPIEvent.TeamID, link,
						))
						continue
					} else {
						senderSlackClient = slackClient
					}

					if sessionId, err := getIdForPageFromUrl(u, "sessions"); err == nil {
						session := model.Session{SecureID: sessionId}
						if err := r.DB.Where(&session).First(&session).Error; err != nil {
							log.Error(e.Wrapf(err, "couldn't get session (unfurl url: %s)", link))
							continue
						}

						attachment := slack.Attachment{}
						err = session.GetSlackAttachment(&attachment)
						if err != nil {
							log.Error(e.Wrapf(err, "couldn't get session slack attachment (unfurl url: %s)", link))
							continue
						}
						urlToSlackAttachment[link.URL] = attachment
					} else if errorId, err := getIdForPageFromUrl(u, "errors"); err == nil {
						errorGroup := model.ErrorGroup{SecureID: errorId}
						if err := r.DB.Where(&errorGroup).First(&errorGroup).Error; err != nil {
							log.Error(e.Wrapf(err, "couldn't get ErrorGroup (unfurl url: %s)", link))
							continue
						}

						attachment := slack.Attachment{}
						err = errorGroup.GetSlackAttachment(&attachment)
						if err != nil {
							log.Error(e.Wrapf(err, "couldn't get ErrorGroup slack attachment (unfurl url: %s)", link))
							continue
						}
						urlToSlackAttachment[link.URL] = attachment
					}

				}

				if len(urlToSlackAttachment) <= 0 {
					return
				}

				_, _, _, err := senderSlackClient.UnfurlMessage(ev.Channel, string(ev.MessageTimeStamp), urlToSlackAttachment)
				if err != nil {
					log.Error(e.Wrapf(err, "failed to send slack unfurl request"))
					return
				}
			})()
		}
	}
}

func (r *Resolver) StripeWebhook(endpointSecret string) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		const MaxBodyBytes = int64(65536)
		req.Body = http.MaxBytesReader(w, req.Body, MaxBodyBytes)
		payload, err := ioutil.ReadAll(req.Body)
		if err != nil {
			log.Error(e.Wrap(err, "error reading request body"))
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}

		event, err := webhook.ConstructEvent(payload, req.Header.Get("Stripe-Signature"),
			endpointSecret)
		if err != nil {
			log.Error(e.Wrap(err, "error verifying webhook signature"))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if err := json.Unmarshal(payload, &event); err != nil {
			log.Error(e.Wrap(err, "failed to parse webhook body json"))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		log.Infof("Stripe webhook received event type: %s", event.Type)

		switch event.Type {
		case "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted":
			var subscription stripe.Subscription
			err := json.Unmarshal(event.Data.Raw, &subscription)
			if err != nil {
				log.Error(e.Wrap(err, "failed to parse webhook body json as Subscription"))
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			if err := r.updateBillingDetails(subscription.Customer.ID); err != nil {
				log.Error(e.Wrap(err, "failed to update billing details"))
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusOK)
	}
}

func (r *Resolver) CreateInviteLink(workspaceID int, email *string, role string, shouldExpire bool) *model.WorkspaceInviteLink {
	// Unit is days.
	EXPIRATION_DATE := 30
	expirationDate := time.Now().UTC().AddDate(0, 0, EXPIRATION_DATE)

	secret, _ := r.GenerateRandomStringURLSafe(16)

	newInviteLink := &model.WorkspaceInviteLink{
		WorkspaceID:    &workspaceID,
		InviteeEmail:   email,
		InviteeRole:    &role,
		ExpirationDate: &expirationDate,
		Secret:         &secret,
	}

	if !shouldExpire {
		newInviteLink.ExpirationDate = nil
	}

	return newInviteLink
}

func (r *Resolver) AddSlackToWorkspace(workspace *model.Workspace, code string) error {
	var (
		SLACK_CLIENT_ID     string
		SLACK_CLIENT_SECRET string
	)

	if tempSlackClientID, ok := os.LookupEnv("SLACK_CLIENT_ID"); ok && tempSlackClientID != "" {
		SLACK_CLIENT_ID = tempSlackClientID
	}
	if tempSlackClientSecret, ok := os.LookupEnv("SLACK_CLIENT_SECRET"); ok && tempSlackClientSecret != "" {
		SLACK_CLIENT_SECRET = tempSlackClientSecret
	}

	redirect := os.Getenv("FRONTEND_URI") + "/callback/slack"

	resp, err := slack.
		GetOAuthV2Response(
			&http.Client{},
			SLACK_CLIENT_ID,
			SLACK_CLIENT_SECRET,
			code,
			redirect,
		)

	if err != nil {
		return e.Wrap(err, "error getting slack oauth response")
	}

	if err := r.DB.Where(&workspace).Updates(&model.Workspace{SlackAccessToken: &resp.AccessToken}).Error; err != nil {
		return e.Wrap(err, "error updating slack access token in workspace")
	}

	existingChannels, _, _ := r.GetSlackChannelsFromSlack(workspace.ID)
	channelBytes, err := json.Marshal(existingChannels)
	if err != nil {
		return e.Wrap(err, "error marshaling existing channels")
	}

	channelString := string(channelBytes)
	if err := r.DB.Model(&workspace).Updates(&model.Workspace{
		SlackChannels: &channelString,
	}).Error; err != nil {
		return e.Wrap(err, "error updating project fields")
	}

	return nil
}

func (r *Resolver) RemoveSlackFromWorkspace(workspace *model.Workspace, projectID int) error {
	if err := r.DB.Transaction(func(tx *gorm.DB) error {
		// remove slack integration from workspace
		if err := tx.Where(&workspace).Select("slack_access_token", "slack_channels").Updates(&model.Workspace{SlackAccessToken: nil, SlackChannels: nil}).Error; err != nil {
			return e.Wrap(err, "error removing slack access token and channels in workspace")
		}

		empty := "[]"
		projectAlert := model.Alert{ProjectID: projectID}
		clearedChannelsAlert := model.Alert{ChannelsToNotify: &empty}

		// set existing alerts to have empty slack channels to notify
		if err := tx.Where(&model.SessionAlert{Alert: projectAlert}).Updates(model.SessionAlert{Alert: clearedChannelsAlert}).Error; err != nil {
			return e.Wrap(err, "error removing slack channels from created SessionAlert's")
		}

		if err := tx.Where(&model.ErrorAlert{Alert: projectAlert}).Updates(model.ErrorAlert{Alert: clearedChannelsAlert}).Error; err != nil {
			return e.Wrap(err, "error removing slack channels from created ErrorAlert's")
		}

		// set existing metric monitors to have empty slack channels to notify
		if err := tx.Where(&model.MetricMonitor{ProjectID: projectID}).Updates(model.MetricMonitor{ChannelsToNotify: &empty}).Error; err != nil {
			return e.Wrap(err, "error removing slack channels from created MetricMonitor's")
		}

		// no errors updating DB
		return nil
	}); err != nil {
		return err
	}

	return nil
}

func (r *Resolver) RemoveZapierFromWorkspace(project *model.Project) error {
	if err := r.DB.Where(&project).Select("zapier_access_token").Updates(&model.Project{ZapierAccessToken: nil}).Error; err != nil {
		return e.Wrap(err, "error removing zapier access token in project model")
	}

	return nil
}

func (r *Resolver) AddLinearToWorkspace(workspace *model.Workspace, code string) error {
	var (
		LINEAR_CLIENT_ID     string
		LINEAR_CLIENT_SECRET string
	)

	if tempLinearClientID, ok := os.LookupEnv("LINEAR_CLIENT_ID"); ok && tempLinearClientID != "" {
		LINEAR_CLIENT_ID = tempLinearClientID
	}
	if tempLinearClientSecret, ok := os.LookupEnv("LINEAR_CLIENT_SECRET"); ok && tempLinearClientSecret != "" {
		LINEAR_CLIENT_SECRET = tempLinearClientSecret
	}

	redirect := os.Getenv("FRONTEND_URI") + "/callback/linear"

	res, err := r.GetLinearAccessToken(code, redirect, LINEAR_CLIENT_ID, LINEAR_CLIENT_SECRET)
	if err != nil {
		return e.Wrap(err, "error getting linear oauth access token")
	}

	if err := r.DB.Where(&workspace).Updates(&model.Workspace{LinearAccessToken: &res.AccessToken}).Error; err != nil {
		return e.Wrap(err, "error updating slack access token in workspace")
	}

	return nil
}

func (r *Resolver) RemoveLinearFromWorkspace(workspace *model.Workspace) error {
	if err := r.RevokeLinearAccessToken(*workspace.LinearAccessToken); err != nil {
		return err
	}

	if err := r.DB.Where(&workspace).Select("linear_access_token").Updates(&model.Workspace{LinearAccessToken: nil}).Error; err != nil {
		return e.Wrap(err, "error removing linear access token in workspace")
	}

	return nil
}

func (r *Resolver) MakeLinearGraphQLRequest(accessToken string, body string) ([]byte, error) {
	client := &http.Client{}

	req, err := http.NewRequest("POST", "https://api.linear.app/graphql", strings.NewReader(body))
	if err != nil {
		return nil, e.Wrap(err, "error creating api request to linear")
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	req.Header.Set("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		return nil, e.Wrap(err, "error getting response from linear graphql endpoint")
	}

	b, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, e.Wrap(err, "error reading response body from linear graphql endpoint")
	}

	if res.StatusCode != 200 {
		return nil, e.New("linear graphql API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	return b, nil
}

type LinearTeam struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Key  string `json:"key"`
}
type LinearTeamsResponse struct {
	Data struct {
		Teams struct {
			Nodes []LinearTeam `json:"nodes"`
		} `json:"teams"`
	} `json:"data"`
}

func (r *Resolver) GetLinearTeams(accessToken string) (*LinearTeamsResponse, error) {
	requestQuery := `
	query {
		teams {
			nodes {
				id
				name
				key
			}
		}
	}
	`

	type GraphQLReq struct {
		Query string `json:"query"`
	}

	req := GraphQLReq{Query: requestQuery}
	requestBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	b, err := r.MakeLinearGraphQLRequest(accessToken, string(requestBytes))
	if err != nil {
		return nil, err
	}

	teamsResponse := &LinearTeamsResponse{}

	err = json.Unmarshal(b, teamsResponse)
	if err != nil {
		return nil, e.Wrap(err, "error unmarshaling linear oauth token response")
	}

	return teamsResponse, nil
}

type LinearCreateIssueResponse struct {
	Data struct {
		IssueCreate struct {
			Issue struct {
				ID         string `json:"id"`
				Identifier string `json:"identifier"`
			} `json:"issue"`
		} `json:"issueCreate"`
	} `json:"data"`
}

func (r *Resolver) CreateLinearIssue(accessToken string, teamID string, title string, description string) (*LinearCreateIssueResponse, error) {
	requestQuery := `
	mutation createIssue($teamId: String!, $title: String!, $desc: String!) {
		issueCreate(input: {teamId: $teamId, title: $title, description: $desc}) {
			issue {
				id,
				identifier
			}
		}
	}
	`

	type GraphQLVars struct {
		TeamID string `json:"teamId"`
		Title  string `json:"title"`
		Desc   string `json:"desc"`
	}

	type GraphQLReq struct {
		Query     string      `json:"query"`
		Variables GraphQLVars `json:"variables"`
	}

	req := GraphQLReq{Query: requestQuery, Variables: GraphQLVars{TeamID: teamID, Title: title, Desc: description}}

	requestBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	b, err := r.MakeLinearGraphQLRequest(accessToken, string(requestBytes))
	if err != nil {
		return nil, err
	}

	createIssueRes := &LinearCreateIssueResponse{}

	err = json.Unmarshal(b, createIssueRes)
	if err != nil {
		return nil, e.Wrap(err, "error unmarshaling linear oauth token response")
	}

	return createIssueRes, nil
}

type LinearCreateAttachmentResponse struct {
	Data struct {
		AttachmentCreate struct {
			Attachment struct {
				ID string `json:"id"`
			} `json:"Attachment"`
			Success bool `json:"success"`
		} `json:"attachmentCreate"`
	} `json:"data"`
}

func (r *Resolver) CreateLinearAttachment(accessToken string, issueID string, title string, subtitle string, url string) (*LinearCreateAttachmentResponse, error) {
	requestQuery := `
	mutation createAttachment($issueId: String!, $url: String!, $iconUrl: String!, $title: String!, $subtitle: String) {
		attachmentCreate(input: {issueId: $issueId, url: $url, iconUrl: $iconUrl, title: $title, subtitle: $subtitle}) {
		  attachment {
			id
		  }
		  success
		}
	  }	  
	`

	type GraphQLVars struct {
		IssueID  string `json:"issueId"`
		Title    string `json:"title"`
		Subtitle string `json:"subtitle"`
		Url      string `json:"url"`
		IconUrl  string `json:"iconUrl"`
	}

	type GraphQLReq struct {
		Query     string      `json:"query"`
		Variables GraphQLVars `json:"variables"`
	}

	req := GraphQLReq{Query: requestQuery, Variables: GraphQLVars{IssueID: issueID, Title: title, Subtitle: subtitle, Url: url, IconUrl: "https://app.highlight.run/logo_with_gradient_bg.png"}}

	requestBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	b, err := r.MakeLinearGraphQLRequest(accessToken, string(requestBytes))
	if err != nil {
		return nil, err
	}

	createAttachmentRes := &LinearCreateAttachmentResponse{}

	err = json.Unmarshal(b, createAttachmentRes)
	if err != nil {
		return nil, e.Wrap(err, "error unmarshaling linear oauth token response")
	}

	return createAttachmentRes, nil
}

func (r *Resolver) CreateLinearIssueAndAttachment(workspace *model.Workspace, attachment *model.ExternalAttachment, issueTitle string, issueDescription string, commentText string, authorName string, viewLink string, teamId *string) error {
	if teamId == nil {
		teamRes, err := r.GetLinearTeams(*workspace.LinearAccessToken)
		if err != nil {
			return err
		}

		if len(teamRes.Data.Teams.Nodes) <= 0 {
			return e.New("no teams to make a linear issue to")
		}

		teamId = &teamRes.Data.Teams.Nodes[0].ID
	}

	issueRes, err := r.CreateLinearIssue(*workspace.LinearAccessToken, *teamId, issueTitle, issueDescription)
	if err != nil {
		return err
	}

	attachmentRes, err := r.CreateLinearAttachment(*workspace.LinearAccessToken, issueRes.Data.IssueCreate.Issue.ID, commentText, authorName, viewLink)
	if err != nil {
		return err
	}

	attachment.ExternalID = attachmentRes.Data.AttachmentCreate.Attachment.ID
	attachment.Title = issueRes.Data.IssueCreate.Issue.Identifier

	if err := r.DB.Create(attachment).Error; err != nil {
		return e.Wrap(err, "error creating external attachment")
	}
	return nil
}

type LinearAccessTokenResponse struct {
	AccessToken string   `json:"access_token"`
	TokenType   string   `json:"token_type"`
	ExpiresIn   int64    `json:"expires_in"`
	Scope       []string `json:"scope"`
}

func (r *Resolver) GetLinearAccessToken(code string, redirectURL string, clientID string, clientSecret string) (LinearAccessTokenResponse, error) {
	client := &http.Client{}

	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)
	data.Set("grant_type", "authorization_code")
	data.Set("redirect_uri", redirectURL)

	accessTokenResponse := LinearAccessTokenResponse{}

	req, err := http.NewRequest("POST", "https://api.linear.app/oauth/token", strings.NewReader(data.Encode()))
	if err != nil {
		return accessTokenResponse, e.Wrap(err, "error creating api request to linear")
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	res, err := client.Do(req)

	if err != nil {
		return accessTokenResponse, e.Wrap(err, "error getting response from linear oauth token endpoint")
	}

	b, err := ioutil.ReadAll(res.Body)

	if res.StatusCode != 200 {
		return accessTokenResponse, e.New("linear API responded with error; status_code=" + res.Status + "; body=" + string(b))
	}

	if err != nil {
		return accessTokenResponse, e.Wrap(err, "error reading response body from linear oauth token endpoint")
	}
	err = json.Unmarshal(b, &accessTokenResponse)
	if err != nil {
		return accessTokenResponse, e.Wrap(err, "error unmarshaling linear oauth token response")
	}

	return accessTokenResponse, nil
}

func (r *Resolver) RevokeLinearAccessToken(accessToken string) error {
	client := &http.Client{}

	data := url.Values{}
	data.Set("access_token", accessToken)

	req, err := http.NewRequest("POST", "https://api.linear.app/oauth/revoke", strings.NewReader(data.Encode()))
	if err != nil {
		return e.Wrap(err, "error creating api request to linear")
	}

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	res, err := client.Do(req)
	if err != nil {
		return e.Wrap(err, "error getting response from linear revoke oauth token endpoint")
	}

	if res.StatusCode != 200 {
		return e.New("linear API responded with error; status_code=" + res.Status)
	}

	return nil
}

func (r *Resolver) getCommentFollowers(ctx context.Context, followers []*model.CommentFollower) (existingAdmins []int, existingSlackChannelIDs []string) {
	for _, f := range followers {
		if f.AdminId > 0 {
			existingAdmins = append(existingAdmins, f.AdminId)
		} else if len(f.SlackChannelID) > 0 {
			existingSlackChannelIDs = append(existingSlackChannelIDs, f.SlackChannelID)
		}
	}
	return
}

func (r *Resolver) findNewFollowers(taggedAdmins []*modelInputs.SanitizedAdminInput, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput, existingAdminIDs []int, existingSlackChannelIDs []string) (newFollowers []*model.CommentFollower) {
	for _, a := range taggedAdmins {
		exists := false
		for _, id := range existingAdminIDs {
			if id == a.ID {
				exists = true
				break
			}
		}
		if a.ID > 0 && !exists {
			newCommentFollow := model.CommentFollower{
				AdminId: a.ID,
			}
			newFollowers = append(newFollowers, &newCommentFollow)
		}
	}
	for _, s := range taggedSlackUsers {
		exists := false
		for _, id := range existingSlackChannelIDs {
			if id == *s.WebhookChannelID {
				exists = true
				break
			}
		}
		if len(*s.WebhookChannelID) > 0 && !exists {
			newCommentFollow := model.CommentFollower{
				SlackChannelName: *s.WebhookChannelName,
				SlackChannelID:   *s.WebhookChannelID,
			}
			newFollowers = append(newFollowers, &newCommentFollow)
		}
	}
	return
}

func (r *Resolver) sendFollowedCommentNotification(ctx context.Context, admin *model.Admin, followers []*model.CommentFollower, workspace *model.Workspace, projectID int, threadIDs []int, textForEmail string, viewLink string, sessionImage *string, action string, subjectScope string) {
	var tos []*mail.Email
	var ccs []*mail.Email
	if admin.Email != nil {
		ccs = append(ccs, &mail.Email{Name: *admin.Name, Address: *admin.Email})
	}

	for _, f := range followers {
		// don't notify if the follower email is the reply author
		if f.AdminId == admin.ID {
			continue
		}
		// don't notify if the follower slack user is the reply author
		found := false
		for _, namePart := range strings.Split(*admin.Name, " ") {
			if strings.Contains(strings.ToLower(f.SlackChannelName), strings.ToLower(namePart)) {
				found = true
				break
			}
		}
		if found {
			continue
		}
		if f.AdminId > 0 {
			a := &model.Admin{}
			if err := r.DB.Where(&model.Admin{Model: model.Model{ID: f.AdminId}}).First(&a).Error; err != nil {
				log.Error(err, "Error finding follower admin object")
				continue
			}
			tos = append(tos, &mail.Email{Name: *admin.Name, Address: *a.Email})
		}
	}

	if len(threadIDs) > 0 {
		r.PrivateWorkerPool.SubmitRecover(func() {
			commentMentionSlackSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.sendFollowedCommentNotification",
				tracer.ResourceName("slackBot.sendCommentFollowerUpdate"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(followers)), tracer.Tag("subjectScope", subjectScope))
			defer commentMentionSlackSpan.Finish()

			err := r.SendSlackThreadReply(workspace, admin, viewLink, textForEmail, action, subjectScope, threadIDs)
			if err != nil {
				log.Error(e.Wrap(err, "error notifying tagged admins in comment for slack bot"))
			}
		})
	}

	if len(tos) > 0 {
		r.PrivateWorkerPool.SubmitRecover(func() {
			commentMentionEmailSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.sendFollowedCommentNotification",
				tracer.ResourceName("sendgrid.sendFollowerEmail"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(followers)), tracer.Tag("action", action), tracer.Tag("subjectScope", subjectScope))
			defer commentMentionEmailSpan.Finish()

			err := r.SendEmailAlert(tos, ccs, *admin.Name, viewLink, textForEmail, Email.SendGridSessionCommentEmailTemplateID, sessionImage)
			if err != nil {
				log.Error(e.Wrap(err, "error notifying tagged admins in comment"))
			}
		})
	}
}

func (r *Resolver) sendCommentMentionNotification(ctx context.Context, admin *model.Admin, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput, workspace *model.Workspace, projectID int, sessionCommentID *int, errorCommentID *int, textForEmail string, viewLink string, sessionImage *string, action string, subjectScope string) {
	r.PrivateWorkerPool.SubmitRecover(func() {
		commentMentionSlackSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.sendCommentMentionNotification",
			tracer.ResourceName("slackBot.sendCommentMention"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(taggedSlackUsers)), tracer.Tag("subjectScope", subjectScope))
		defer commentMentionSlackSpan.Finish()

		err := r.SendSlackAlertToUser(workspace, admin, taggedSlackUsers, viewLink, textForEmail, action, subjectScope, sessionImage, sessionCommentID, errorCommentID)
		if err != nil {
			log.Error(e.Wrap(err, "error notifying tagged admins in comment for slack bot"))
		}
	})
}

func (r *Resolver) sendCommentPrimaryNotification(ctx context.Context, admin *model.Admin, authorName string, taggedAdmins []*modelInputs.SanitizedAdminInput, workspace *model.Workspace, projectID int, sessionCommentID *int, errorCommentID *int, textForEmail string, viewLink string, sessionImage *string, action string, subjectScope string) {
	var tos []*mail.Email
	var ccs []*mail.Email
	var adminIds []int

	if admin.Email != nil {
		ccs = append(ccs, &mail.Email{Address: *admin.Email})
	}
	for _, admin := range taggedAdmins {
		tos = append(tos, &mail.Email{Address: admin.Email})
		adminIds = append(adminIds, admin.ID)
	}

	r.PrivateWorkerPool.SubmitRecover(func() {
		commentMentionEmailSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.sendCommentPrimaryNotification",
			tracer.ResourceName("sendgrid.sendCommentMention"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(taggedAdmins)), tracer.Tag("action", action), tracer.Tag("subjectScope", subjectScope))
		defer commentMentionEmailSpan.Finish()

		err := r.SendEmailAlert(tos, ccs, authorName, viewLink, textForEmail, Email.SendGridSessionCommentEmailTemplateID, sessionImage)
		if err != nil {
			log.Error(e.Wrap(err, "error notifying tagged admins in comment"))
		}
	})

	r.PrivateWorkerPool.SubmitRecover(func() {
		commentMentionSlackSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.sendCommentPrimaryNotification",
			tracer.ResourceName("slack.sendCommentMention"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(adminIds)), tracer.Tag("action", action), tracer.Tag("subjectScope", subjectScope))
		defer commentMentionSlackSpan.Finish()

		var admins []*model.Admin
		if err := r.DB.Find(&admins, adminIds).Where("slack_im_channel_id IS NOT NULL").Error; err != nil {
			log.Error(e.Wrap(err, "error fetching admins"))
		}
		// return early if no admins w/ slack_im_channel_id
		if len(admins) < 1 {
			return
		}
		var taggedAdminSlacks []*modelInputs.SanitizedSlackChannelInput
		for _, a := range admins {
			taggedAdminSlacks = append(taggedAdminSlacks, &modelInputs.SanitizedSlackChannelInput{
				WebhookChannelID: a.SlackIMChannelID,
			})
		}

		err := r.SendSlackAlertToUser(workspace, admin, taggedAdminSlacks, viewLink, textForEmail, action, subjectScope, nil, sessionCommentID, errorCommentID)
		if err != nil {
			log.Error(e.Wrap(err, "error notifying tagged admins in comment"))
		}
	})

}

func (r *Resolver) IsInviteLinkExpired(inviteLink *model.WorkspaceInviteLink) bool {
	if inviteLink == nil {
		return true
	}
	// Links without an ExpirationDate never expire.
	if inviteLink.ExpirationDate == nil {
		return false
	}
	return time.Now().UTC().After(*inviteLink.ExpirationDate)
}

func (r *Resolver) isBrotliAccepted(ctx context.Context) bool {
	acceptEncodingString := ctx.Value(model.ContextKeys.AcceptEncoding).(string)
	return strings.Contains(acceptEncodingString, "br")
}

func (r *Resolver) getEvents(ctx context.Context, s *model.Session, cursor EventsCursor) ([]interface{}, error, *EventsCursor) {
	if en := s.ObjectStorageEnabled; en != nil && *en {
		objectStorageSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
			tracer.ResourceName("db.objectStorageQuery"), tracer.Tag("project_id", s.ProjectID))
		defer objectStorageSpan.Finish()
		ret, err := r.StorageClient.ReadSessionsFromS3(s.ID, s.ProjectID)
		if err != nil {
			return nil, err, nil
		}
		return ret[cursor.EventIndex:], nil, &EventsCursor{EventIndex: len(ret), EventObjectIndex: nil}
	}
	eventsQuerySpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.eventsObjectsQuery"), tracer.Tag("project_id", s.ProjectID))
	eventObjs := []*model.EventsObject{}
	offset := 0
	if cursor.EventObjectIndex != nil {
		offset = *cursor.EventObjectIndex
	}
	if err := r.DB.Table("events_objects_partitioned").Order("created_at asc").Where(&model.EventsObject{SessionID: s.ID, IsBeacon: false}).Offset(offset).Find(&eventObjs).Error; err != nil {
		return nil, e.Wrap(err, "error reading from events"), nil
	}
	eventsQuerySpan.Finish()
	eventsParseSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("parse.eventsObjects"), tracer.Tag("project_id", s.ProjectID))
	allEvents := make([]interface{}, 0)
	for _, eventObj := range eventObjs {
		subEvents := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(eventObj.Events), &subEvents); err != nil {
			return nil, e.Wrap(err, "error decoding event data"), nil
		}
		allEvents = append(allEvents, subEvents["events"]...)
	}
	events := allEvents
	if cursor.EventObjectIndex == nil {
		events = allEvents[cursor.EventIndex:]
	}
	nextCursor := EventsCursor{EventIndex: cursor.EventIndex + len(events), EventObjectIndex: pointy.Int(offset + len(eventObjs))}
	eventsParseSpan.Finish()
	return events, nil, &nextCursor
}

func (r *Resolver) GetSlackChannelsFromSlack(workspaceId int) (*[]model.SlackChannel, int, error) {
	workspace, _ := r.GetWorkspace(workspaceId)

	slackClient := slack.New(*workspace.SlackAccessToken)
	filteredNewChannels := []model.SlackChannel{}
	existingChannels, _ := workspace.IntegratedSlackChannels()

	getConversationsParam := slack.GetConversationsParameters{
		Limit: 1000,
		// public_channel is for public channels in the Slack workspace
		// im is for all individuals in the Slack workspace
		Types: []string{"public_channel", "im"},
	}
	allSlackChannelsFromAPI := []slack.Channel{}

	// Slack paginates the channels/people listing.
	for {
		channels, cursor, err := slackClient.GetConversations(&getConversationsParam)
		if err != nil {
			return &filteredNewChannels, 0, e.Wrap(err, "error getting Slack channels from Slack.")
		}

		allSlackChannelsFromAPI = append(allSlackChannelsFromAPI, channels...)

		if cursor == "" {
			break
		}

	}

	// We need to get the users in the Slack channel in order to get their name.
	// The conversations endpoint only returns the user's ID, we'll use the response from `GetUsers` to get the name.
	users, err := slackClient.GetUsers()
	if err != nil {
		log.Error(e.Wrap(err, "failed to get users"))
	}

	newChannels := []model.SlackChannel{}
	for _, channel := range allSlackChannelsFromAPI {
		newChannel := model.SlackChannel{}

		// Slack channels' `User` will be an empty string and the user's ID if it's a user.
		if channel.User != "" {
			var userToFind *slack.User
			for _, user := range users {
				if user.ID == channel.User {
					userToFind = &user
					break
				}
			}

			if userToFind != nil {
				// Filter out Slack Bots.
				if userToFind.IsBot || userToFind.Name == "slackbot" {
					continue
				}
				newChannel.WebhookChannel = fmt.Sprintf("@%s", userToFind.Name)
			}
		} else {
			newChannel.WebhookChannel = fmt.Sprintf("#%s", channel.Name)
		}

		newChannel.WebhookChannelID = channel.ID
		newChannels = append(newChannels, newChannel)
	}

	newChannelsCount := 0
	// Filter out `newChannels` that already exist in `existingChannels` so we don't have duplicates.
	for _, newChannel := range newChannels {
		channelAlreadyExists := false

		for _, existingChannel := range existingChannels {
			if existingChannel.WebhookChannelID == newChannel.WebhookChannelID {
				channelAlreadyExists = true
				break
			}
		}

		if !channelAlreadyExists {
			filteredNewChannels = append(filteredNewChannels, newChannel)
			newChannelsCount++
		}
	}

	existingChannels = append(existingChannels, filteredNewChannels...)

	return &existingChannels, newChannelsCount, nil
}

func GetAggregateFluxStatement(aggregateFunctionName string, resMins int) string {
	aggregateStatement := fmt.Sprintf(`
      query()
		  |> aggregateWindow(every: %dm, fn: mean, createEmpty: false)
          |> yield(name: "avg")
	`, resMins)

	quantile := 0.
	// explicitly validate the aggregate func to ensure no query injection possible
	switch aggregateFunctionName {
	case "p50":
		quantile = 0.5
	case "p75":
		quantile = 0.75
	case "p90":
		quantile = 0.9
	case "p95":
		quantile = 0.95
	case "p99":
		quantile = 0.99
	case "avg":
	default:
		log.Error("Received an unsupported aggregateFunctionName: ", aggregateFunctionName)
	}
	if quantile > 0. {
		aggregateStatement = fmt.Sprintf(`
		  do(q:%f)
			  |> yield(name: "p%d")
		`, quantile, int(quantile*100))
	}

	return aggregateStatement
}

func CalculateTimeUnitConversion(originalUnits *string, desiredUnits *string) float64 {
	div := 1.0
	if originalUnits != nil && desiredUnits != nil {
		o, err := time.ParseDuration(fmt.Sprintf(`1%s`, *originalUnits))
		if err != nil {
			return div
		}
		d, err := time.ParseDuration(fmt.Sprintf(`1%s`, *desiredUnits))
		if err != nil {
			return div
		}
		return float64(d.Nanoseconds()) / float64(o.Nanoseconds())
	}
	return div
}

// MetricOriginalUnits returns the input units for the metric or nil if unitless.
func MetricOriginalUnits(metricName string) (originalUnits *string) {
	if map[string]bool{"latency": true}[strings.ToLower(metricName)] {
		originalUnits = pointy.String("ns")
	}
	return
}

func GetMetricTimeline(ctx context.Context, tdb timeseries.DB, projectID int, metricName string, params modelInputs.DashboardParamsInput) (payload []*modelInputs.DashboardPayload, err error) {
	div := CalculateTimeUnitConversion(MetricOriginalUnits(metricName), params.Units)
	resMins := 60
	if params.ResolutionMinutes != nil && *params.ResolutionMinutes != 0 {
		resMins = *params.ResolutionMinutes
	}

	query := fmt.Sprintf(`
      query = () =>
		from(bucket: "%[1]s")
		  |> range(start: %[2]s, stop: %[3]s)
		  |> filter(fn: (r) => r["_measurement"] == "%[4]s")
		  |> filter(fn: (r) => r["_field"] == "%[5]s")
		  |> group()
      do = (q) =>
        query()
		  |> aggregateWindow(
               every: %[6]dm,
               fn: (column, tables=<-) => tables |> quantile(q:q, column: column),
               createEmpty: true)
	`, tdb.GetBucket(strconv.Itoa(projectID)), params.DateRange.StartDate.Format(time.RFC3339), params.DateRange.EndDate.Format(time.RFC3339), timeseries.Metrics, metricName, resMins)
	agg := "avg"
	if params.AggregateFunction != nil && *params.AggregateFunction != "" {
		agg = *params.AggregateFunction
	}
	query += GetAggregateFluxStatement(agg, resMins)
	timelineQuerySpan, _ := tracer.StartSpanFromContext(ctx, "tdb.queryTimeline")
	timelineQuerySpan.SetTag("projectID", projectID)
	timelineQuerySpan.SetTag("metricName", metricName)
	timelineQuerySpan.SetTag("resMins", resMins)
	results, err := tdb.Query(ctx, query)
	timelineQuerySpan.Finish()
	if err != nil {
		return nil, err
	}

	for _, r := range results {
		v := 0.
		if r.Value != nil {
			v = r.Value.(float64) / div
		}
		payload = append(payload, &modelInputs.DashboardPayload{
			Date:              r.Time.Format(time.RFC3339Nano),
			Value:             v,
			AggregateFunction: &agg,
		})
	}
	return
}
