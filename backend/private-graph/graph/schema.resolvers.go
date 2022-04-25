package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/aws/smithy-go/ptr"
	"github.com/clearbit/clearbit-go/clearbit"
	"github.com/highlight-run/highlight/backend/apolloio"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/object-storage"
	"github.com/highlight-run/highlight/backend/opensearch"
	"github.com/highlight-run/highlight/backend/pricing"
	"github.com/highlight-run/highlight/backend/private-graph/graph/generated"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight-run/highlight/backend/zapier"
	"github.com/lib/pq"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/rs/xid"
	"github.com/samber/lo"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	stripe "github.com/stripe/stripe-go/v72"
	"golang.org/x/sync/errgroup"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
)

func (r *commentReplyResolver) Author(ctx context.Context, obj *model.CommentReply) (*modelInputs.SanitizedAdmin, error) {
	admin := &model.Admin{}
	if err := r.DB.Where(&model.Admin{Model: model.Model{ID: obj.AdminId}}).First(&admin).Error; err != nil {
		return nil, e.Wrap(err, "Error finding admin author for comment reply")
	}

	return r.formatSanitizedAuthor(admin), nil
}

func (r *errorAlertResolver) ChannelsToNotify(ctx context.Context, obj *model.ErrorAlert) ([]*modelInputs.SanitizedSlackChannel, error) {
	return obj.GetChannelsToNotify()
}

func (r *errorAlertResolver) EmailsToNotify(ctx context.Context, obj *model.ErrorAlert) ([]*string, error) {
	return obj.GetEmailsToNotify()
}

func (r *errorAlertResolver) ExcludedEnvironments(ctx context.Context, obj *model.ErrorAlert) ([]*string, error) {
	return obj.GetExcludedEnvironments()
}

func (r *errorAlertResolver) RegexGroups(ctx context.Context, obj *model.ErrorAlert) ([]*string, error) {
	return obj.GetRegexGroups()
}

func (r *errorAlertResolver) DailyFrequency(ctx context.Context, obj *model.ErrorAlert) ([]*int64, error) {
	var dailyAlerts []*int64
	if err := r.DB.Raw(`
		SELECT COUNT(e.id)
		FROM (
			SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD') AS date
			FROM generate_series(0, 6, 1)
			AS offs
		) d LEFT OUTER JOIN
		alert_events e
		ON d.date = to_char(date_trunc('day', e.created_at), 'YYYY-MM-DD')
			AND e.type=?
			AND e.alert_id=?
			AND e.project_id=?
		GROUP BY d.date
		ORDER BY d.date ASC;
	`, obj.Type, obj.ID, obj.ProjectID).Scan(&dailyAlerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying daily alert frequency")
	}

	return dailyAlerts, nil
}

func (r *errorCommentResolver) Author(ctx context.Context, obj *model.ErrorComment) (*modelInputs.SanitizedAdmin, error) {
	admin := &model.Admin{}
	if err := r.DB.Where(&model.Admin{Model: model.Model{ID: obj.AdminId}}).First(&admin).Error; err != nil {
		return nil, e.Wrap(err, "Error finding admin for comment")
	}

	return r.formatSanitizedAuthor(admin), nil
}

func (r *errorGroupResolver) Event(ctx context.Context, obj *model.ErrorGroup) ([]*string, error) {
	return util.JsonStringToStringArray(obj.Event), nil
}

func (r *errorGroupResolver) StructuredStackTrace(ctx context.Context, obj *model.ErrorGroup) ([]*modelInputs.ErrorTrace, error) {
	if (obj.MappedStackTrace == nil || *obj.MappedStackTrace == "") && obj.StackTrace == "" {
		return nil, nil
	}
	stackTraceString := obj.StackTrace
	if obj.MappedStackTrace != nil && *obj.MappedStackTrace != "" && *obj.MappedStackTrace != "null" {
		stackTraceString = *obj.MappedStackTrace
	}

	return r.UnmarshalStackTrace(stackTraceString)
}

func (r *errorGroupResolver) MetadataLog(ctx context.Context, obj *model.ErrorGroup) ([]*modelInputs.ErrorMetadata, error) {
	var metadataLogs []*modelInputs.ErrorMetadata
	r.DB.Raw(`
		SELECT s.id AS session_id,
			s.secure_id AS session_secure_id,
			e.id AS error_id,
			e.timestamp,
			s.os_name AS os,
			s.browser_name AS browser,
			e.url AS visited_url,
			s.fingerprint AS fingerprint,
			s.identifier AS identifier,
			s.user_properties,
			e.request_id
		FROM sessions AS s
		INNER JOIN (
			SELECT DISTINCT ON (session_id) session_id, id, timestamp, url, request_id
			FROM error_objects
			WHERE error_group_id = ?
			ORDER BY session_id DESC
			LIMIT 20
		) AS e
		ON s.id = e.session_id
		WHERE s.excluded <> true
		ORDER BY s.updated_at DESC
		LIMIT 20;
	`, obj.ID).Scan(&metadataLogs)
	return metadataLogs, nil
}

func (r *errorGroupResolver) State(ctx context.Context, obj *model.ErrorGroup) (modelInputs.ErrorState, error) {
	switch obj.State {
	case model.ErrorGroupStates.OPEN:
		return modelInputs.ErrorStateOpen, nil
	case model.ErrorGroupStates.RESOLVED:
		return modelInputs.ErrorStateResolved, nil
	case model.ErrorGroupStates.IGNORED:
		return modelInputs.ErrorStateIgnored, nil
	default:
		return modelInputs.ErrorStateOpen, e.New("invalid error group state")
	}
}

func (r *errorGroupResolver) ErrorFrequency(ctx context.Context, obj *model.ErrorGroup) ([]*int64, error) {
	if obj != nil {
		return r.Query().DailyErrorFrequency(ctx, obj.ProjectID, obj.SecureID, 5)
	}
	return nil, nil
}

func (r *errorObjectResolver) ErrorGroupSecureID(ctx context.Context, obj *model.ErrorObject) (string, error) {
	if obj != nil {
		var secureID string
		if err := r.DB.Raw(`SELECT secure_id FROM error_groups WHERE id = ? LIMIT 1`,
			obj.ErrorGroupID).Scan(&secureID).Error; err != nil {
			return "", e.Wrapf(err, "Failed to retrieve secure_id for error group, id: %d", obj.ErrorGroupID)
		}
		return secureID, nil
	}
	return "", nil
}

func (r *errorObjectResolver) Event(ctx context.Context, obj *model.ErrorObject) ([]*string, error) {
	return util.JsonStringToStringArray(obj.Event), nil
}

func (r *errorObjectResolver) StructuredStackTrace(ctx context.Context, obj *model.ErrorObject) ([]*modelInputs.ErrorTrace, error) {
	return r.UnmarshalStackTrace(*obj.StackTrace)
}

func (r *errorSegmentResolver) Params(ctx context.Context, obj *model.ErrorSegment) (*model.ErrorSearchParams, error) {
	params := &model.ErrorSearchParams{}
	if obj.Params == nil {
		return params, nil
	}
	if err := json.Unmarshal([]byte(*obj.Params), params); err != nil {
		return nil, e.Wrapf(err, "error unmarshaling segment params")
	}
	return params, nil
}

func (r *metricResolver) Type(ctx context.Context, obj *model.Metric) (string, error) {
	return obj.Type.String(), nil
}

func (r *metricMonitorResolver) ChannelsToNotify(ctx context.Context, obj *model.MetricMonitor) ([]*modelInputs.SanitizedSlackChannel, error) {
	if obj == nil {
		return nil, e.New("empty metric monitor object for channels to notify")
	}
	channelString := "[]"
	if obj.ChannelsToNotify != nil {
		channelString = *obj.ChannelsToNotify
	}
	var sanitizedChannels []*modelInputs.SanitizedSlackChannel
	if err := json.Unmarshal([]byte(channelString), &sanitizedChannels); err != nil {
		return nil, e.Wrap(err, "error unmarshalling sanitized slack channels for metric monitors")
	}
	return sanitizedChannels, nil
}

func (r *metricMonitorResolver) EmailsToNotify(ctx context.Context, obj *model.MetricMonitor) ([]*string, error) {
	if obj == nil {
		return nil, e.New("empty metric monitor object for emails to notify")
	}
	emailString := "[]"
	if obj.EmailsToNotify != nil {
		emailString = *obj.EmailsToNotify
	}
	var emailsToNotify []*string
	if err := json.Unmarshal([]byte(emailString), &emailsToNotify); err != nil {
		return nil, e.Wrap(err, "error unmarshalling emails to notify for metric monitors")
	}
	return emailsToNotify, nil
}

func (r *mutationResolver) UpdateAdminAboutYouDetails(ctx context.Context, adminDetails modelInputs.AdminAboutYouDetails) (bool, error) {
	admin, err := r.getCurrentAdmin(ctx)

	if err != nil {
		return false, err
	}

	admin.Name = &adminDetails.Name
	admin.UserDefinedRole = &adminDetails.UserDefinedRole
	admin.Referral = &adminDetails.Referral
	admin.UserDefinedPersona = &adminDetails.UserDefinedPersona

	if err := r.DB.Save(admin).Error; err != nil {
		return false, err
	}

	return true, nil
}

func (r *mutationResolver) CreateProject(ctx context.Context, name string, workspaceID int) (*model.Project, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, nil
	}

	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, nil
	}

	project := &model.Project{
		Name:         &name,
		BillingEmail: admin.Email,
		WorkspaceID:  workspace.ID,
	}

	if err := r.DB.Create(project).Error; err != nil {
		return nil, e.Wrap(err, "error creating project")
	}

	return project, nil
}

func (r *mutationResolver) CreateWorkspace(ctx context.Context, name string) (*model.Workspace, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, nil
	}

	trialEnd := time.Now().Add(14 * 24 * time.Hour) // Trial expires 14 days from current day

	workspace := &model.Workspace{
		Admins:                    []model.Admin{*admin},
		Name:                      &name,
		TrialEndDate:              &trialEnd,
		EligibleForTrialExtension: true, // Trial can be extended if user integrates + fills out form
		TrialExtensionEnabled:     false,
	}

	if err := r.DB.Create(workspace).Error; err != nil {
		return nil, e.Wrap(err, "error creating workspace")
	}

	c := &stripe.Customer{}
	if os.Getenv("REACT_APP_ONPREM") != "true" {
		params := &stripe.CustomerParams{
			Name:  &name,
			Email: admin.Email,
		}
		params.AddMetadata("Workspace ID", strconv.Itoa(workspace.ID))
		c, err = r.StripeClient.Customers.New(params)
		if err != nil {
			return nil, e.Wrap(err, "error creating stripe customer")
		}
	}

	if err := r.DB.Model(&workspace).Updates(&model.Workspace{
		StripeCustomerID: &c.ID,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error updating workspace StripeCustomerID")
	}

	return workspace, nil
}

func (r *mutationResolver) EditProject(ctx context.Context, id int, name *string, billingEmail *string, excludedUsers pq.StringArray) (*model.Project, error) {
	project, err := r.isAdminInProject(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	for _, expression := range excludedUsers {
		_, err := regexp.Compile(expression)
		if err != nil {
			return nil, e.Wrap(err, "The regular expression '"+expression+"' is not valid")
		}
	}
	if err := r.DB.Model(project).Updates(&model.Project{
		Name:          name,
		BillingEmail:  billingEmail,
		ExcludedUsers: excludedUsers,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error updating project fields")
	}
	return project, nil
}

func (r *mutationResolver) EditWorkspace(ctx context.Context, id int, name *string) (*model.Workspace, error) {
	workspace, err := r.isAdminInWorkspace(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "error querying workspace")
	}
	if err := r.DB.Model(workspace).Updates(&model.Workspace{
		Name: name,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error updating workspace fields")
	}
	return workspace, nil
}

func (r *mutationResolver) MarkSessionAsViewed(ctx context.Context, secureID string, viewed *bool) (*model.Session, error) {
	s, err := r.canAdminModifySession(ctx, secureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "admin not logged in")
	}
	session := &model.Session{}
	updatedFields := &model.Session{
		Viewed: viewed,
	}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: s.ID}}).First(&session).Updates(updatedFields).Error; err != nil {
		return nil, e.Wrap(err, "error writing session as viewed")
	}

	if err := r.OpenSearch.Update(opensearch.IndexSessions, s.ID, map[string]interface{}{"viewed": viewed}); err != nil {
		return nil, e.Wrap(err, "error updating session in opensearch")
	}

	newAdminView := struct {
		ID int `json:"id"`
	}{
		ID: admin.ID,
	}

	if err := r.OpenSearch.AppendToField(opensearch.IndexSessions, session.ID, "viewed_by_admins", []interface{}{
		newAdminView}); err != nil {
		return nil, e.Wrap(err, "error updating session's admin viewed by in opensearch")
	}

	if err := r.DB.Model(&s).Association("ViewedByAdmins").Append(admin); err != nil {
		return nil, e.Wrap(err, "error adding admin to ViewedByAdmins")
	}

	return session, nil
}

func (r *mutationResolver) MarkSessionAsStarred(ctx context.Context, secureID string, starred *bool) (*model.Session, error) {
	s, err := r.canAdminModifySession(ctx, secureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	session := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: s.ID}}).First(&session).Updates(&model.Session{
		Starred: starred,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error writing session as starred")
	}

	if err := r.OpenSearch.Update(opensearch.IndexSessions, s.ID, map[string]interface{}{"starred": starred}); err != nil {
		return nil, e.Wrap(err, "error updating session in opensearch")
	}

	return session, nil
}

func (r *mutationResolver) UpdateErrorGroupState(ctx context.Context, secureID string, state string) (*model.ErrorGroup, error) {
	errGroup, err := r.canAdminModifyErrorGroup(ctx, secureID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not authorized to modify error group")
	}

	errorGroup := &model.ErrorGroup{}
	if err := r.DB.Where(&model.ErrorGroup{Model: model.Model{ID: errGroup.ID}}).First(&errorGroup).Updates(&model.ErrorGroup{
		State: state,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error writing errorGroup state")
	}

	if err := r.OpenSearch.Update(opensearch.IndexErrorsCombined, errorGroup.ID, map[string]interface{}{
		"state": state,
	}); err != nil {
		return nil, e.Wrap(err, "error updating error group state in OpenSearch")
	}

	return errorGroup, nil
}

func (r *mutationResolver) DeleteProject(ctx context.Context, id int) (*bool, error) {
	_, err := r.isAdminInProject(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}
	if err := r.DB.Model(&model.Project{}).Delete("id = ?", id).Error; err != nil {
		return nil, e.Wrap(err, "error deleting project")
	}
	return &model.T, nil
}

func (r *mutationResolver) SendAdminProjectInvite(ctx context.Context, projectID int, email string, baseURL string) (*string, error) {
	project, err := r.isAdminInProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error querying admin")
	}

	// TODO: Should migrate these nil secrets so we can remove this
	var secret string
	if project.Secret == nil {
		uid := xid.New().String()
		if err := r.DB.Model(project).Updates(&model.Project{Secret: &uid}).Error; err != nil {
			return nil, e.Wrap(err, "error updating uid in project secret")
		}
		secret = uid
	} else {
		secret = *project.Secret
	}

	inviteLink := baseURL + "/" + strconv.Itoa(projectID) + "/invite/" + secret
	return r.SendAdminInviteImpl(*admin.Name, *project.Name, inviteLink, email)
}

func (r *mutationResolver) SendAdminWorkspaceInvite(ctx context.Context, workspaceID int, email string, baseURL string, role string) (*string, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "error querying workspace")
	}
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error querying admin")
	}

	existingInviteLink := &model.WorkspaceInviteLink{}
	if err := r.DB.Where(&model.WorkspaceInviteLink{WorkspaceID: &workspaceID, InviteeEmail: &email}).First(existingInviteLink).Error; err != nil {
		if e.Is(err, gorm.ErrRecordNotFound) {
			existingInviteLink = nil
		} else {
			return nil, e.Wrap(err, "error querying workspace invite link for admin")
		}
	}

	// If there's an existing and expired invite link for the user then delete it.
	if existingInviteLink != nil && r.IsInviteLinkExpired(existingInviteLink) {
		if err := r.DB.Delete(existingInviteLink).Error; err != nil {
			return nil, e.Wrap(err, "error deleting expired invite link")
		}
		existingInviteLink = nil
	}

	// Delete the existing invite if the roles are different.
	if existingInviteLink != nil && existingInviteLink.InviteeRole != nil && *existingInviteLink.InviteeRole != role {
		if err := r.DB.Delete(existingInviteLink).Error; err != nil {
			return nil, e.Wrap(err, "error deleting different role invite link")
		}
		existingInviteLink = nil
	}

	if existingInviteLink == nil {
		existingInviteLink = r.CreateInviteLink(workspaceID, &email, role, false)

		if err := r.DB.Create(existingInviteLink).Error; err != nil {
			return nil, e.Wrap(err, "error creating new invite link")
		}
	}

	inviteLink := baseURL + "/w/" + strconv.Itoa(workspaceID) + "/invite/" + *existingInviteLink.Secret
	return r.SendAdminInviteImpl(*admin.Name, *workspace.Name, inviteLink, email)
}

func (r *mutationResolver) AddAdminToWorkspace(ctx context.Context, workspaceID int, inviteID string) (*int, error) {
	workspace := &model.Workspace{}
	adminId, err := r.addAdminMembership(ctx, workspace, workspaceID, inviteID)
	if err != nil {
		log.Error(err, " failed to add admin to workspace")
		return adminId, err
	}

	// For this Real Magic, set all new admins to normal role so they don't have access to billing.
	// This should be removed when we implement RBAC.
	if workspaceID == 388 {
		admin, err := r.getCurrentAdmin(ctx)
		if err != nil {
			log.Error("Failed get current admin.")
			return adminId, e.New("500")
		}
		if err := r.DB.Model(admin).Updates(model.Admin{
			Role: &model.AdminRole.MEMBER,
		}); err != nil {
			log.Error("Failed to update admin when changing role to normal.")
			return adminId, e.New("500")
		}
	}

	return adminId, nil
}

func (r *mutationResolver) JoinWorkspace(ctx context.Context, workspaceID int) (*int, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving user")
	}
	domain, err := r.getCustomVerifiedAdminEmailDomain(admin)
	if err != nil {
		return nil, e.Wrap(err, "error getting custom verified admin email domain")
	}
	workspace := &model.Workspace{Model: model.Model{ID: workspaceID}}
	if err := r.DB.Model(&workspace).Where("jsonb_exists(allowed_auto_join_email_origins::jsonb, LOWER(?))", domain).First(workspace).Error; err != nil {
		return nil, e.Wrap(err, "error querying workspace")
	}
	if err := r.DB.Model(&workspace).Association("Admins").Append(admin); err != nil {
		return nil, e.Wrap(err, "error adding admin to association")
	}
	return &workspace.ID, nil
}

func (r *mutationResolver) UpdateAllowedEmailOrigins(ctx context.Context, workspaceID int, allowedAutoJoinEmailOrigins string) (*int, error) {
	_, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "current admin is not in workspace")
	}

	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving user")
	}

	if admin.Role == nil || *admin.Role != model.AdminRole.ADMIN {
		return nil, e.New("A non-Admin role Admin tried changing an admin role.")
	}

	if err := r.DB.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).Updates(&model.Workspace{
		AllowedAutoJoinEmailOrigins: &allowedAutoJoinEmailOrigins}).Error; err != nil {
		return nil, e.Wrap(err, "error updating workspace")
	}

	return &workspaceID, nil
}

func (r *mutationResolver) ChangeAdminRole(ctx context.Context, workspaceID int, adminID int, newRole string) (bool, error) {
	_, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return false, e.Wrap(err, "current admin is not in workspace")
	}

	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return false, e.Wrap(err, "error retrieving user")
	}

	if admin.Role != nil && *admin.Role != model.AdminRole.ADMIN {
		return false, e.New("A non-Admin role Admin tried changing an admin role.")
	}

	if admin.ID == adminID {
		return false, e.New("A admin tried changing their own role.")
	}

	if err := r.DB.Model(&model.Admin{Model: model.Model{ID: adminID}}).Update("Role", newRole).Error; err != nil {
		return false, e.Wrap(err, "error updating admin role")
	}

	return true, nil
}

func (r *mutationResolver) DeleteAdminFromProject(ctx context.Context, projectID int, adminID int) (*int, error) {
	project, err := r.isAdminInProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "current admin is not in project")
	}

	return r.DeleteAdminAssociation(ctx, project, adminID)
}

func (r *mutationResolver) DeleteAdminFromWorkspace(ctx context.Context, workspaceID int, adminID int) (*int, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "current admin is not in workspace")
	}

	deletedAdminId, err := r.DeleteAdminAssociation(ctx, workspace, adminID)
	if err != nil {
		return nil, e.Wrap(err, "error deleting admin association")
	}

	return deletedAdminId, nil
}

func (r *mutationResolver) CreateSegment(ctx context.Context, projectID int, name string, params modelInputs.SearchParamsInput) (*model.Segment, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}
	modelParams := InputToParams(&params)
	// Convert to json to store in the db.
	paramBytes, err := json.Marshal(modelParams)
	if err != nil {
		return nil, e.Wrap(err, "error unmarshaling search params")
	}
	paramString := string(paramBytes)

	segment := &model.Segment{
		Name:      &name,
		Params:    &paramString,
		ProjectID: projectID,
	}
	if err := r.DB.Create(segment).Error; err != nil {
		return nil, e.Wrap(err, "error creating segment")
	}
	return segment, nil
}

func (r *mutationResolver) EmailSignup(ctx context.Context, email string) (string, error) {
	short, long, err := apolloio.Enrich(email)
	if err != nil {
		log.Errorf("error enriching email: %v", err)
		return email, nil
	}

	model.DB.Create(&model.EmailSignup{
		Email:               email,
		ApolloData:          *long,
		ApolloDataShortened: *short,
	})

	r.PrivateWorkerPool.SubmitRecover(func() {
		if contact, err := apolloio.CreateContact(email); err != nil {
			log.Errorf("error creating apollo contact: %v", err)
		} else {
			sequenceID := "60fb134ce97fa1014c1cc141" // represents the "Landing Page Signups" sequence.
			if err := apolloio.AddToSequence(contact.ID, sequenceID); err != nil {
				log.Errorf("error adding to apollo sequence: %v", err)
			}
		}
	})

	return email, nil
}

func (r *mutationResolver) EditSegment(ctx context.Context, id int, projectID int, params modelInputs.SearchParamsInput) (*bool, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin is not in project")
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
	return &model.T, nil
}

func (r *mutationResolver) DeleteSegment(ctx context.Context, segmentID int) (*bool, error) {
	_, err := r.isAdminSegmentOwner(ctx, segmentID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not segment owner")
	}
	if err := r.DB.Delete(&model.Segment{Model: model.Model{ID: segmentID}}).Error; err != nil {
		return nil, e.Wrap(err, "error deleting segment")
	}
	return &model.T, nil
}

func (r *mutationResolver) CreateErrorSegment(ctx context.Context, projectID int, name string, params modelInputs.ErrorSearchParamsInput) (*model.ErrorSegment, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}
	modelParams := ErrorInputToParams(&params)
	// Convert to json to store in the db.
	paramBytes, err := json.Marshal(modelParams)
	if err != nil {
		return nil, e.Wrap(err, "error unmarshaling search params")
	}
	paramString := string(paramBytes)

	segment := &model.ErrorSegment{
		Name:      &name,
		Params:    &paramString,
		ProjectID: projectID,
	}
	if err := r.DB.Create(segment).Error; err != nil {
		return nil, e.Wrap(err, "error creating segment")
	}
	return segment, nil
}

func (r *mutationResolver) EditErrorSegment(ctx context.Context, id int, projectID int, params modelInputs.ErrorSearchParamsInput) (*bool, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}
	modelParams := ErrorInputToParams(&params)
	// Convert to json to store in the db.
	paramBytes, err := json.Marshal(modelParams)
	if err != nil {
		return nil, e.Wrap(err, "error unmarshaling search params")
	}
	paramString := string(paramBytes)
	if err := r.DB.Model(&model.ErrorSegment{Model: model.Model{ID: id}}).Updates(&model.ErrorSegment{
		Params: &paramString,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error writing new recording settings")
	}
	return &model.T, nil
}

func (r *mutationResolver) DeleteErrorSegment(ctx context.Context, segmentID int) (*bool, error) {
	_, err := r.isAdminErrorSegmentOwner(ctx, segmentID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not error segment owner")
	}
	if err := r.DB.Delete(&model.ErrorSegment{Model: model.Model{ID: segmentID}}).Error; err != nil {
		return nil, e.Wrap(err, "error deleting segment")
	}
	return &model.T, nil
}

func (r *mutationResolver) CreateOrUpdateStripeSubscription(ctx context.Context, workspaceID int, planType modelInputs.PlanType, interval modelInputs.SubscriptionInterval) (*string, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in workspace")
	}

	if err := r.validateAdminRole(ctx); err != nil {
		return nil, e.Wrap(err, "must have ADMIN role to create/update stripe subscription")
	}

	// For older projects, if there's no customer ID, we create a StripeCustomer obj.
	if workspace.StripeCustomerID == nil {
		params := &stripe.CustomerParams{}
		c, err := r.StripeClient.Customers.New(params)
		if err != nil {
			return nil, e.Wrap(err, "error creating stripe customer")
		}
		if err := r.DB.Model(&workspace).Updates(&model.Workspace{
			StripeCustomerID: &c.ID,
		}).Error; err != nil {
			return nil, e.Wrap(err, "error updating org fields")
		}
		workspace.StripeCustomerID = &c.ID
	}

	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions")

	c, err := r.StripeClient.Customers.Get(*workspace.StripeCustomerID, params)
	if err != nil {
		return nil, e.Wrap(err, "STRIPE_INTEGRATION_ERROR cannot update stripe subscription - couldn't retrieve stripe customer data")
	}

	// If there are multiple subscriptions, it's ambiguous which one should be updated, so throw an error
	if len(c.Subscriptions.Data) > 1 {
		return nil, e.New("STRIPE_INTEGRATION_ERROR cannot update stripe subscription - customer has multiple subscriptions")
	}

	subscriptions := c.Subscriptions.Data
	pricing.FillProducts(r.StripeClient, subscriptions)

	pricingInterval := pricing.SubscriptionIntervalMonthly
	if planType != modelInputs.PlanTypeFree && interval == modelInputs.SubscriptionIntervalAnnual {
		pricingInterval = pricing.SubscriptionIntervalAnnual
	}

	prices, err := pricing.GetStripePrices(r.StripeClient, planType, pricingInterval)
	if err != nil {
		return nil, e.Wrap(err, "STRIPE_INTEGRATION_ERROR cannot update stripe subscription - failed to get Stripe prices")
	}

	newBasePrice := prices[pricing.ProductTypeBase]

	// If there's an existing subscription, update it
	if len(subscriptions) == 1 {
		subscription := subscriptions[0]
		if len(subscription.Items.Data) != 1 {
			return nil, e.New("STRIPE_INTEGRATION_ERROR cannot update stripe subscription - subscription has multiple products")
		}

		subscriptionItem := subscription.Items.Data[0]
		productType, _, _ := pricing.GetProductMetadata(subscriptionItem.Price)
		if productType == nil || *productType != pricing.ProductTypeBase {
			return nil, e.New("STRIPE_INTEGRATION_ERROR cannot update stripe subscription - expecting base product")
		}

		subscriptionParams := &stripe.SubscriptionParams{
			CancelAtPeriodEnd: stripe.Bool(false),
			ProrationBehavior: stripe.String(string(stripe.SubscriptionProrationBehaviorCreateProrations)),
			Items: []*stripe.SubscriptionItemsParams{
				{
					ID:   &subscriptionItem.ID,
					Plan: &newBasePrice.ID,
				},
			},
		}

		_, err := r.StripeClient.Subscriptions.Update(subscription.ID, subscriptionParams)
		if err != nil {
			return nil, e.Wrap(err, "couldn't update subscription")
		}
		ret := ""
		return &ret, nil
	}

	// If there's no existing subscription, we create a checkout.
	checkoutSessionParams := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String(os.Getenv("FRONTEND_URI") + "/w/" + strconv.Itoa(workspaceID) + "/billing/success"),
		CancelURL:  stripe.String(os.Getenv("FRONTEND_URI") + "/w/" + strconv.Itoa(workspaceID) + "/billing/checkoutCanceled"),
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		Customer: workspace.StripeCustomerID,
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			Items: []*stripe.CheckoutSessionSubscriptionDataItemsParams{
				{Plan: &newBasePrice.ID},
			},
		},
		Mode: stripe.String(string(stripe.CheckoutSessionModeSubscription)),
	}
	checkoutSessionParams.AddExtra("allow_promotion_codes", "true")

	stripeSession, err := r.StripeClient.CheckoutSessions.New(checkoutSessionParams)
	if err != nil {
		return nil, e.Wrap(err, "error creating CheckoutSession in stripe")
	}

	return &stripeSession.ID, nil
}

func (r *mutationResolver) UpdateBillingDetails(ctx context.Context, workspaceID int) (*bool, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in workspace")
	}

	if err := r.validateAdminRole(ctx); err != nil {
		return nil, e.Wrap(err, "must have ADMIN role to update billing details")
	}

	if err := r.updateBillingDetails(*workspace.StripeCustomerID); err != nil {
		return nil, e.Wrap(err, "error updating billing details")
	}

	return &model.T, nil
}

func (r *mutationResolver) CreateSessionComment(ctx context.Context, projectID int, sessionSecureID string, sessionTimestamp int, text string, textForEmail string, xCoordinate float64, yCoordinate float64, taggedAdmins []*modelInputs.SanitizedAdminInput, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput, sessionURL string, time float64, authorName string, sessionImage *string, issueTitle *string, issueDescription *string, integrations []*modelInputs.IntegrationType, tags []*modelInputs.SessionCommentTagInput) (*model.SessionComment, error) {
	admin, isGuest := r.getCurrentAdminOrGuest(ctx)

	// All viewers can leave a comment, including guests
	session, err := r.canAdminViewSession(ctx, sessionSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin cannot leave a comment")
	}

	var project model.Project
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "error querying project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, err
	}

	admins := r.getTaggedAdmins(taggedAdmins, isGuest)

	sessionImageStr := ""
	if sessionImage != nil {
		sessionImageStr = *sessionImage
	}
	if sessionTimestamp >= math.MaxInt32 {
		log.Warnf("attempted to create session with invalid timestamp %d", sessionTimestamp)
		sessionTimestamp = 0
	}
	sessionComment := &model.SessionComment{
		Admins:          admins,
		ProjectID:       projectID,
		AdminId:         admin.Model.ID,
		SessionId:       session.ID,
		SessionSecureId: session.SecureID,
		SessionImage:    sessionImageStr,
		Timestamp:       sessionTimestamp,
		Text:            text,
		XCoordinate:     xCoordinate,
		YCoordinate:     yCoordinate,
	}
	createSessionCommentSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createSessionComment",
		tracer.ResourceName("db.createSessionComment"), tracer.Tag("project_id", projectID))
	if err := r.DB.Create(sessionComment).Error; err != nil {
		return nil, e.Wrap(err, "error creating session comment")
	}
	createSessionCommentSpan.Finish()

	// Create associations between tags and comments.
	if len(tags) > 0 {
		// Create the tag if it's a new tag
		newTags := []*model.SessionCommentTag{}
		existingTags := []*model.SessionCommentTag{}
		sessionComments := []model.SessionComment{*sessionComment}

		for _, tag := range tags {
			if tag.ID == nil {
				newSessionCommentTag := model.SessionCommentTag{
					ProjectID:       projectID,
					Name:            tag.Name,
					SessionComments: sessionComments,
				}
				newTags = append(newTags, &newSessionCommentTag)
			} else {
				newSessionCommentTag := model.SessionCommentTag{
					ProjectID: projectID,
					Name:      tag.Name,
					Model: model.Model{
						ID: *tag.ID,
					},
					SessionComments: sessionComments,
				}
				existingTags = append(existingTags, &newSessionCommentTag)
			}
		}

		if len(newTags) > 0 {
			if err := r.DB.Create(&newTags).Error; err != nil {
				log.Error("Failed to create new session tags", err)
			}
		}

		if len(existingTags) > 0 {
			if err := r.DB.Save(&existingTags).Error; err != nil {
				log.Error("Failed to update existing session tags", err)
			}
		}
	}

	viewLink := fmt.Sprintf("%v?commentId=%v&ts=%v", sessionURL, sessionComment.ID, time)

	if len(taggedAdmins) > 0 && !isGuest {
		r.sendCommentPrimaryNotification(ctx, admin, *admin.Name, taggedAdmins, workspace, project.ID, textForEmail, viewLink, sessionImage, "tagged", "session")
	}
	if len(taggedSlackUsers) > 0 && !isGuest {
		r.sendCommentMentionNotification(ctx, admin, taggedSlackUsers, workspace, project.ID, textForEmail, viewLink, sessionImage, "tagged", "session")
	}

	if len(integrations) > 0 && workspace.LinearAccessToken != nil && *workspace.LinearAccessToken != "" {
		for _, s := range integrations {
			if *s == modelInputs.IntegrationTypeLinear {
				attachment := &model.ExternalAttachment{
					IntegrationType:  modelInputs.IntegrationTypeLinear,
					SessionCommentID: sessionComment.ID,
				}

				if err := r.CreateLinearIssueAndAttachment(workspace, attachment, *issueTitle, *issueDescription, textForEmail, authorName, viewLink); err != nil {
					return nil, e.Wrap(err, "error creating linear ticket or workspace")
				}

				sessionComment.Attachments = append(sessionComment.Attachments, attachment)
			}
		}
	}

	taggedAdmins = append(taggedAdmins, &modelInputs.SanitizedAdminInput{
		ID:    admin.ID,
		Name:  admin.Name,
		Email: *admin.Email,
	})
	newFollowers := r.findNewFollowers(taggedAdmins, taggedSlackUsers, nil, nil)
	for _, f := range newFollowers {
		f.SessionCommentID = sessionComment.ID
	}
	if len(newFollowers) > 0 {
		if err := r.DB.Create(&newFollowers).Error; err != nil {
			log.Error("Failed to create new session comment followers", err)
		}
	}

	return sessionComment, nil
}

func (r *mutationResolver) CreateIssueForSessionComment(ctx context.Context, projectID int, sessionURL string, sessionCommentID int, authorName string, textForAttachment string, time float64, issueTitle *string, issueDescription *string, integrations []*modelInputs.IntegrationType) (*model.SessionComment, error) {
	var project model.Project
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "error querying project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, err
	}

	sessionComment := &model.SessionComment{}
	if err := r.DB.Preload("Attachments").Where(&model.SessionComment{Model: model.Model{ID: sessionCommentID}}).Find(sessionComment).Error; err != nil {
		return nil, err
	}

	viewLink := fmt.Sprintf("%v?commentId=%v&ts=%v", sessionURL, sessionComment.ID, time)

	if len(integrations) > 0 {
		for _, s := range integrations {
			if *s == modelInputs.IntegrationTypeLinear && *workspace.LinearAccessToken != "" {
				attachment := &model.ExternalAttachment{
					IntegrationType:  modelInputs.IntegrationTypeLinear,
					SessionCommentID: sessionComment.ID,
				}

				if err := r.CreateLinearIssueAndAttachment(workspace, attachment, *issueTitle, *issueDescription, sessionComment.Text, authorName, viewLink); err != nil {
					return nil, e.Wrap(err, "error creating linear ticket or workspace")
				}

				sessionComment.Attachments = append(sessionComment.Attachments, attachment)
			}
		}
	}

	return sessionComment, nil
}

func (r *mutationResolver) DeleteSessionComment(ctx context.Context, id int) (*bool, error) {
	var sessionComment model.SessionComment
	if err := r.DB.Where(model.SessionComment{Model: model.Model{ID: id}}).First(&sessionComment).Error; err != nil {
		return nil, e.Wrap(err, "error querying session comment")
	}
	_, err := r.canAdminModifySession(ctx, sessionComment.SessionSecureId)
	if err != nil {
		return nil, e.Wrap(err, "admin is not session owner")
	}
	if err := r.DB.Delete(&model.SessionComment{Model: model.Model{ID: id}}).Error; err != nil {
		return nil, e.Wrap(err, "error session comment")
	}
	if err := r.DB.Where(&model.ExternalAttachment{SessionCommentID: id}).Delete(&model.ExternalAttachment{}).Error; err != nil {
		return nil, e.Wrap(err, "error deleting session comment attachments")
	}
	return &model.T, nil
}

func (r *mutationResolver) ReplyToSessionComment(ctx context.Context, commentID int, text string, textForEmail string, sessionURL string, taggedAdmins []*modelInputs.SanitizedAdminInput, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput) (*model.CommentReply, error) {
	admin, isGuest := r.getCurrentAdminOrGuest(ctx)

	var sessionComment model.SessionComment
	if err := r.DB.Preload("Followers").Where(model.SessionComment{Model: model.Model{ID: commentID}}).First(&sessionComment).Error; err != nil {
		return nil, e.Wrap(err, "error querying session comment")
	}

	// All viewers can leave a comment reply, including guests
	_, err := r.canAdminViewSession(ctx, sessionComment.SessionSecureId)
	if err != nil {
		return nil, e.Wrap(err, "admin cannot leave a comment reply")
	}

	var project model.Project
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: sessionComment.ProjectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "error querying project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, err
	}

	admins := r.getTaggedAdmins(taggedAdmins, isGuest)

	commentReply := &model.CommentReply{
		SessionCommentID: sessionComment.ID,
		Admins:           admins,
		AdminId:          admin.ID,
		Text:             text,
	}
	createSessionCommentReplySpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createSessionCommentReply",
		tracer.ResourceName("db.createSessionCommentReply"), tracer.Tag("project_id", sessionComment.ProjectID))
	if err := r.DB.Create(commentReply).Error; err != nil {
		return nil, e.Wrap(err, "error creating session comment reply")
	}
	createSessionCommentReplySpan.Finish()

	viewLink := fmt.Sprintf("%v?commentId=%v", sessionURL, sessionComment.ID)

	if len(taggedAdmins) > 0 && !isGuest {
		r.sendCommentPrimaryNotification(ctx, admin, *admin.Name, taggedAdmins, workspace, project.ID, textForEmail, viewLink, &sessionComment.SessionImage, "replied to", "session")
	}
	if len(taggedSlackUsers) > 0 && !isGuest {
		r.sendCommentMentionNotification(ctx, admin, taggedSlackUsers, workspace, project.ID, textForEmail, viewLink, &sessionComment.SessionImage, "replied to", "session")
	}
	if len(sessionComment.Followers) > 0 && !isGuest {
		r.sendFollowedCommentNotification(ctx, admin, sessionComment.Followers, workspace, project.ID, textForEmail, viewLink, &sessionComment.SessionImage, "replied to", "session")
	}

	existingAdminIDs, existingSlackChannelIDs := r.getCommentFollowers(ctx, sessionComment.Followers)
	taggedAdmins = append(taggedAdmins, &modelInputs.SanitizedAdminInput{
		ID:    admin.ID,
		Name:  admin.Name,
		Email: *admin.Email,
	})
	newFollowers := r.findNewFollowers(taggedAdmins, taggedSlackUsers, existingAdminIDs, existingSlackChannelIDs)
	for _, f := range newFollowers {
		f.SessionCommentID = commentID
	}

	if len(newFollowers) > 0 {
		if err := r.DB.Create(&newFollowers).Error; err != nil {
			log.Error("Failed to create new session reply followers", err)
		}
	}

	return commentReply, nil
}

func (r *mutationResolver) CreateErrorComment(ctx context.Context, projectID int, errorGroupSecureID string, text string, textForEmail string, taggedAdmins []*modelInputs.SanitizedAdminInput, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput, errorURL string, authorName string, issueTitle *string, issueDescription *string, integrations []*modelInputs.IntegrationType) (*model.ErrorComment, error) {
	admin, isGuest := r.getCurrentAdminOrGuest(ctx)

	errorGroup, err := r.canAdminViewErrorGroup(ctx, errorGroupSecureID, false)
	if err != nil {
		return nil, e.Wrap(err, "admin is not authorized to view error group")
	}

	var project model.Project
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "error querying project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, err
	}

	admins := []model.Admin{}
	for _, a := range taggedAdmins {
		admins = append(admins,
			model.Admin{
				Model: model.Model{ID: a.ID},
			},
		)
	}

	errorComment := &model.ErrorComment{
		Admins:        admins,
		ProjectID:     projectID,
		AdminId:       admin.Model.ID,
		ErrorId:       errorGroup.ID,
		ErrorSecureId: errorGroup.SecureID,
		Text:          text,
	}
	createErrorCommentSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createErrorComment",
		tracer.ResourceName("db.createErrorComment"), tracer.Tag("project_id", projectID))
	if err := r.DB.Create(errorComment).Error; err != nil {
		return nil, e.Wrap(err, "error creating error comment")
	}
	createErrorCommentSpan.Finish()

	viewLink := fmt.Sprintf("%v", errorURL)

	if len(taggedAdmins) > 0 && !isGuest {
		r.sendCommentPrimaryNotification(ctx, admin, authorName, taggedAdmins, workspace, projectID, textForEmail, viewLink, nil, "tagged", "error")
	}
	if len(taggedSlackUsers) > 0 && !isGuest {
		r.sendCommentMentionNotification(ctx, admin, taggedSlackUsers, workspace, projectID, textForEmail, viewLink, nil, "tagged", "error")
	}

	if len(integrations) > 0 && *workspace.LinearAccessToken != "" {
		for _, s := range integrations {
			if *s == modelInputs.IntegrationTypeLinear {
				attachment := &model.ExternalAttachment{
					IntegrationType: modelInputs.IntegrationTypeLinear,
					ErrorCommentID:  errorComment.ID,
				}

				if err := r.CreateLinearIssueAndAttachment(workspace, attachment, *issueTitle, *issueDescription, textForEmail, authorName, viewLink); err != nil {
					return nil, e.Wrap(err, "error creating linear ticket or workspace")
				}

				errorComment.Attachments = append(errorComment.Attachments, attachment)
			}
		}
	}

	taggedAdmins = append(taggedAdmins, &modelInputs.SanitizedAdminInput{
		ID:    admin.ID,
		Name:  admin.Name,
		Email: *admin.Email,
	})
	newFollowers := r.findNewFollowers(taggedAdmins, taggedSlackUsers, nil, nil)
	for _, f := range newFollowers {
		f.ErrorCommentID = errorComment.ID
	}
	if len(newFollowers) > 0 {
		if err := r.DB.Create(&newFollowers).Error; err != nil {
			log.Error("Failed to create new session comment followers", err)
		}
	}

	return errorComment, nil
}

func (r *mutationResolver) CreateIssueForErrorComment(ctx context.Context, projectID int, errorURL string, errorCommentID int, authorName string, textForAttachment string, issueTitle *string, issueDescription *string, integrations []*modelInputs.IntegrationType) (*model.ErrorComment, error) {
	var project model.Project
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: projectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "error querying project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, err
	}

	errorComment := &model.ErrorComment{}
	if err := r.DB.Preload("Attachments").Where(&model.ErrorComment{Model: model.Model{ID: errorCommentID}}).Find(errorComment).Error; err != nil {
		return nil, err
	}

	viewLink := fmt.Sprintf("%v", errorURL)

	if len(integrations) > 0 {
		for _, s := range integrations {
			if *s == modelInputs.IntegrationTypeLinear && *workspace.LinearAccessToken != "" {
				attachment := &model.ExternalAttachment{
					IntegrationType: modelInputs.IntegrationTypeLinear,
					ErrorCommentID:  errorComment.ID,
				}

				if err := r.CreateLinearIssueAndAttachment(workspace, attachment, *issueTitle, *issueDescription, errorComment.Text, authorName, viewLink); err != nil {
					return nil, e.Wrap(err, "error creating linear ticket or workspace")
				}

				errorComment.Attachments = append(errorComment.Attachments, attachment)
			}
		}
	}

	return errorComment, nil
}

func (r *mutationResolver) DeleteErrorComment(ctx context.Context, id int) (*bool, error) {
	var errorGroupSecureID string
	if err := r.DB.Table("error_comments").Select("error_secure_id").Where("id=?", id).Scan(&errorGroupSecureID).Error; err != nil {
		return nil, e.Wrap(err, "error querying error comments")
	}
	_, err := r.canAdminModifyErrorGroup(ctx, errorGroupSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not authorized to modify error group")
	}
	if err := r.DB.Delete(&model.ErrorComment{Model: model.Model{ID: id}}).Error; err != nil {
		return nil, e.Wrap(err, "error deleting error_comment")
	}
	if err := r.DB.Where(&model.ExternalAttachment{ErrorCommentID: id}).Delete(&model.ExternalAttachment{}).Error; err != nil {
		return nil, e.Wrap(err, "error deleting session comment attachments")
	}
	return &model.T, nil
}

func (r *mutationResolver) ReplyToErrorComment(ctx context.Context, commentID int, text string, textForEmail string, errorURL string, taggedAdmins []*modelInputs.SanitizedAdminInput, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput) (*model.CommentReply, error) {
	var errorComment model.ErrorComment
	if err := r.DB.Preload("Followers").Where(model.ErrorComment{Model: model.Model{ID: commentID}}).First(&errorComment).Error; err != nil {
		return nil, e.Wrap(err, "error querying error comment")
	}

	_, err := r.canAdminViewErrorGroup(ctx, errorComment.ErrorSecureId, false)
	if err != nil {
		return nil, e.Wrap(err, "admin is not authorized to view error group")
	}

	admin, isGuest := r.getCurrentAdminOrGuest(ctx)

	var project model.Project
	if err := r.DB.Where(&model.Project{Model: model.Model{ID: errorComment.ProjectID}}).First(&project).Error; err != nil {
		return nil, e.Wrap(err, "error querying project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, err
	}

	admins := r.getTaggedAdmins(taggedAdmins, isGuest)

	commentReply := &model.CommentReply{
		ErrorCommentID: errorComment.ID,
		Admins:         admins,
		AdminId:        admin.ID,
		Text:           text,
	}
	createErrorCommentReplySpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createErrorCommentReply",
		tracer.ResourceName("db.createErrorCommentReply"), tracer.Tag("project_id", errorComment.ProjectID))
	if err := r.DB.Create(commentReply).Error; err != nil {
		return nil, e.Wrap(err, "error creating error comment reply")
	}
	createErrorCommentReplySpan.Finish()

	viewLink := fmt.Sprintf("%v?commentId=%v", errorURL, errorComment.ID)

	if len(taggedAdmins) > 0 && !isGuest {
		r.sendCommentPrimaryNotification(ctx, admin, *admin.Name, taggedAdmins, workspace, project.ID, textForEmail, viewLink, nil, "replied to", "error")
	}
	if len(taggedSlackUsers) > 0 && !isGuest {
		r.sendCommentMentionNotification(ctx, admin, taggedSlackUsers, workspace, project.ID, textForEmail, viewLink, nil, "replied to", "error")
	}
	if len(errorComment.Followers) > 0 && !isGuest {
		r.sendFollowedCommentNotification(ctx, admin, errorComment.Followers, workspace, project.ID, textForEmail, viewLink, nil, "replied to", "error")
	}

	existingAdminIDs, existingSlackChannelIDs := r.getCommentFollowers(ctx, errorComment.Followers)
	taggedAdmins = append(taggedAdmins, &modelInputs.SanitizedAdminInput{
		ID:    admin.ID,
		Name:  admin.Name,
		Email: *admin.Email,
	})
	newFollowers := r.findNewFollowers(taggedAdmins, taggedSlackUsers, existingAdminIDs, existingSlackChannelIDs)
	for _, f := range newFollowers {
		f.ErrorCommentID = commentID
	}

	if len(newFollowers) > 0 {
		if err := r.DB.Create(&newFollowers).Error; err != nil {
			log.Error("Failed to create new error reply followers", err)
		}
	}

	return commentReply, nil
}

func (r *mutationResolver) OpenSlackConversation(ctx context.Context, projectID int, code string, redirectPath string) (*bool, error) {
	var (
		SLACK_CLIENT_ID     string
		SLACK_CLIENT_SECRET string
	)
	project, err := r.isAdminInProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}
	redirect := os.Getenv("FRONTEND_URI")
	redirect += "/" + strconv.Itoa(projectID) + "/" + redirectPath
	if tempSlackClientID, ok := os.LookupEnv("SLACK_CLIENT_ID"); ok && tempSlackClientID != "" {
		SLACK_CLIENT_ID = tempSlackClientID
	}
	if tempSlackClientSecret, ok := os.LookupEnv("SLACK_CLIENT_SECRET"); ok && tempSlackClientSecret != "" {
		SLACK_CLIENT_SECRET = tempSlackClientSecret
	}
	resp, err := slack.
		GetOAuthV2Response(
			&http.Client{},
			SLACK_CLIENT_ID,
			SLACK_CLIENT_SECRET,
			code,
			redirect,
		)
	if err != nil {
		return nil, e.Wrap(err, "error getting slack oauth response")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, err
	}

	if workspace.SlackAccessToken == nil {
		if err := r.DB.Where(&workspace).Updates(&model.Workspace{SlackAccessToken: &resp.AccessToken}).Error; err != nil {
			return nil, e.Wrap(err, "error updating slack access token in workspace")
		}
	}

	slackClient := slack.New(resp.AccessToken)
	c, _, _, err := slackClient.OpenConversation(&slack.OpenConversationParameters{Users: []string{resp.AuthedUser.ID}})
	if err != nil {
		return nil, e.Wrap(err, "error opening slack conversation")
	}
	adminUID := fmt.Sprintf("%v", ctx.Value(model.ContextKeys.UID))
	if err := r.DB.Where(&model.Admin{UID: &adminUID}).Updates(&model.Admin{SlackIMChannelID: &c.ID}).Error; err != nil {
		return nil, e.Wrap(err, "error updating slack conversation on admin table")
	}
	_, _, err = slackClient.PostMessage(c.ID, slack.MsgOptionText("You will receive personal notifications when you're tagged in a session or error comment here!", false))
	if err != nil {
		return nil, e.Wrap(err, "error posting message to user")
	}
	return &model.T, nil
}

func (r *mutationResolver) AddIntegrationToProject(ctx context.Context, integrationType *modelInputs.IntegrationType, projectID int, code string) (bool, error) {
	project, err := r.isAdminInProject(ctx, projectID)
	if err != nil {
		return false, e.Wrap(err, "admin is not in project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return false, err
	}

	if *integrationType == modelInputs.IntegrationTypeLinear {
		if err := r.AddLinearToWorkspace(workspace, code); err != nil {
			return false, err
		}
	} else if *integrationType == modelInputs.IntegrationTypeSlack {
		if err := r.AddSlackToWorkspace(workspace, code); err != nil {
			return false, err
		}
	} else {
		return false, e.New("invalid integrationType")
	}

	return true, nil
}

func (r *mutationResolver) RemoveIntegrationFromProject(ctx context.Context, integrationType *modelInputs.IntegrationType, projectID int) (bool, error) {
	project, err := r.isAdminInProject(ctx, projectID)
	if err != nil {
		return false, e.Wrap(err, "admin is not in project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return false, err
	}

	if *integrationType == modelInputs.IntegrationTypeLinear {
		if err := r.RemoveLinearFromWorkspace(workspace); err != nil {
			return false, err
		}
	} else if *integrationType == modelInputs.IntegrationTypeSlack {
		if err := r.RemoveSlackFromWorkspace(workspace, projectID); err != nil {
			return false, err
		}
	} else if *integrationType == modelInputs.IntegrationTypeZapier {
		if err := r.RemoveZapierFromWorkspace(project); err != nil {
			return false, err
		}
	} else {
		return false, e.New("invalid integrationType")
	}

	return true, nil
}

func (r *mutationResolver) SyncSlackIntegration(ctx context.Context, projectID int) (*modelInputs.SlackSyncResponse, error) {
	project, err := r.isAdminInProject(ctx, projectID)
	response := modelInputs.SlackSyncResponse{
		Success:               true,
		NewChannelsAddedCount: 0,
	}
	if err != nil {
		return &response, err
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return &response, err
	}
	slackChannels, newChannelsCount, err := r.GetSlackChannelsFromSlack(workspace.ID)

	if err != nil {
		return &response, err
	}

	channelBytes, err := json.Marshal(slackChannels)
	if err != nil {
		return &response, e.Wrap(err, "error marshaling slack channels")
	}
	channelString := string(channelBytes)
	if err := r.DB.Model(&workspace).Updates(&model.Workspace{
		SlackChannels: &channelString,
	}).Error; err != nil {
		return &response, e.Wrap(err, "error updating workspace slack channels")
	}

	response.NewChannelsAddedCount = newChannelsCount

	return &response, nil
}

func (r *mutationResolver) CreateDefaultAlerts(ctx context.Context, projectID int, alertTypes []string, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string) (*bool, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	caser := cases.Title(language.AmericanEnglish)
	var sessionAlerts []*model.SessionAlert
	for _, alertType := range alertTypes {
		name := caser.String(strings.ToLower(strings.Replace(alertType, "_", " ", -1)))
		alertType := alertType
		newAlert := model.Alert{
			ProjectID:         projectID,
			CountThreshold:    1,
			ThresholdWindow:   util.MakeIntPointer(30),
			Type:              &alertType,
			ChannelsToNotify:  channelsString,
			EmailsToNotify:    emailsString,
			Name:              &name,
			LastAdminToEditID: admin.ID,
		}
		if alertType == model.AlertType.ERROR {
			errorAlert := &model.ErrorAlert{Alert: newAlert}
			if err := r.DB.Create(errorAlert).Error; err != nil {
				return nil, e.Wrap(err, "error creating a new error alert")
			}
			if err := errorAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &errorAlert.ID, Project: project, OperationName: "created", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
				graphql.AddError(ctx, e.Wrap(err, "error sending slack welcome message for default error alert"))
			}
		} else {
			sessionAlerts = append(sessionAlerts, &model.SessionAlert{Alert: newAlert})
		}
	}

	if err := r.DB.Create(sessionAlerts).Error; err != nil {
		return nil, e.Wrap(err, "error creating new session alerts")
	}
	for _, projectAlert := range sessionAlerts {
		if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &projectAlert.ID, Project: project, OperationName: "created", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
			graphql.AddError(ctx, e.Wrap(err, "error sending slack welcome message for default session alert"))
		}
	}

	return &model.T, nil
}

func (r *mutationResolver) CreateRageClickAlert(ctx context.Context, projectID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envString, err := r.MarshalEnvironments(environments)
	if err != nil {
		return nil, err
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			ExcludedEnvironments: envString,
			CountThreshold:       countThreshold,
			ThresholdWindow:      &thresholdWindow,
			Type:                 &model.AlertType.RAGE_CLICK,
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 &name,
			LastAdminToEditID:    admin.ID,
		},
	}

	if err := r.DB.Create(newAlert).Error; err != nil {
		return nil, e.Wrap(err, "error creating a new error alert")
	}
	if err := newAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &newAlert.ID, Project: project, OperationName: "created", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}

	return newAlert, nil
}

func (r *mutationResolver) CreateMetricMonitor(ctx context.Context, projectID int, name string, function string, threshold float64, metricToMonitor string, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string) (*model.MetricMonitor, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	newMetricMonitor := &model.MetricMonitor{
		ProjectID:         projectID,
		Name:              name,
		Function:          function,
		Threshold:         threshold,
		MetricToMonitor:   metricToMonitor,
		ChannelsToNotify:  channelsString,
		EmailsToNotify:    emailsString,
		LastAdminToEditID: admin.ID,
	}

	if err := r.DB.Create(newMetricMonitor).Error; err != nil {
		return nil, e.Wrap(err, "error creating a new error alert")
	}
	if err := newMetricMonitor.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageForMetricMonitorInput{Workspace: workspace, Admin: admin, MonitorID: &newMetricMonitor.ID, Project: project, OperationName: "created", OperationDescription: "Monitor alerts will be sent here", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}

	return newMetricMonitor, nil
}

func (r *mutationResolver) UpdateMetricMonitor(ctx context.Context, metricMonitorID int, projectID int, name string, function string, threshold float64, metricToMonitor string, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, disabled bool) (*model.MetricMonitor, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	metricMonitor := &model.MetricMonitor{}
	if err := r.DB.Where(&model.MetricMonitor{Model: model.Model{ID: metricMonitorID}}).Find(&metricMonitor).Error; err != nil {
		return nil, e.Wrap(err, "error querying metric monitor")
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, e.Wrap(err, "error marshalling slack channels")
	}

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	metricMonitor.ChannelsToNotify = channelsString
	metricMonitor.EmailsToNotify = emailsString
	metricMonitor.Name = name
	metricMonitor.Function = function
	metricMonitor.Threshold = threshold
	metricMonitor.MetricToMonitor = metricToMonitor
	metricMonitor.LastAdminToEditID = admin.ID
	metricMonitor.Disabled = &disabled

	if err := r.DB.Save(&metricMonitor).Error; err != nil {
		return nil, e.Wrap(err, "error updating metric monitor")
	}

	if err := metricMonitor.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageForMetricMonitorInput{Workspace: workspace, Admin: admin, MonitorID: &metricMonitorID, Project: project, OperationName: "updated", OperationDescription: "Monitor alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return metricMonitor, nil
}

func (r *mutationResolver) CreateErrorAlert(ctx context.Context, projectID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, regexGroups []*string, frequency int) (*model.ErrorAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envString, err := r.MarshalEnvironments(environments)
	if err != nil {
		return nil, err
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	regexGroupsBytes, err := json.Marshal(regexGroups)
	if err != nil {
		return nil, e.Wrap(err, "error marshalling regex groups")
	}
	regexGroupsString := string(regexGroupsBytes)

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	newAlert := &model.ErrorAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			CountThreshold:       countThreshold,
			ThresholdWindow:      &thresholdWindow,
			Type:                 &model.AlertType.ERROR,
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 &name,
			LastAdminToEditID:    admin.ID,
			Frequency:            frequency,
		},
		RegexGroups: &regexGroupsString,
	}

	if err := r.DB.Create(newAlert).Error; err != nil {
		return nil, e.Wrap(err, "error creating a new error alert")
	}
	if err := newAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &newAlert.ID, Project: project, OperationName: "created", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}

	return newAlert, nil
}

func (r *mutationResolver) UpdateErrorAlert(ctx context.Context, projectID int, name string, errorAlertID int, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, regexGroups []*string, frequency int, disabled bool) (*model.ErrorAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	projectAlert := &model.ErrorAlert{}
	if err := r.DB.Where(&model.ErrorAlert{Model: model.Model{ID: errorAlertID}}).Find(&projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error querying error alert")
	}

	envString, err := r.MarshalEnvironments(environments)
	if err != nil {
		return nil, err
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}
	regexGroupsBytes, err := json.Marshal(regexGroups)
	if err != nil {
		return nil, e.Wrap(err, "error marshalling regex groups")
	}
	regexGroupsString := string(regexGroupsBytes)

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	projectAlert.ChannelsToNotify = channelsString
	projectAlert.EmailsToNotify = emailsString
	projectAlert.ExcludedEnvironments = envString
	projectAlert.CountThreshold = countThreshold
	projectAlert.ThresholdWindow = &thresholdWindow
	projectAlert.Name = &name
	projectAlert.LastAdminToEditID = admin.ID
	projectAlert.RegexGroups = &regexGroupsString
	projectAlert.Frequency = frequency
	projectAlert.Disabled = &disabled
	if err := r.DB.Model(&model.ErrorAlert{
		Model: model.Model{
			ID: errorAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields")
	}

	if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &errorAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return projectAlert, nil
}

func (r *mutationResolver) DeleteErrorAlert(ctx context.Context, projectID int, errorAlertID int) (*model.ErrorAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	projectAlert := &model.ErrorAlert{}
	if err := r.DB.Where(&model.ErrorAlert{Model: model.Model{ID: errorAlertID}, Alert: model.Alert{ProjectID: projectID}}).Find(&projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "this error alert does not exist in this project.")
	}

	if err := r.DB.Delete(projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error trying to delete error alert")
	}

	if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &errorAlertID, Project: project, OperationName: "deleted", OperationDescription: "Alerts will no longer be sent to this channel.", IncludeEditLink: false}); err != nil {
		log.Error(err)
	}

	return projectAlert, nil
}

func (r *mutationResolver) DeleteMetricMonitor(ctx context.Context, projectID int, metricMonitorID int) (*model.MetricMonitor, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	metricMonitor := &model.MetricMonitor{}
	if err := r.DB.Where(&model.MetricMonitor{Model: model.Model{ID: metricMonitorID}, ProjectID: projectID}).Find(&metricMonitor).Error; err != nil {
		return nil, e.Wrap(err, "this metric monitor does not exist in this project.")
	}

	if err := r.DB.Delete(metricMonitor).Error; err != nil {
		return nil, e.Wrap(err, "error trying to delete metric monitor")
	}

	if err := metricMonitor.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageForMetricMonitorInput{Workspace: workspace, Admin: admin, MonitorID: &metricMonitorID, Project: project, OperationName: "deleted", OperationDescription: "Monitor alerts will no longer be sent to this channel.", IncludeEditLink: false}); err != nil {
		log.Error(err)
	}

	return metricMonitor, nil
}

func (r *mutationResolver) UpdateSessionFeedbackAlert(ctx context.Context, projectID int, sessionFeedbackAlertID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, disabled bool) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	var projectAlert *model.SessionAlert
	if err := r.DB.Where(&model.SessionAlert{Model: model.Model{ID: sessionFeedbackAlertID}}).Find(&projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error querying session feedback alert")
	}

	var sanitizedChannels []*modelInputs.SanitizedSlackChannel
	// For each of the new Slack channels, confirm that they exist in the "IntegratedSlackChannels" string.
	for _, ch := range slackChannels {
		sanitizedChannels = append(sanitizedChannels, &modelInputs.SanitizedSlackChannel{WebhookChannel: ch.WebhookChannelName, WebhookChannelID: ch.WebhookChannelID})
	}

	envBytes, err := json.Marshal(environments)
	if err != nil {
		return nil, e.Wrap(err, "error parsing environments")
	}
	envString := string(envBytes)

	channelsBytes, err := json.Marshal(sanitizedChannels)
	if err != nil {
		return nil, e.Wrap(err, "error parsing channels")
	}
	channelsString := string(channelsBytes)

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	projectAlert.ChannelsToNotify = &channelsString
	projectAlert.EmailsToNotify = emailsString
	projectAlert.ExcludedEnvironments = &envString
	projectAlert.CountThreshold = countThreshold
	projectAlert.ThresholdWindow = &thresholdWindow
	projectAlert.Name = &name
	projectAlert.LastAdminToEditID = admin.ID
	projectAlert.Disabled = &disabled
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionFeedbackAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields")
	}

	if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionFeedbackAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return projectAlert, nil
}

func (r *mutationResolver) CreateSessionFeedbackAlert(ctx context.Context, projectID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envString, err := r.MarshalEnvironments(environments)
	if err != nil {
		return nil, err
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			CountThreshold:       countThreshold,
			ThresholdWindow:      &thresholdWindow,
			Type:                 &model.AlertType.SESSION_FEEDBACK,
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 &name,
			LastAdminToEditID:    admin.ID,
		},
	}

	if err := r.DB.Create(newAlert).Error; err != nil {
		return nil, e.Wrap(err, "error creating a new session feedback alert")
	}
	if err := newAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &newAlert.ID, Project: project, OperationName: "created", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}

	return newAlert, nil
}

func (r *mutationResolver) UpdateRageClickAlert(ctx context.Context, projectID int, rageClickAlertID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, disabled bool) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	projectAlert := &model.SessionAlert{}
	if err := r.DB.Where(&model.SessionAlert{Model: model.Model{ID: rageClickAlertID}}).Find(&projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error querying rage click alert")
	}

	envString, err := r.MarshalEnvironments(environments)
	if err != nil {
		return nil, err
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	projectAlert.ChannelsToNotify = channelsString
	projectAlert.EmailsToNotify = emailsString
	projectAlert.ExcludedEnvironments = envString
	projectAlert.CountThreshold = countThreshold
	projectAlert.ThresholdWindow = &thresholdWindow
	projectAlert.Name = &name
	projectAlert.LastAdminToEditID = admin.ID
	projectAlert.Disabled = &disabled
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: rageClickAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields")
	}
	if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &rageClickAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return projectAlert, nil
}

func (r *mutationResolver) UpdateNewUserAlert(ctx context.Context, projectID int, sessionAlertID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, disabled bool) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	projectAlert := &model.SessionAlert{}
	if err := r.DB.Where(&model.SessionAlert{Model: model.Model{ID: sessionAlertID}}).Where("type=?", model.AlertType.NEW_USER).Find(&projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error querying session alert")
	}

	var sanitizedChannels []*modelInputs.SanitizedSlackChannel
	// For each of the new slack channels, confirm that they exist in the "IntegratedSlackChannels" string.
	for _, ch := range slackChannels {
		sanitizedChannels = append(sanitizedChannels, &modelInputs.SanitizedSlackChannel{WebhookChannel: ch.WebhookChannelName, WebhookChannelID: ch.WebhookChannelID})
	}

	envBytes, err := json.Marshal(environments)
	if err != nil {
		return nil, e.Wrap(err, "error parsing environments")
	}
	envString := string(envBytes)

	channelsBytes, err := json.Marshal(sanitizedChannels)
	if err != nil {
		return nil, e.Wrap(err, "error parsing channels")
	}
	channelsString := string(channelsBytes)

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	projectAlert.ChannelsToNotify = &channelsString
	projectAlert.EmailsToNotify = emailsString
	projectAlert.ExcludedEnvironments = &envString
	projectAlert.CountThreshold = countThreshold
	projectAlert.Name = &name
	projectAlert.LastAdminToEditID = admin.ID
	projectAlert.Disabled = &disabled
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields")
	}
	if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return projectAlert, nil
}

func (r *mutationResolver) CreateNewUserAlert(ctx context.Context, projectID int, name string, countThreshold int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, thresholdWindow int) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envString, err := r.MarshalEnvironments(environments)
	if err != nil {
		return nil, err
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			ThresholdWindow:      &thresholdWindow,
			CountThreshold:       countThreshold,
			Type:                 &model.AlertType.NEW_USER,
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 &name,
			LastAdminToEditID:    admin.ID,
		},
	}

	if err := r.DB.Create(newAlert).Error; err != nil {
		return nil, e.Wrap(err, "error creating a new new user alert")
	}
	if err := newAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &newAlert.ID, Project: project, OperationName: "created", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}

	return newAlert, nil
}

func (r *mutationResolver) UpdateTrackPropertiesAlert(ctx context.Context, projectID int, sessionAlertID int, name string, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, trackProperties []*modelInputs.TrackPropertyInput, thresholdWindow int, disabled bool) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envBytes, err := json.Marshal(environments)
	if err != nil {
		return nil, e.Wrap(err, "error parsing environments for track properties alert")
	}
	envString := string(envBytes)

	var sanitizedChannels []*modelInputs.SanitizedSlackChannel
	// For each of the new slack channels, confirm that they exist in the "IntegratedSlackChannels" string.
	for _, ch := range slackChannels {
		sanitizedChannels = append(sanitizedChannels, &modelInputs.SanitizedSlackChannel{WebhookChannel: ch.WebhookChannelName, WebhookChannelID: ch.WebhookChannelID})
	}

	channelsBytes, err := json.Marshal(sanitizedChannels)
	if err != nil {
		return nil, e.Wrap(err, "error parsing channels for track properties alert")
	}
	channelsString := string(channelsBytes)

	trackPropertiesBytes, err := json.Marshal(trackProperties)
	if err != nil {
		return nil, e.Wrap(err, "error parsing track properties for track properties alert")
	}
	trackPropertiesString := string(trackPropertiesBytes)

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	projectAlert := &model.SessionAlert{}
	projectAlert.ExcludedEnvironments = &envString
	projectAlert.ChannelsToNotify = &channelsString
	projectAlert.EmailsToNotify = emailsString
	projectAlert.TrackProperties = &trackPropertiesString
	projectAlert.Name = &name
	projectAlert.LastAdminToEditID = admin.ID
	projectAlert.Disabled = &disabled
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields for track properties alert")
	}
	if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return projectAlert, nil
}

func (r *mutationResolver) CreateTrackPropertiesAlert(ctx context.Context, projectID int, name string, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, trackProperties []*modelInputs.TrackPropertyInput, thresholdWindow int) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envString, err := r.MarshalEnvironments(environments)
	if err != nil {
		return nil, err
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	trackPropertiesBytes, err := json.Marshal(trackProperties)
	if err != nil {
		return nil, e.Wrap(err, "error parsing track properties for track properties alert")
	}
	trackPropertiesString := string(trackPropertiesBytes)

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			Type:                 &model.AlertType.TRACK_PROPERTIES,
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 &name,
			ThresholdWindow:      &thresholdWindow,
			LastAdminToEditID:    admin.ID,
		},
		TrackProperties: &trackPropertiesString,
	}

	if err := r.DB.Create(newAlert).Error; err != nil {
		return nil, e.Wrap(err, "error creating a new session track properties alert")
	}
	if err := newAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &newAlert.ID, Project: project, OperationName: "created", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}

	return newAlert, nil
}

func (r *mutationResolver) CreateUserPropertiesAlert(ctx context.Context, projectID int, name string, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, userProperties []*modelInputs.UserPropertyInput, thresholdWindow int) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envString, err := r.MarshalEnvironments(environments)
	if err != nil {
		return nil, err
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	userPropertiesBytes, err := json.Marshal(userProperties)
	if err != nil {
		return nil, e.Wrap(err, "error parsing user properties for user properties alert")
	}
	userPropertiesString := string(userPropertiesBytes)

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			Type:                 &model.AlertType.USER_PROPERTIES,
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 &name,
			ThresholdWindow:      &thresholdWindow,
			LastAdminToEditID:    admin.ID,
		},
		UserProperties: &userPropertiesString,
	}

	if err := r.DB.Create(newAlert).Error; err != nil {
		return nil, e.Wrap(err, "error creating a new user properties alert")
	}
	if err := newAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &newAlert.ID, Project: project, OperationName: "created", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}

	return newAlert, nil
}

func (r *mutationResolver) DeleteSessionAlert(ctx context.Context, projectID int, sessionAlertID int) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	projectAlert := &model.SessionAlert{}
	if err := r.DB.Where(&model.ErrorAlert{Model: model.Model{ID: sessionAlertID}, Alert: model.Alert{ProjectID: projectID}}).Find(&projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "this session alert does not exist in this project.")
	}

	if err := r.DB.Delete(projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error trying to delete session alert")
	}

	if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "deleted", OperationDescription: "Alerts will no longer be sent to this channel.", IncludeEditLink: false}); err != nil {
		log.Error(err)
	}

	return projectAlert, nil
}

func (r *mutationResolver) UpdateUserPropertiesAlert(ctx context.Context, projectID int, sessionAlertID int, name string, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, userProperties []*modelInputs.UserPropertyInput, thresholdWindow int, disabled bool) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envBytes, err := json.Marshal(environments)
	if err != nil {
		return nil, e.Wrap(err, "error parsing environments for user properties alert")
	}
	envString := string(envBytes)

	var sanitizedChannels []*modelInputs.SanitizedSlackChannel
	// For each of the new slack channels, confirm that they exist in the "IntegratedSlackChannels" string.
	for _, ch := range slackChannels {
		sanitizedChannels = append(sanitizedChannels, &modelInputs.SanitizedSlackChannel{WebhookChannel: ch.WebhookChannelName, WebhookChannelID: ch.WebhookChannelID})
	}

	channelsBytes, err := json.Marshal(sanitizedChannels)
	if err != nil {
		return nil, e.Wrap(err, "error parsing channels for user properties alert")
	}
	channelsString := string(channelsBytes)

	userPropertiesBytes, err := json.Marshal(userProperties)
	if err != nil {
		return nil, e.Wrap(err, "error parsing user properties for user properties alert")
	}
	userPropertiesString := string(userPropertiesBytes)

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	projectAlert := &model.SessionAlert{}
	projectAlert.ExcludedEnvironments = &envString
	projectAlert.ChannelsToNotify = &channelsString
	projectAlert.EmailsToNotify = emailsString
	projectAlert.UserProperties = &userPropertiesString
	projectAlert.Name = &name
	projectAlert.LastAdminToEditID = admin.ID
	projectAlert.Disabled = &disabled
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields for user properties alert")
	}
	if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return projectAlert, nil
}

func (r *mutationResolver) UpdateNewSessionAlert(ctx context.Context, projectID int, sessionAlertID int, name string, countThreshold int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, thresholdWindow int, excludeRules []*string, disabled bool) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envBytes, err := json.Marshal(environments)
	if err != nil {
		return nil, e.Wrap(err, "error parsing environments for new session alert")
	}
	envString := string(envBytes)

	excludeRulesString, err := r.MarshalEnvironments(excludeRules)
	if err != nil {
		return nil, err
	}

	var sanitizedChannels []*modelInputs.SanitizedSlackChannel
	// For each of the new slack channels, confirm that they exist in the "IntegratedSlackChannels" string.
	for _, ch := range slackChannels {
		sanitizedChannels = append(sanitizedChannels, &modelInputs.SanitizedSlackChannel{WebhookChannel: ch.WebhookChannelName, WebhookChannelID: ch.WebhookChannelID})
	}

	channelsBytes, err := json.Marshal(sanitizedChannels)
	if err != nil {
		return nil, e.Wrap(err, "error parsing channels for new session alert")
	}
	channelsString := string(channelsBytes)

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	projectAlert := &model.SessionAlert{}
	projectAlert.ExcludedEnvironments = &envString
	projectAlert.ChannelsToNotify = &channelsString
	projectAlert.EmailsToNotify = emailsString
	projectAlert.LastAdminToEditID = admin.ID
	projectAlert.Name = &name
	projectAlert.ThresholdWindow = &thresholdWindow
	projectAlert.ExcludeRules = excludeRulesString
	projectAlert.Disabled = &disabled
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(projectAlert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields for new session alert")
	}
	if err := projectAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return projectAlert, nil
}

func (r *mutationResolver) CreateNewSessionAlert(ctx context.Context, projectID int, name string, countThreshold int, slackChannels []*modelInputs.SanitizedSlackChannelInput, emails []*string, environments []*string, thresholdWindow int, excludeRules []*string) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	envString, err := r.MarshalEnvironments(environments)
	if err != nil {
		return nil, err
	}
	excludeRulesString, err := r.MarshalEnvironments(excludeRules)
	if err != nil {
		return nil, err
	}

	channelsString, err := r.MarshalSlackChannelsToSanitizedSlackChannels(slackChannels)
	if err != nil {
		return nil, err
	}

	emailsString, err := r.MarshalAlertEmails(emails)
	if err != nil {
		return nil, err
	}

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			Type:                 &model.AlertType.NEW_SESSION,
			ChannelsToNotify:     channelsString,
			EmailsToNotify:       emailsString,
			Name:                 &name,
			ThresholdWindow:      &thresholdWindow,
			LastAdminToEditID:    admin.ID,
		},
		ExcludeRules: excludeRulesString,
	}

	if err := r.DB.Create(newAlert).Error; err != nil {
		return nil, e.Wrap(err, "error creating a new user properties alert")
	}
	if err := newAlert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &newAlert.ID, Project: project, OperationName: "created", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}

	return newAlert, nil
}

func (r *mutationResolver) UpdateSessionIsPublic(ctx context.Context, sessionSecureID string, isPublic bool) (*model.Session, error) {
	session, err := r.canAdminModifySession(ctx, sessionSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	if err := r.DB.Model(session).Updates(&model.Session{
		IsPublic: &isPublic,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error updating session is_public")
	}

	if err := r.OpenSearch.Update(opensearch.IndexSessions, session.ID, map[string]interface{}{"is_public": isPublic}); err != nil {
		return nil, e.Wrap(err, "error updating session in opensearch")
	}

	return session, nil
}

func (r *mutationResolver) UpdateErrorGroupIsPublic(ctx context.Context, errorGroupSecureID string, isPublic bool) (*model.ErrorGroup, error) {
	errorGroup, err := r.canAdminModifyErrorGroup(ctx, errorGroupSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not authorized to modify error group")
	}
	if err := r.DB.Model(errorGroup).Update("IsPublic", isPublic).Error; err != nil {
		return nil, e.Wrap(err, "error updating error group is_public")
	}
	if err := r.OpenSearch.Update(opensearch.IndexErrorsCombined, errorGroup.ID, map[string]interface{}{
		"IsPublic": isPublic,
	}); err != nil {
		return nil, e.Wrap(err, "error updating error group IsPublic in OpenSearch")
	}

	return errorGroup, nil
}

func (r *mutationResolver) UpdateAllowMeterOverage(ctx context.Context, workspaceID int, allowMeterOverage bool) (*model.Workspace, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in workspace")
	}

	err = r.validateAdminRole(ctx)
	if err != nil {
		return nil, e.Wrap(err, "must have ADMIN role to modify meter overage settings")
	}

	if err := r.DB.Model(&workspace).Updates(map[string]interface{}{
		"AllowMeterOverage": allowMeterOverage,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error updating AllowMeterOverage")
	}

	return workspace, nil
}

func (r *mutationResolver) SubmitRegistrationForm(ctx context.Context, workspaceID int, teamSize string, role string, useCase string, heardAbout string, pun *string) (*bool, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in workspace")
	}

	registrationData := &model.RegistrationData{
		WorkspaceID: workspaceID,
		TeamSize:    &teamSize,
		Role:        &role,
		UseCase:     &useCase,
		HeardAbout:  &heardAbout,
		Pun:         pun,
	}

	if err := r.DB.Create(registrationData).Error; err != nil {
		return nil, e.Wrap(err, "error creating registration")
	}

	if workspace.EligibleForTrialExtension {
		if err := r.DB.Model(workspace).Updates(map[string]interface{}{
			"EligibleForTrialExtension": false,
			"TrialEndDate":              workspace.TrialEndDate.Add(7 * 24 * time.Hour), // add 7 days to the current end date
		}).Error; err != nil {
			return nil, e.Wrap(err, "error clearing EligibleForTrialExtension flag")
		}
	}

	return &model.T, nil
}

func (r *queryResolver) Accounts(ctx context.Context) ([]*modelInputs.Account, error) {
	if !r.isWhitelistedAccount(ctx) {
		return nil, e.New("You don't have access to this data")
	}

	accounts := []*modelInputs.Account{}
	if err := r.DB.Raw(`
		SELECT w.id, w.name, w.plan_tier, w.stripe_customer_id,
		COALESCE(SUM(case when sc.date >= COALESCE(w.billing_period_start, date_trunc('month', now(), 'UTC')) then count else 0 end), 0) as session_count_cur,
		COALESCE(SUM(case when sc.date >= COALESCE(w.billing_period_start, date_trunc('month', now(), 'UTC')) - interval '1 month' and sc.date < COALESCE(w.billing_period_start, date_trunc('month', now(), 'UTC')) then count else 0 end), 0) as session_count_prev,
		COALESCE(SUM(case when sc.date >= COALESCE(w.billing_period_start, date_trunc('month', now(), 'UTC')) - interval '2 months' and sc.date < COALESCE(w.billing_period_start, date_trunc('month', now(), 'UTC')) - interval '1 month' then count else 0 end), 0) as session_count_prev_prev,
		(select count(*) from workspace_admins wa where wa.workspace_id = w.id) as member_count
		FROM workspaces w
		INNER JOIN projects p
		ON p.workspace_id = w.id
		INNER JOIN daily_session_counts_view sc
		ON sc.project_id = p.id
		group by 1, 2
	`).Scan(&accounts).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving accounts for project")
	}

	subListParams := stripe.SubscriptionListParams{
		Status: string(stripe.SubscriptionStatusActive),
	}
	subListParams.AddExpand("data.customer")
	subListParams.Filters.AddFilter("limit", "", "100")
	var startingAfter *string
	var allSubs []*stripe.Subscription
	for {
		subListParams.StartingAfter = startingAfter
		subList := r.StripeClient.Subscriptions.List(&subListParams).SubscriptionList()
		allSubs = append(allSubs, subList.Data...)

		if !subList.HasMore {
			break
		}

		startingAfter = &subList.Data[len(subList.Data)-1].ID
	}
	subsByCustomer := lo.GroupBy(allSubs, func(sub *stripe.Subscription) string {
		return sub.Customer.ID
	})

	invoiceListParams := stripe.InvoiceListParams{
		Status: stripe.String(string(stripe.InvoiceStatusPaid)),
		CreatedRange: &stripe.RangeQueryParams{
			GreaterThan: time.Now().Add(-3 * 30 * 24 * time.Hour).Unix(),
		},
	}
	invoiceListParams.Filters.AddFilter("limit", "", "100")
	var allInvoices []*stripe.Invoice
	startingAfter = nil
	for {
		invoiceListParams.StartingAfter = startingAfter
		invoiceList := r.StripeClient.Invoices.List(&invoiceListParams).InvoiceList()
		allInvoices = append(allInvoices, invoiceList.Data...)

		if !invoiceList.HasMore {
			break
		}

		startingAfter = &invoiceList.Data[len(invoiceList.Data)-1].ID
	}
	invoicesByCustomer := lo.GroupBy(allInvoices, func(invoice *stripe.Invoice) string {
		return invoice.Customer.ID
	})

	for _, account := range accounts {
		subs, ok := subsByCustomer[account.StripeCustomerID]
		if ok {
			sort.Slice(subs, func(i, j int) bool {
				return subs[i].StartDate < subs[j].StartDate
			})
			start := time.Unix(subs[0].StartDate, 0)
			account.SubscriptionStart = &start
			account.Email = subs[0].Customer.Email
		}

		invoices, ok := invoicesByCustomer[account.StripeCustomerID]
		if ok {
			sort.Slice(invoices, func(i, j int) bool {
				return invoices[i].DueDate > invoices[j].DueDate
			})
			account.PaidPrev = int(invoices[0].AmountPaid)
			if len(invoices) > 1 {
				account.PaidPrevPrev = int(invoices[1].AmountPaid)
			}
		}

		planTier := modelInputs.PlanType(account.PlanTier)
		if account.SessionLimit == 0 {
			account.SessionLimit = pricing.TypeToQuota(planTier)
		}

		if account.MemberLimit == 0 {
			account.MemberLimit = pricing.TypeToMemberLimit(planTier)
		}
	}

	return accounts, nil
}

func (r *queryResolver) AccountDetails(ctx context.Context, workspaceID int) (*modelInputs.AccountDetails, error) {
	workspace, err := r.GetWorkspace(workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "error getting workspace info")
	}

	var queriedMonths = []struct {
		Sum   int
		Month string
	}{}
	if err := r.DB.Raw(`
	select SUM(count), to_char(date, 'yyyy-MM') as month 
	from daily_session_counts_view 
	where project_id in (select id from projects where projects.workspace_id = ?) 
	group by month
	order by month
	`, workspaceID).Scan(&queriedMonths).Error; err != nil {
		return nil, e.Errorf("error retrieving months: %v", err)
	}

	var queriedDays = []struct {
		Sum int
		Day string
	}{}
	if err := r.DB.Raw(`
	select SUM(count), to_char(date, 'MON-DD-YYYY') as day
	from daily_session_counts_view
	where project_id in (select id from projects where projects.workspace_id = ?) 
	group by date
	order by date
	`, workspaceID).Scan(&queriedDays).Error; err != nil {
		return nil, e.Errorf("error retrieving days: %v", err)
	}

	sessionCountsPerMonth := []*modelInputs.NamedCount{}
	sessionCountsPerDay := []*modelInputs.NamedCount{}
	for _, s := range queriedMonths {
		sessionCountsPerMonth = append(sessionCountsPerMonth, &modelInputs.NamedCount{Name: s.Month, Count: s.Sum})
	}
	for _, s := range queriedDays {
		sessionCountsPerDay = append(sessionCountsPerDay, &modelInputs.NamedCount{Name: s.Day, Count: s.Sum})
	}

	var stripeCustomerId string
	if workspace.StripeCustomerID != nil {
		stripeCustomerId = *workspace.StripeCustomerID
	}

	details := &modelInputs.AccountDetails{
		SessionCountPerMonth: sessionCountsPerMonth,
		SessionCountPerDay:   sessionCountsPerDay,
		Name:                 *workspace.Name,
		ID:                   workspace.ID,
		StripeCustomerID:     stripeCustomerId,
	}
	return details, nil
}

func (r *queryResolver) Session(ctx context.Context, secureID string) (*model.Session, error) {
	if util.IsDevEnv() && secureID == "repro" {
		sessionObj := &model.Session{}
		if err := r.DB.Preload("Fields").Where(&model.Session{Model: model.Model{ID: 0}}).First(&sessionObj).Error; err != nil {
			return nil, e.Wrap(err, "error reading from session")
		}
		return sessionObj, nil
	}

	s, err := r.canAdminViewSession(ctx, secureID)
	if err != nil {
		return nil, nil
	}
	sessionObj := &model.Session{}
	if err := r.DB.Preload("Fields").Where(&model.Session{Model: model.Model{ID: s.ID}}).First(&sessionObj).Error; err != nil {
		return nil, e.Wrap(err, "error reading from session")
	}
	return sessionObj, nil
}

func (r *queryResolver) Events(ctx context.Context, sessionSecureID string) ([]interface{}, error) {
	if util.IsDevEnv() && sessionSecureID == "repro" {
		file, err := ioutil.ReadFile("./tmp/events.json")
		if err != nil {
			return nil, e.Wrap(err, "Failed to read temp file")
		}
		var data []interface{}

		if err := json.Unmarshal([]byte(file), &data); err != nil {
			return nil, e.Wrap(err, "Failed to unmarshal data from file")
		}
		return data, nil
	}
	session, err := r.canAdminViewSession(ctx, sessionSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	events, err, _ := r.getEvents(ctx, session, EventsCursor{EventIndex: 0, EventObjectIndex: nil})
	return events, err
}

func (r *queryResolver) SessionIntervals(ctx context.Context, sessionSecureID string) ([]*model.SessionInterval, error) {
	if !(util.IsDevEnv() && sessionSecureID == "repro") {
		_, err := r.canAdminViewSession(ctx, sessionSecureID)
		if err != nil {
			return nil, e.Wrap(err, "admin not session owner")
		}
	}

	var sessionIntervals []*model.SessionInterval
	if res := r.DB.Order("start_time ASC").Where(&model.SessionInterval{SessionSecureID: sessionSecureID}).Find(&sessionIntervals); res.Error != nil {
		return nil, e.Wrap(res.Error, "failed to get session intervals")
	}

	return sessionIntervals, nil
}

func (r *queryResolver) TimelineIndicatorEvents(ctx context.Context, sessionSecureID string) ([]*model.TimelineIndicatorEvent, error) {
	if !(util.IsDevEnv() && sessionSecureID == "repro") {
		_, err := r.canAdminViewSession(ctx, sessionSecureID)
		if err != nil {
			return nil, e.Wrap(err, "admin not session owner")
		}
	}

	var timelineIndicatorEvents []*model.TimelineIndicatorEvent
	if res := r.DB.Order("timestamp ASC").Where(&model.TimelineIndicatorEvent{SessionSecureID: sessionSecureID}).Find(&timelineIndicatorEvents); res.Error != nil {
		return nil, e.Wrap(res.Error, "failed to get timeline indicator events")
	}

	return timelineIndicatorEvents, nil
}

func (r *queryResolver) RageClicks(ctx context.Context, sessionSecureID string) ([]*model.RageClickEvent, error) {
	if !(util.IsDevEnv() && sessionSecureID == "repro") {
		_, err := r.canAdminViewSession(ctx, sessionSecureID)
		if err != nil {
			return nil, e.Wrap(err, "admin not session owner")
		}
	}

	var rageClicks []*model.RageClickEvent
	if res := r.DB.Where(&model.RageClickEvent{SessionSecureID: sessionSecureID}).Find(&rageClicks); res.Error != nil {
		return nil, e.Wrap(res.Error, "failed to get rage clicks")
	}

	return rageClicks, nil
}

func (r *queryResolver) RageClicksForProject(ctx context.Context, projectID int, lookBackPeriod int) ([]*modelInputs.RageClickEventForProject, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	rageClicks := []*modelInputs.RageClickEventForProject{}

	rageClicksSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.RageClicksForProject"), tracer.Tag("project_id", projectID))
	if err := r.DB.Raw(`
	SELECT
		COALESCE(NULLIF(identifier, ''), CONCAT('#', fingerprint)) as identifier,
		rageClicks. *,
		user_properties
	FROM
		(
			SELECT
				DISTINCT session_secure_id,
				sum(total_clicks) as total_clicks
			FROM
				rage_click_events
			WHERE
				project_id = ?
				AND created_at >= NOW() - (? * INTERVAL '1 DAY')
			GROUP BY
				session_secure_id
		) AS rageClicks
		LEFT JOIN sessions s ON rageClicks.session_secure_id = s.secure_id
		WHERE s.excluded <> true
			AND session_secure_id IS NOT NULL
		ORDER BY total_clicks DESC
		LIMIT 100`,
		projectID, lookBackPeriod).Scan(&rageClicks).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving rage clicks for project")
	}
	rageClicksSpan.Finish()

	return rageClicks, nil
}

func (r *queryResolver) ErrorGroups(ctx context.Context, projectID int, count int, params *modelInputs.ErrorSearchParamsInput) (*model.ErrorResults, error) {
	endpointStart := time.Now()
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	errorGroups := []model.ErrorGroup{}
	selectPreamble := `SELECT id, secure_id, project_id, event, COALESCE(mapped_stack_trace, stack_trace) as stack_trace, metadata_log, created_at, deleted_at, updated_at, state`
	countPreamble := `SELECT COUNT(*)`

	queryString := `FROM error_groups `

	queryString += fmt.Sprintf("WHERE (project_id = %d) ", projectID)
	queryString += "AND (deleted_at IS NULL) "

	if d := params.DateRange; d != nil {
		queryString += andErrorGroupHasErrorObjectWhere(fmt.Sprintf(
			"(project_id=%d) AND (deleted_at IS NULL) AND (created_at > '%s') AND (created_at < '%s')",
			projectID,
			d.StartDate.Format("2006-01-02 15:04:05"),
			d.EndDate.Format("2006-01-02 15:04:05"),
		))
	}

	if state := params.State; state != nil {
		queryString += fmt.Sprintf("AND (state = '%s') ", state)
	}

	if params.Event != nil {
		queryString += fmt.Sprintf("AND (event ILIKE '%s') ", "%"+*params.Event+"%")
	}

	if params.Type != nil {
		queryString += fmt.Sprintf("AND (type = '%s')", *params.Type)
	}

	sessionFilters := []string{}

	sessionFilters = append(sessionFilters, "(sessions.excluded <> true)")

	if params.Browser != nil {
		sessionFilters = append(sessionFilters, fmt.Sprintf("(sessions.browser_name = '%s')", *params.Browser))
	}

	if params.Os != nil {
		sessionFilters = append(sessionFilters, fmt.Sprintf("(sessions.os_name = '%s')", *params.Os))
	}

	if params.VisitedURL != nil {
		sessionFilters = append(sessionFilters, SessionHasFieldsWhere(fmt.Sprintf("name = '%s' AND value = '%s'", "visited-url", *params.VisitedURL)))
	}

	if len(sessionFilters) > 0 {
		queryString += andErrorGroupHasSessionsWhere(strings.Join(sessionFilters, " AND "))
	}

	var g errgroup.Group
	var queriedErrorGroupsCount int64

	logTags := []string{fmt.Sprintf("project_id:%d", projectID)}
	g.Go(func() error {
		errorGroupSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
			tracer.ResourceName("db.errorGroups"), tracer.Tag("project_id", projectID))
		start := time.Now()
		query := fmt.Sprintf("%s %s ORDER BY updated_at DESC LIMIT %d", selectPreamble, queryString, count)
		if err := r.DB.Raw(query).Scan(&errorGroups).Error; err != nil {
			return e.Wrap(err, "error reading from error groups")
		}
		duration := time.Since(start)
		hlog.Timing("db.errorGroupsQuery.duration", duration, logTags, 1)
		if duration.Milliseconds() > 3000 {
			log.Error(e.New(fmt.Sprintf("errorGroupsQuery took %dms: %s", duration.Milliseconds(), query)))
		}
		errorGroupSpan.Finish()
		return nil
	})

	g.Go(func() error {
		errorGroupCountSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
			tracer.ResourceName("db.errorGroupsCount"), tracer.Tag("project_id", projectID))
		start := time.Now()
		query := fmt.Sprintf("%s %s", countPreamble, queryString)
		if err := r.DB.Raw(query).Scan(&queriedErrorGroupsCount).Error; err != nil {
			return e.Wrap(err, "error counting error groups")
		}
		duration := time.Since(start)
		hlog.Timing("db.errorGroupsQuery.duration", duration, logTags, 1)
		if duration.Milliseconds() > 3000 {
			log.Error(e.New(fmt.Sprintf("errorGroupsQuery took %dms: %s", duration.Milliseconds(), query)))
		}
		errorGroupCountSpan.Finish()
		return nil
	})

	// Waits for both goroutines to finish, then returns the first non-nil error (if any).
	if err := g.Wait(); err != nil {
		return nil, e.Wrap(err, "error querying error groups data")
	}

	errorResults := &model.ErrorResults{
		ErrorGroups: errorGroups,
		TotalCount:  queriedErrorGroupsCount,
	}
	endpointDuration := time.Since(endpointStart)
	hlog.Timing("gql.errorGroups.duration", endpointDuration, logTags, 1)
	hlog.Incr("gql.errorGroups.count", logTags, 1)
	if endpointDuration.Milliseconds() > 3000 {
		log.Error(e.New(fmt.Sprintf("gql.errorGroups took %dms: project_id: %d, params: %+v", endpointDuration.Milliseconds(), projectID, params)))
	}
	return errorResults, nil
}

func (r *queryResolver) ErrorGroupsOpensearch(ctx context.Context, projectID int, count int, query string) (*model.ErrorResults, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, nil
	}

	results := []opensearch.OpenSearchError{}
	options := opensearch.SearchOptions{
		MaxResults:    ptr.Int(count),
		SortField:     ptr.String("updated_at"),
		SortOrder:     ptr.String("desc"),
		ReturnCount:   ptr.Bool(true),
		ExcludeFields: []string{"FieldGroup", "fields"}, // Excluding certain fields for performance
	}

	resultCount, err := r.OpenSearch.Search([]opensearch.Index{opensearch.IndexErrorsCombined}, projectID, query, options, &results)
	if err != nil {
		return nil, err
	}

	asErrorGroups := []model.ErrorGroup{}
	for _, result := range results {
		asErrorGroups = append(asErrorGroups, *result.ToErrorGroup())
	}

	return &model.ErrorResults{
		ErrorGroups: asErrorGroups,
		TotalCount:  resultCount,
	}, nil
}

func (r *queryResolver) ErrorGroup(ctx context.Context, secureID string) (*model.ErrorGroup, error) {
	return r.canAdminViewErrorGroup(ctx, secureID, true)
}

func (r *queryResolver) Messages(ctx context.Context, sessionSecureID string) ([]interface{}, error) {
	s, err := r.canAdminViewSession(ctx, sessionSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	if en := s.ObjectStorageEnabled; en != nil && *en {
		objectStorageSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
			tracer.ResourceName("db.objectStorageQuery"), tracer.Tag("project_id", s.ProjectID))
		defer objectStorageSpan.Finish()
		ret, err := r.StorageClient.ReadMessagesFromS3(s.ID, s.ProjectID)
		if err != nil {
			return nil, e.Wrap(err, "error pulling messages from s3")
		}
		return ret, nil
	}
	messagesObj := []*model.MessagesObject{}
	if err := r.DB.Order("created_at desc").Where(&model.MessagesObject{SessionID: s.ID}).Find(&messagesObj).Error; err != nil {
		return nil, e.Wrap(err, "error reading from messages")
	}
	allEvents := make(map[string][]interface{})
	for _, messageObj := range messagesObj {
		subMessage := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(messageObj.Messages), &subMessage); err != nil {
			return nil, e.Wrap(err, "error decoding message data")
		}
		allEvents["messages"] = append(subMessage["messages"], allEvents["messages"]...)
	}
	return allEvents["messages"], nil
}

func (r *queryResolver) EnhancedUserDetails(ctx context.Context, sessionSecureID string) (*modelInputs.EnhancedUserDetailsResult, error) {
	s, err := r.canAdminViewSession(ctx, sessionSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	sessionObj := &model.Session{}
	// TODO: filter fields by type='user'.
	if err := r.DB.Preload("Fields").Where(&model.Session{Model: model.Model{ID: s.ID}}).First(&sessionObj).Error; err != nil {
		return nil, e.Wrap(err, "error reading from session")
	}
	details := &modelInputs.EnhancedUserDetailsResult{}
	details.Socials = []*modelInputs.SocialLink{}
	// We don't know what key is used for the user's email so we do a regex match
	// on all 'user' type fields.
	var email string
	for _, f := range sessionObj.Fields {
		if f.Type == "user" && regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`).MatchString(f.Value) {
			email = f.Value
		}
		if f.Type == "user" && f.Name == "email" {
			email = f.Value
		}
	}
	if len(email) > 0 {
		// Check if we already have this user's data in the db
		// If so, return it
		userDetailsModel := &model.EnhancedUserDetails{}
		p, co := clearbit.Person{}, clearbit.Company{}
		if err := r.DB.Where(&model.EnhancedUserDetails{Email: &email}).First(&userDetailsModel).Error; err != nil {
			log.Infof("retrieving api response for clearbit lookup")
			pc, _, err := r.ClearbitClient.Person.FindCombined(clearbit.PersonFindParams{Email: email})
			if err != nil {
				log.Errorf("error w/ clearbit request: %v", err)
			}
			p, co = pc.Person, pc.Company
			// Store the data for this email in the DB.
			r.PrivateWorkerPool.SubmitRecover(func() {
				log.Infof("caching response data in the db")
				modelToSave := &model.EnhancedUserDetails{}
				modelToSave.Email = &email
				if personBytes, err := json.Marshal(p); err == nil {
					sPersonBytes := string(personBytes)
					modelToSave.PersonJSON = &sPersonBytes
				} else {
					log.Errorf("error marshaling clearbit person: %v", err)
				}
				if companyBytes, err := json.Marshal(co); err == nil {
					sCompanyBytes := string(companyBytes)
					modelToSave.CompanyJSON = &sCompanyBytes
				} else {
					log.Errorf("error marshaling clearbit company: %v", err)
				}
				if err := r.DB.Create(modelToSave).Error; err != nil {
					log.Errorf("error creating clearbit details model")
				}
			})
		} else {
			log.Infof("retrieving db entry for clearbit lookup")
			if userDetailsModel.PersonJSON != nil && userDetailsModel.CompanyJSON != nil {
				if err := json.Unmarshal([]byte(*userDetailsModel.PersonJSON), &p); err != nil {
					log.Errorf("error unmarshaling person: %v", err)
				}
				if err := json.Unmarshal([]byte(*userDetailsModel.CompanyJSON), &co); err != nil {
					log.Errorf("error unmarshaling company: %v", err)
				}
			}
		}
		if twitterHandle := p.Twitter.Handle; twitterHandle != "" {
			twitterLink := fmt.Sprintf("https://twitter.com/%v", twitterHandle)
			details.Socials = append(details.Socials, &modelInputs.SocialLink{Link: &twitterLink, Type: modelInputs.SocialTypeTwitter})
		}
		if fbHandle := p.Facebook.Handle; fbHandle != "" {
			fbLink := fmt.Sprintf("https://www.facebook.com/%v", fbHandle)
			details.Socials = append(details.Socials, &modelInputs.SocialLink{Link: &fbLink, Type: modelInputs.SocialTypeFacebook})
		}
		if gHandle := p.GitHub.Handle; gHandle != "" {
			ghLink := fmt.Sprintf("https://www.github.com/%v", gHandle)
			details.Socials = append(details.Socials, &modelInputs.SocialLink{Link: &ghLink, Type: modelInputs.SocialTypeGithub})
		}
		if liHandle := p.LinkedIn.Handle; liHandle != "" {
			fbLink := fmt.Sprintf("https://www.linkedin.com/%v", liHandle)
			details.Socials = append(details.Socials, &modelInputs.SocialLink{Link: &fbLink, Type: modelInputs.SocialTypeLinkedIn})
		}
		if personalSiteLink, companySiteLink := p.Site, co.Domain; personalSiteLink != "" || companySiteLink != "" {
			site := personalSiteLink
			if personalSiteLink == "" {
				site = companySiteLink
			}
			details.Socials = append(details.Socials, &modelInputs.SocialLink{Link: &site, Type: modelInputs.SocialTypeSite})
		}
		details.Avatar = &p.Avatar
		details.Name = &p.Name.FullName
		details.Bio = &p.Bio
		details.Email = &email
	}
	return details, nil
}

func (r *queryResolver) Errors(ctx context.Context, sessionSecureID string) ([]*model.ErrorObject, error) {
	if util.IsDevEnv() && sessionSecureID == "repro" {
		errors := []*model.ErrorObject{}
		return errors, nil
	}
	s, err := r.canAdminViewSession(ctx, sessionSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	eventsQuerySpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.errorObjectsQuery"), tracer.Tag("project_id", s.ProjectID))
	defer eventsQuerySpan.Finish()
	errorsObj := []*model.ErrorObject{}
	if err := r.DB.Order("created_at asc").Where(&model.ErrorObject{SessionID: s.ID}).Find(&errorsObj).Error; err != nil {
		return nil, e.Wrap(err, "error reading from errors")
	}
	return errorsObj, nil
}

func (r *queryResolver) Resources(ctx context.Context, sessionSecureID string) ([]interface{}, error) {
	s, err := r.canAdminViewSession(ctx, sessionSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	if en := s.ObjectStorageEnabled; en != nil && *en {
		objectStorageSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
			tracer.ResourceName("db.objectStorageQuery"), tracer.Tag("project_id", s.ProjectID))
		defer objectStorageSpan.Finish()
		ret, err := r.StorageClient.ReadResourcesFromS3(s.ID, s.ProjectID)
		if err != nil {
			return nil, e.Wrap(err, "error pulling resources from s3")
		}
		return ret, nil
	}
	resourcesObject := []*model.ResourcesObject{}
	if err := r.DB.Order("created_at desc").Where(&model.ResourcesObject{SessionID: s.ID}).Find(&resourcesObject).Error; err != nil {
		return nil, e.Wrap(err, "error reading from resources")
	}
	allResources := make(map[string][]interface{})
	for _, resourceObj := range resourcesObject {
		subResources := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(resourceObj.Resources), &subResources); err != nil {
			return nil, e.Wrap(err, "error decoding resource data")
		}
		allResources["resources"] = append(subResources["resources"], allResources["resources"]...)
	}
	return allResources["resources"], nil
}

func (r *queryResolver) WebVitals(ctx context.Context, sessionSecureID string) ([]*model.Metric, error) {
	webVitals := []*model.Metric{}
	s, err := r.canAdminViewSession(ctx, sessionSecureID)
	if err != nil {
		return webVitals, nil
	}

	if err := r.DB.Where(&model.Metric{Type: "WebVital", SessionID: s.ID}).Find(&webVitals).Error; err != nil {
		log.Error(err)
		return webVitals, nil
	}

	return webVitals, nil
}

func (r *queryResolver) SessionComments(ctx context.Context, sessionSecureID string) ([]*model.SessionComment, error) {
	if util.IsDevEnv() && sessionSecureID == "repro" {
		sessionComments := []*model.SessionComment{}
		return sessionComments, nil
	}
	s, err := r.canAdminViewSession(ctx, sessionSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}

	sessionComments := []*model.SessionComment{}

	if err := r.DB.Preload("Attachments").Preload("Replies").Where(model.SessionComment{SessionId: s.ID}).Order("timestamp asc").Find(&sessionComments).Error; err != nil {
		return nil, e.Wrap(err, "error querying session comments for session")
	}
	return sessionComments, nil
}

func (r *queryResolver) SessionCommentTagsForProject(ctx context.Context, projectID int) ([]*model.SessionCommentTag, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in org for session comment tags")
	}

	var sessionCommentTags []*model.SessionCommentTag

	if err := r.DB.Where(&model.SessionCommentTag{ProjectID: projectID}).Find(&sessionCommentTags).Error; err != nil {
		return nil, e.Wrap(err, "error getting session comment tags")
	}

	return sessionCommentTags, nil
}

func (r *queryResolver) SessionCommentsForAdmin(ctx context.Context) ([]*model.SessionComment, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving user")
	}
	var sessionComments []*model.SessionComment
	if err := r.DB.Model(admin).Association("SessionComments").Find(&sessionComments); err != nil {
		return nil, e.Wrap(err, "error getting session comments for")
	}

	return sessionComments, nil
}

func (r *queryResolver) SessionCommentsForProject(ctx context.Context, projectID int) ([]*model.SessionComment, error) {
	var sessionComments []*model.SessionComment
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return sessionComments, nil
	}
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving user")
	}
	if err := r.DB.Model(model.SessionComment{}).Where("project_id = ? AND admin_id != ?", projectID, admin.ID).Find(&sessionComments).Error; err != nil {
		return sessionComments, e.Wrap(err, "error getting session comments for project")
	}

	return sessionComments, nil
}

func (r *queryResolver) ErrorComments(ctx context.Context, errorGroupSecureID string) ([]*model.ErrorComment, error) {
	errorGroup, err := r.canAdminViewErrorGroup(ctx, errorGroupSecureID, false)
	if err != nil {
		return nil, e.Wrap(err, "admin not error owner")
	}

	errorComments := []*model.ErrorComment{}
	if err := r.DB.Preload("Attachments").Preload("Replies").Where(model.ErrorComment{ErrorId: errorGroup.ID}).Order("created_at asc").Find(&errorComments).Error; err != nil {
		return nil, e.Wrap(err, "error querying error comments for error_group")
	}
	return errorComments, nil
}

func (r *queryResolver) ErrorCommentsForAdmin(ctx context.Context) ([]*model.ErrorComment, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving user")
	}
	var errorComments []*model.ErrorComment
	if err := r.DB.Model(admin).Association("ErrorComments").Find(&errorComments); err != nil {
		return nil, e.Wrap(err, "error getting error comments for admin")
	}

	return errorComments, nil
}

func (r *queryResolver) ErrorCommentsForProject(ctx context.Context, projectID int) ([]*model.ErrorComment, error) {
	var errorComments []*model.ErrorComment
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return errorComments, nil
	}

	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving user")
	}
	if err := r.DB.Model(model.ErrorComment{}).Where("project_id = ? AND admin_id != ?", projectID, admin.ID).Find(&errorComments).Error; err != nil {
		return errorComments, e.Wrap(err, "error getting error comments for project")
	}

	return errorComments, nil
}

func (r *queryResolver) WorkspaceAdmins(ctx context.Context, workspaceID int) ([]*model.Admin, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, nil
	}

	admins := []*model.Admin{}
	if err := r.DB.Order("created_at ASC").Model(workspace).Association("Admins").Find(&admins); err != nil {
		return nil, e.Wrap(err, "error getting admins for the workspace")
	}

	return admins, nil
}

func (r *queryResolver) WorkspaceAdminsByProjectID(ctx context.Context, projectID int) ([]*model.Admin, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, nil
	}

	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, nil
	}

	admins := []*model.Admin{}
	if err := r.DB.Order("created_at ASC").Model(workspace).Association("Admins").Find(&admins); err != nil {
		return nil, e.Wrap(err, "error getting admins for the workspace by project id")
	}

	return admins, nil
}

func (r *queryResolver) IsIntegrated(ctx context.Context, projectID int) (*bool, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, nil
	}
	var count int64
	err := r.DB.Model(&model.Session{}).Where("project_id = ?", projectID).Count(&count).Error
	if err != nil {
		return nil, e.Wrap(err, "error getting associated admins")
	}
	if count > 0 {
		return &model.T, nil
	}
	return &model.F, nil
}

func (r *queryResolver) IsBackendIntegrated(ctx context.Context, projectID int) (*bool, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, nil
	}
	var count int64
	err := r.DB.Model(&model.Project{}).Where("id = ? AND backend_setup=true", projectID).Count(&count).Error
	if err != nil {
		return nil, e.Wrap(err, "error getting projects with backend flag")
	}
	if count > 0 {
		return &model.T, nil
	}
	return &model.F, nil
}

func (r *queryResolver) UnprocessedSessionsCount(ctx context.Context, projectID int) (*int64, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	var count int64
	if err := r.DB.Model(&model.Session{}).Where("project_id = ?", projectID).Where(&model.Session{Processed: &model.F, Excluded: &model.F}).
		Count(&count).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving count of unprocessed sessions")
	}

	return &count, nil
}

func (r *queryResolver) LiveUsersCount(ctx context.Context, projectID int) (*int64, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	var count int64
	if err := r.DB.Raw(`
		SELECT COUNT(DISTINCT(COALESCE(NULLIF(identifier, ''), CAST(fingerprint AS text))))
		FROM sessions
		WHERE project_id = ?
		AND processed = false
		AND excluded = false
	`, projectID).Scan(&count).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving live users count")
	}

	return &count, nil
}

func (r *queryResolver) AdminHasCreatedComment(ctx context.Context, adminID int) (*bool, error) {
	if err := r.DB.Model(&model.SessionComment{}).Where(&model.SessionComment{
		AdminId: adminID,
	}).First(&model.SessionComment{}).Error; err != nil {
		return &model.F, nil
	}

	return &model.T, nil
}

func (r *queryResolver) ProjectHasViewedASession(ctx context.Context, projectID int) (*model.Session, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	session := model.Session{}
	if err := r.DB.Model(&session).Where("project_id = ?", projectID).Where(&model.Session{Viewed: &model.T, Excluded: &model.F}).First(&session).Error; err != nil {
		return &session, nil
	}
	return &session, nil
}

func (r *queryResolver) DailySessionsCount(ctx context.Context, projectID int, dateRange modelInputs.DateRangeInput) ([]*model.DailySessionCount, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	dailySessions := []*model.DailySessionCount{}

	startDateUTC := time.Date(dateRange.StartDate.UTC().Year(), dateRange.StartDate.UTC().Month(), dateRange.StartDate.UTC().Day(), 0, 0, 0, 0, time.UTC)
	endDateUTC := time.Date(dateRange.EndDate.UTC().Year(), dateRange.EndDate.UTC().Month(), dateRange.EndDate.UTC().Day(), 0, 0, 0, 0, time.UTC)

	if err := r.DB.Raw("SELECT * FROM daily_session_counts_view WHERE date BETWEEN ? AND ? AND project_id = ?", startDateUTC, endDateUTC, projectID).Find(&dailySessions).Error; err != nil {
		return nil, e.Wrap(err, "error reading from daily sessions")
	}

	return dailySessions, nil
}

func (r *queryResolver) DailyErrorsCount(ctx context.Context, projectID int, dateRange modelInputs.DateRangeInput) ([]*model.DailyErrorCount, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	dailyErrors := []*model.DailyErrorCount{}

	startDateUTC := time.Date(dateRange.StartDate.UTC().Year(), dateRange.StartDate.UTC().Month(), dateRange.StartDate.UTC().Day(), 0, 0, 0, 0, time.UTC)
	endDateUTC := time.Date(dateRange.EndDate.UTC().Year(), dateRange.EndDate.UTC().Month(), dateRange.EndDate.UTC().Day(), 0, 0, 0, 0, time.UTC)

	if err := r.DB.Where("project_id = ?", projectID).Where("date BETWEEN ? AND ?", startDateUTC, endDateUTC).Find(&dailyErrors).Error; err != nil {
		return nil, e.Wrap(err, "error reading from daily errors")
	}

	return dailyErrors, nil
}

func (r *queryResolver) DailyErrorFrequency(ctx context.Context, projectID int, errorGroupSecureID string, dateOffset int) ([]*int64, error) {
	errGroup, err := r.canAdminViewErrorGroup(ctx, errorGroupSecureID, false)
	if err != nil {
		return nil, e.Wrap(err, "admin is not authorized to view error group")
	}

	if projectID == 0 {
		// Make error distribution random for demo org so it looks pretty
		rand.Seed(int64(errGroup.ID))
		var dists []*int64
		for i := 0; i <= dateOffset; i++ {
			t := int64(rand.Intn(10) + 1)
			dists = append(dists, &t)
		}
		return dists, nil
	}

	var dailyErrors []*int64

	if err := r.DB.Raw(`
		SELECT COUNT(e.id)
		FROM (
			SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD') AS date
			FROM generate_series(0, ?, 1)
			AS offs
		) d LEFT OUTER JOIN
		error_objects e
		ON d.date = to_char(date_trunc('day', e.created_at), 'YYYY-MM-DD')
		AND e.error_group_id=? AND e.project_id=?
		GROUP BY d.date
		ORDER BY d.date ASC;
	`, dateOffset, errGroup.ID, projectID).Scan(&dailyErrors).Error; err != nil {
		return nil, e.Wrap(err, "error querying daily frequency")
	}

	return dailyErrors, nil
}

func (r *queryResolver) ErrorDistribution(ctx context.Context, projectID int, errorGroupSecureID string, property string) ([]*modelInputs.ErrorDistributionItem, error) {
	errGroup, err := r.canAdminViewErrorGroup(ctx, errorGroupSecureID, false)
	if err != nil {
		return nil, e.Wrap(err, "admin is not authorized to view error group")
	}

	if projectID == 0 {
		// Make error distribution random for demo org so it looks pretty
		rand.Seed(int64(errGroup.ID))
		dists := []*modelInputs.ErrorDistributionItem{}
		for i := 0; i <= 3; i++ {
			t := int64(rand.Intn(10) + 1)
			dists = append(dists, &modelInputs.ErrorDistributionItem{
				Name:  fmt.Sprintf("Property %d", i),
				Value: t,
			})
		}
		return dists, nil
	}

	errorDistribution := []*modelInputs.ErrorDistributionItem{}

	if err := r.DB.Raw(fmt.Sprintf(`
		SELECT %s as name, COUNT(*) as value FROM error_objects
		WHERE error_group_id=? AND project_id=?
		GROUP BY %s
		ORDER BY 2 DESC;
	`, property, property), errGroup.ID, projectID).Scan(&errorDistribution).Error; err != nil {
		return nil, e.Wrap(err, "error querying error distribution")
	}

	return errorDistribution, nil
}

func (r *queryResolver) Referrers(ctx context.Context, projectID int, lookBackPeriod int) ([]*modelInputs.ReferrerTablePayload, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	referrers := []*modelInputs.ReferrerTablePayload{}

	if err := r.DB.Raw(fmt.Sprintf("SELECT DISTINCT(value) as host, COUNT(value), count(value) * 100.0 / (select count(*) from fields where name='referrer' and project_id=%d and created_at >= NOW() - INTERVAL '%d DAY') as percent FROM (SELECT SUBSTRING(value from '(?:.*://)?(?:www\\.)?([^/]*)') AS value FROM fields WHERE name='referrer' AND project_id=%d AND created_at >= NOW() - INTERVAL '%d DAY') t1 GROUP BY value ORDER BY count desc LIMIT 200", projectID, lookBackPeriod, projectID, lookBackPeriod)).Scan(&referrers).Error; err != nil {
		return nil, e.Wrap(err, "error getting referrers")
	}

	return referrers, nil
}

func (r *queryResolver) NewUsersCount(ctx context.Context, projectID int, lookBackPeriod int) (*modelInputs.NewUsersCount, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	var count int64
	if err := r.DB.Raw(fmt.Sprintf("SELECT COUNT(*) FROM sessions WHERE project_id=%d AND first_time=true AND created_at >= NOW() - INTERVAL '%d DAY'", projectID, lookBackPeriod)).Scan(&count).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving count of first time users")
	}

	return &modelInputs.NewUsersCount{Count: count}, nil
}

func (r *queryResolver) TopUsers(ctx context.Context, projectID int, lookBackPeriod int) ([]*modelInputs.TopUsersPayload, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	var topUsersPayload = []*modelInputs.TopUsersPayload{}
	topUsersSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.topUsers"), tracer.Tag("project_id", projectID))
	if err := r.DB.Raw(`
	SELECT *
	FROM (
        SELECT
            DISTINCT ON(topUsers.identifier) topUsers.identifier,
            topUsers.id,
            total_active_time,
            active_time_percentage,
            s.user_properties
        FROM (
		SELECT
			identifier, (
				SELECT
					id
				FROM
					fields
				WHERE
					project_id = ?
					AND type = 'user'
					AND name = 'identifier'
					AND value = identifier
				LIMIT 1
			) AS id,
			SUM(active_length) as total_active_time,
			SUM(active_length) / (
				SELECT
					SUM(active_length)
				FROM
					sessions
				WHERE
					active_length IS NOT NULL
					AND project_id = ?
					AND identifier <> ''
					AND created_at >= NOW() - (? * INTERVAL '1 DAY')
					AND processed = true
					AND excluded <> true
			) AS active_time_percentage
		FROM (
			SELECT
				identifier,
				active_length,
				user_properties
			FROM
				sessions
			WHERE
				active_length IS NOT NULL
				AND project_id = ?
				AND identifier <> ''
				AND created_at >= NOW() - (? * INTERVAL '1 DAY')
				AND processed = true
				AND excluded <> true
		) q1
		GROUP BY identifier
		LIMIT 50
	) as topUsers
	INNER JOIN sessions s on topUsers.identifier = s.identifier
    ) as q2
	ORDER BY total_active_time DESC`,
		projectID, projectID, lookBackPeriod, projectID, lookBackPeriod).Scan(&topUsersPayload).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving top users")
	}
	topUsersSpan.Finish()

	return topUsersPayload, nil
}

func (r *queryResolver) AverageSessionLength(ctx context.Context, projectID int, lookBackPeriod int) (*modelInputs.AverageSessionLength, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}
	var length float64
	if err := r.DB.Raw(`
		SELECT
			COALESCE(avg(active_length), 0)
		FROM sessions
		WHERE project_id=?
			AND processed=true
			AND excluded <> true
			AND active_length IS NOT NULL
			AND created_at >= NOW() - (? * INTERVAL '1 DAY')
		`, projectID, lookBackPeriod).Scan(&length).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving average length for sessions")
	}

	return &modelInputs.AverageSessionLength{Length: length}, nil
}

func (r *queryResolver) UserFingerprintCount(ctx context.Context, projectID int, lookBackPeriod int) (*modelInputs.UserFingerprintCount, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	var count int64
	span, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.userFingerprintCount"), tracer.Tag("project_id", projectID))
	if err := r.DB.Raw(`
		SELECT
			COUNT(DISTINCT fingerprint)
		FROM sessions
		WHERE identifier=''
			AND excluded <> true
			AND fingerprint IS NOT NULL
			AND created_at >= NOW() - (? * INTERVAL '1 DAY')
			AND project_id=?
			AND length >= 1000
		`, lookBackPeriod, projectID).Scan(&count).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving user fingerprint count")
	}
	span.Finish()

	return &modelInputs.UserFingerprintCount{Count: count}, nil
}

func (r *queryResolver) Sessions(ctx context.Context, projectID int, count int, lifecycle modelInputs.SessionLifecycle, starred bool, params *modelInputs.SearchParamsInput) (*model.SessionResults, error) {
	endpointStart := time.Now()
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	sessionsQueryPreamble := "SELECT *"
	joinClause := "FROM sessions"

	fieldFilters, err := r.getFieldFilters(ctx, projectID, params)
	if err != nil {
		return nil, err
	}

	whereClause := ` `

	whereClause += fmt.Sprintf("WHERE (project_id = %d) ", projectID)
	whereClause += "AND (excluded <> true) "
	if lifecycle == modelInputs.SessionLifecycleCompleted {
		whereClause += fmt.Sprintf("AND (length > %d) ", 1000)
	}
	if starred {
		whereClause += "AND (starred = true) "
	}
	if firstTime := params.FirstTime; firstTime != nil && *firstTime {
		whereClause += "AND (first_time = true) "
	}
	if params.LengthRange != nil {
		if params.LengthRange.Min != nil {
			whereClause += fmt.Sprintf("AND (active_length >= %f) ", *params.LengthRange.Min*60000)
		}
		if params.LengthRange.Max != nil {
			if *params.LengthRange.Max != 60 && *params.LengthRange.Max != 0 {
				whereClause += fmt.Sprintf("AND (active_length <= %f) ", *params.LengthRange.Max*60000)
			}
		}
	}

	if lifecycle == modelInputs.SessionLifecycleCompleted {
		whereClause += "AND (processed = true) "
	} else if lifecycle == modelInputs.SessionLifecycleLive {
		whereClause += "AND (processed = false) "
	}
	whereClause += "AND (deleted_at IS NULL) "

	whereClause += fieldFilters
	if d := params.DateRange; d != nil {
		whereClause += fmt.Sprintf("AND (created_at > '%s') AND (created_at < '%s') ", d.StartDate.Format("2006-01-02 15:04:05"), d.EndDate.Format("2006-01-02 15:04:05"))
	}

	if os := params.Os; os != nil {
		whereClause += fmt.Sprintf("AND (os_name = '%s') ", *os)
	}

	if identified := params.Identified; identified != nil && *identified {
		whereClause += "AND (length(identifier) > 0) "
	}

	if viewed := params.HideViewed; viewed != nil && *viewed {
		whereClause += "AND (viewed = false OR viewed IS NULL) "
	}

	if browser := params.Browser; browser != nil {
		whereClause += fmt.Sprintf("AND (browser_name = '%s') ", *browser)
	}

	if deviceId := params.DeviceID; deviceId != nil {
		whereClause += fmt.Sprintf("AND (fingerprint = '%s') ", *deviceId)
	}

	if environments := params.Environments; len(environments) > 0 {
		environmentsClause := ""

		for index, environment := range environments {
			environmentsClause += fmt.Sprintf("environment = '%s'", *environment)

			if index < len(environments)-1 {
				environmentsClause += " OR "
			}
		}

		whereClause += fmt.Sprintf("AND (%s)", environmentsClause)
	}

	if appVersions := params.AppVersions; len(appVersions) > 0 {
		appVersionsClause := ""

		for index, appVersion := range appVersions {
			appVersionsClause += fmt.Sprintf("app_version = '%s'", *appVersion)

			if index < len(appVersions)-1 {
				appVersionsClause += " OR "
			}
		}

		whereClause += fmt.Sprintf("AND (%s)", appVersionsClause)
	}

	// user shouldn't see sessions that are not within billing quota
	whereClause += "AND (within_billing_quota IS NULL OR within_billing_quota=true) "

	filterCount := len(params.UserProperties) +
		len(params.ExcludedProperties) +
		len(params.TrackProperties) +
		len(params.ExcludedTrackProperties)
	if params.Referrer != nil {
		filterCount += 1
	}
	if params.VisitedURL != nil {
		filterCount += 1
	}

	var g errgroup.Group
	queriedSessions := []model.Session{}
	var queriedSessionsCount int64
	whereClauseSuffix := "AND NOT ((processed = true AND ((active_length IS NOT NULL AND (active_length >= 0 AND active_length < 1000)) OR (active_length IS NULL AND (length >= 0 AND length < 1000))))) "
	logTags := []string{
		fmt.Sprintf("project_id:%d", projectID),
		fmt.Sprintf("filtered:%t", fieldFilters != ""),
		fmt.Sprintf("filter_count:%d", filterCount)}

	g.Go(func() error {
		if params.LengthRange != nil {
			if params.LengthRange.Min != nil || params.LengthRange.Max != nil {
				whereClauseSuffix = "AND processed = true "
			}

		}
		whereClause += whereClauseSuffix
		sessionsSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
			tracer.ResourceName("db.sessionsQuery"), tracer.Tag("project_id", projectID))
		start := time.Now()
		query := fmt.Sprintf("%s %s %s ORDER BY created_at DESC LIMIT %d", sessionsQueryPreamble, joinClause, whereClause, count)
		if err := r.DB.Raw(query).Scan(&queriedSessions).Error; err != nil {
			return e.Wrapf(err, "error querying filtered sessions: %s", query)
		}
		duration := time.Since(start)
		hlog.Timing("db.sessionsQuery.duration", duration, logTags, 1)
		if duration.Milliseconds() > 3000 {
			log.Error(e.New(fmt.Sprintf("sessionsQuery took %dms: %s", duration.Milliseconds(), query)))
		}
		sessionsSpan.Finish()
		return nil
	})

	g.Go(func() error {
		sessionCountSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
			tracer.ResourceName("db.sessionsCountQuery"), tracer.Tag("project_id", projectID))
		start := time.Now()
		query := fmt.Sprintf("SELECT count(*) %s %s %s", joinClause, whereClause, whereClauseSuffix)
		if err := r.DB.Raw(query).Scan(&queriedSessionsCount).Error; err != nil {
			return e.Wrapf(err, "error querying filtered sessions count: %s", query)
		}
		duration := time.Since(start)
		hlog.Timing("db.sessionsCountQuery.duration", duration, logTags, 1)
		if duration.Milliseconds() > 3000 {
			log.Error(e.New(fmt.Sprintf("sessionsCountQuery took %dms: %s", duration.Milliseconds(), query)))
		}
		sessionCountSpan.Finish()
		return nil
	})

	// Waits for both goroutines to finish, then returns the first non-nil error (if any).
	if err := g.Wait(); err != nil {
		return nil, e.Wrap(err, "error querying session data")
	}

	sessionList := &model.SessionResults{
		Sessions:   queriedSessions,
		TotalCount: queriedSessionsCount,
	}

	endpointDuration := time.Since(endpointStart)
	hlog.Timing("gql.sessions.duration", endpointDuration, logTags, 1)
	hlog.Incr("gql.sessions.count", logTags, 1)
	if endpointDuration.Milliseconds() > 5000 {
		log.Error(e.New(fmt.Sprintf("gql.sessions took %dms: project_id: %d, params: %+v", endpointDuration.Milliseconds(), projectID, params)))
	}
	return sessionList, nil
}

func (r *queryResolver) SessionsOpensearch(ctx context.Context, projectID int, count int, query string, sortDesc bool) (*model.SessionResults, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, nil
	}

	results := []model.Session{}

	sortOrder := "desc"
	if !sortDesc {
		sortOrder = "asc"
	}

	options := opensearch.SearchOptions{
		MaxResults:    ptr.Int(count),
		SortField:     ptr.String("created_at"),
		SortOrder:     ptr.String(sortOrder),
		ReturnCount:   ptr.Bool(true),
		ExcludeFields: []string{"fields", "field_group"}, // Excluding certain fields for performance
	}
	q := fmt.Sprintf(`
	{"bool": {
		"must":[
			{"bool": {
				"must_not":[
					{"term":{"Excluded":true}},
					{"term":{"within_billing_quota":false}},
					{"bool": {
						"must":[
							{"term":{"processed":"true"}},
							{"bool":
								{"should": [
									{"range": {
										"active_length": {
											"lt": 1000
										}
									}},
									{"range": {
										"length": {
											"lt": 1000
										}
								  	}}
							  	]}
						  	}
					  	]
					}}
				]
			}},
			%s
		]
	}}`, query)
	resultCount, err := r.OpenSearch.Search([]opensearch.Index{opensearch.IndexSessions}, projectID, q, options, &results)
	if err != nil {
		return nil, err
	}

	return &model.SessionResults{
		Sessions:   results,
		TotalCount: resultCount,
	}, nil
}

func (r *queryResolver) FieldTypes(ctx context.Context, projectID int) ([]*model.Field, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, nil
	}

	res := []*model.Field{}

	if err := r.DB.Raw(`
		SELECT DISTINCT type, name
		FROM fields f
		WHERE project_id = ?
		AND type IS NOT null
		AND EXISTS (
			SELECT 1
			FROM session_fields sf
			WHERE f.id = sf.field_id
		)
	`, projectID).Scan(&res).Error; err != nil {
		return nil, e.Wrap(err, "error querying field types for project")
	}

	return res, nil
}

func (r *queryResolver) FieldsOpensearch(ctx context.Context, projectID int, count int, fieldType string, fieldName string, query string) ([]string, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, nil
	}

	var q string
	if query == "" {
		q = fmt.Sprintf(`
		{"bool":{"must":[
			{"term":{"Type.keyword":"%s"}},
			{"term":{"Name.keyword":"%s"}}
		]}}`, fieldType, fieldName)
	} else {
		q = fmt.Sprintf(`
		{"bool":{"must":[
			{"term":{"Type.keyword":"%s"}},
			{"term":{"Name.keyword":"%s"}},
			{"multi_match": {
				"query": "%s",
				"type": "bool_prefix",
				"fields": [
					"Value",
					"Value._2gram",
					"Value._3gram"
				]
			}}
		]}}`, fieldType, fieldName, query)
	}

	results := []*model.Field{}
	options := opensearch.SearchOptions{
		MaxResults: ptr.Int(count),
	}
	_, err = r.OpenSearch.Search([]opensearch.Index{opensearch.IndexFields}, projectID, q, options, &results)
	if err != nil {
		return nil, err
	}

	// Get all unique values from the returned fields
	valueMap := map[string]bool{}
	for _, result := range results {
		valueMap[result.Value] = true
	}
	values := []string{}
	for value := range valueMap {
		values = append(values, value)
	}

	return values, nil
}

func (r *queryResolver) ErrorFieldsOpensearch(ctx context.Context, projectID int, count int, fieldType string, fieldName string, query string) ([]string, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, nil
	}

	var q string
	if query == "" {
		q = fmt.Sprintf(`
		{"bool":{"must":[
			{"term":{"Name.keyword":"%s"}}
		]}}`, fieldName)
	} else {
		q = fmt.Sprintf(`
		{"bool":{"must":[
			{"term":{"Name.keyword":"%s"}},
			{"multi_match": {
				"query": "%s",
				"type": "bool_prefix",
				"fields": [
					"Value",
					"Value._2gram",
					"Value._3gram"
				]
			}}
		]}}`, fieldName, query)
	}

	results := []*model.ErrorField{}
	options := opensearch.SearchOptions{
		MaxResults: ptr.Int(count),
	}
	_, err = r.OpenSearch.Search([]opensearch.Index{opensearch.IndexErrorFields}, projectID, q, options, &results)
	if err != nil {
		return nil, err
	}

	// Get all unique values from the returned fields
	valueMap := map[string]bool{}
	for _, result := range results {
		valueMap[result.Value] = true
	}
	values := []string{}
	for value := range valueMap {
		values = append(values, value)
	}

	return values, nil
}

func (r *queryResolver) QuickFieldsOpensearch(ctx context.Context, projectID int, count int, query string) ([]*model.Field, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, nil
	}

	var q string
	if query == "" {
		q = `{"bool":{"must":[]}}`
	} else {
		q = fmt.Sprintf(`
		{"bool":{"must":[
			{"multi_match": {
				"query": "%s",
				"type": "bool_prefix",
				"fields": [
					"Value",
					"Value._2gram",
					"Value._3gram"
				]
			}}
		]}}`, query)
	}

	options := opensearch.SearchOptions{
		MaxResults: ptr.Int(count),
	}

	var g errgroup.Group
	results := []*model.Field{}
	errorResults := []*model.Field{}

	g.Go(func() error {
		_, err = r.OpenSearch.Search([]opensearch.Index{opensearch.IndexFields}, projectID, q, options, &results)
		if err != nil {
			return err
		}
		return nil
	})

	g.Go(func() error {
		_, err = r.OpenSearch.Search([]opensearch.Index{opensearch.IndexErrorFields}, projectID, q, options, &errorResults)
		if err != nil {
			return err
		}

		return nil
	})

	if err := g.Wait(); err != nil {
		return nil, e.Wrap(err, "error querying session or error fields")
	}

	for _, er := range errorResults {
		er.Type = "error-field"
		results = append(results, er)
	}

	return results, nil
}

func (r *queryResolver) BillingDetailsForProject(ctx context.Context, projectID int) (*modelInputs.BillingDetails, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, nil
	}

	var g errgroup.Group
	var queriedSessionsOutOfQuota int64
	g.Go(func() error {
		queriedSessionsOutOfQuota, err = pricing.GetProjectQuotaOverflow(ctx, r.DB, projectID)
		if err != nil {
			return e.Wrap(err, "error from get quota overflow")
		}
		return nil
	})

	var billingDetails *modelInputs.BillingDetails
	g.Go(func() error {
		billingDetails, err = r.BillingDetails(ctx, project.WorkspaceID)
		if err != nil {
			return e.Wrap(err, "error from get quota")
		}
		return nil
	})

	// Waits for both goroutines to finish, then returns the first non-nil error (if any).
	if err := g.Wait(); err != nil {
		return nil, e.Wrap(err, "error querying session data for billing details")
	}

	billingDetails.SessionsOutOfQuota = queriedSessionsOutOfQuota
	return billingDetails, nil
}

func (r *queryResolver) BillingDetails(ctx context.Context, workspaceID int) (*modelInputs.BillingDetails, error) {
	workspace, err := r.isAdminInWorkspaceOrDemoWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, nil
	}

	planType := modelInputs.PlanType(workspace.PlanTier)

	interval := modelInputs.SubscriptionIntervalMonthly
	if workspace.BillingPeriodStart != nil &&
		workspace.BillingPeriodEnd != nil &&
		workspace.BillingPeriodEnd.Sub(*workspace.BillingPeriodStart) >= time.Hour*24*32 {
		interval = modelInputs.SubscriptionIntervalAnnual
	}

	var g errgroup.Group
	var meter int64
	var membersMeter int64

	g.Go(func() error {
		meter, err = pricing.GetWorkspaceMeter(r.DB, workspaceID)
		if err != nil {
			return e.Wrap(err, "error from get quota")
		}
		return nil
	})

	g.Go(func() error {
		membersMeter = pricing.GetMembersMeter(r.DB, workspaceID)
		if err != nil {
			return e.Wrap(err, "error querying members meter")
		}
		return nil
	})

	// Waits for both goroutines to finish, then returns the first non-nil error (if any).
	if err := g.Wait(); err != nil {
		return nil, e.Wrap(err, "error querying session data for billing details")
	}

	sessionLimit := pricing.TypeToQuota(planType)
	// use monthly session limit if it exists
	if workspace.MonthlySessionLimit != nil {
		sessionLimit = *workspace.MonthlySessionLimit
	}

	membersLimit := pricing.TypeToMemberLimit(planType)
	if workspace.MonthlyMembersLimit != nil {
		membersLimit = *workspace.MonthlyMembersLimit
	}

	details := &modelInputs.BillingDetails{
		Plan: &modelInputs.Plan{
			Type:         modelInputs.PlanType(planType.String()),
			Quota:        sessionLimit,
			Interval:     interval,
			MembersLimit: membersLimit,
		},
		Meter:        meter,
		MembersMeter: membersMeter,
	}

	return details, nil
}

func (r *queryResolver) FieldSuggestion(ctx context.Context, projectID int, name string, query string) ([]*model.Field, error) {
	fields := []*model.Field{}
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return fields, nil
	}
	res := r.DB.Where(&model.Field{Name: name}).
		Where("project_id = ?", projectID).
		Where("length(value) > ?", 0).
		Where("value ILIKE ?", "%"+query+"%").
		Limit(model.SUGGESTION_LIMIT_CONSTANT).
		Find(&fields)
	if err := res.Error; err != nil {
		log.Error(err)
		return fields, nil
	}
	return fields, nil
}

func (r *queryResolver) PropertySuggestion(ctx context.Context, projectID int, query string, typeArg string) ([]*model.Field, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	fields := []*model.Field{}
	res := r.DB.Where(&model.Field{Type: typeArg}).Where("project_id = ?", projectID).Where(r.DB.
		Where(r.DB.Where("length(value) > ?", 0).Where("value ILIKE ?", "%"+query+"%")).
		Or(r.DB.Where("length(name) > ?", 0).Where("name ILIKE ?", "%"+query+"%"))).
		Limit(model.SUGGESTION_LIMIT_CONSTANT).
		Find(&fields)
	if err := res.Error; err != nil {
		return nil, e.Wrap(err, "error querying field suggestion")
	}
	return fields, nil
}

func (r *queryResolver) ErrorFieldSuggestion(ctx context.Context, projectID int, name string, query string) ([]*model.ErrorField, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	fields := []*model.ErrorField{}
	res := r.DB.Where(&model.ErrorField{Name: name}).
		Where("length(value) > ?", 0).
		Where("value ILIKE ?", "%"+query+"%").
		Where("project_id = ?", projectID).
		Limit(model.SUGGESTION_LIMIT_CONSTANT).
		Find(&fields)
	if err := res.Error; err != nil {
		return nil, e.Wrap(err, "error querying error field suggestion")
	}
	return fields, nil
}

func (r *queryResolver) Projects(ctx context.Context) ([]*model.Project, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving user")
	}

	projects := []*model.Project{}
	if err := r.DB.Order("name ASC").Model(&model.Project{}).Where(`
		id IN (
			SELECT project_id
			FROM project_admins
			WHERE admin_id = ?
			UNION
			SELECT id
			FROM projects p
			INNER JOIN workspace_admins wa
			ON p.workspace_id = wa.workspace_id
			AND wa.admin_id = ?
		)
	`, admin.ID, admin.ID).Scan(&projects).Error; err != nil {
		return nil, e.Wrap(err, "error getting associated projects")
	}

	return projects, nil
}

func (r *queryResolver) Workspaces(ctx context.Context) ([]*model.Workspace, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, nil
	}

	workspaces := []*model.Workspace{}
	if err := r.DB.Order("name ASC").Model(&admin).Association("Workspaces").Find(&workspaces); err != nil {
		return nil, e.Wrap(err, "error getting associated workspaces")
	}

	return workspaces, nil
}

func (r *queryResolver) WorkspacesCount(ctx context.Context) (int64, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return 0, e.Wrap(err, "error retrieving user")
	}

	var workspacesCount int64
	if err := r.DB.Table("workspace_admins").Where("admin_id=?", admin.ID).Count(&workspacesCount).Error; err != nil {
		return 0, e.Wrap(err, "error getting count of workspaces for admin")
	}

	domain, err := r.getCustomVerifiedAdminEmailDomain(admin)
	if err != nil {
		log.Error(err)
		return workspacesCount, nil
	}
	var joinableWorkspacesCount int64
	if err := r.DB.Raw(`
			SELECT COUNT(*)
			FROM workspaces
			WHERE id NOT IN (
					SELECT workspace_id
					FROM workspace_admins
					WHERE admin_id = ? )
				AND jsonb_exists(allowed_auto_join_email_origins::jsonb, LOWER(?))
		`, admin.ID, domain).Scan(&joinableWorkspacesCount).Error; err != nil {
		return 0, e.Wrap(err, "error getting count of joinable workspaces for admin")
	}

	return joinableWorkspacesCount + workspacesCount, nil
}

func (r *queryResolver) JoinableWorkspaces(ctx context.Context) ([]*model.Workspace, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error retrieving user")
	}
	domain, err := r.getCustomVerifiedAdminEmailDomain(admin)
	if err != nil {
		return nil, e.Wrap(err, "error getting custom verified admin email domain")
	}

	joinableWorkspaces := []*model.Workspace{}
	if err := r.DB.Raw(`
			SELECT *
			FROM workspaces
			WHERE id NOT IN (
			    SELECT workspace_id
			    FROM workspace_admins
			    WHERE admin_id = ?
			    )
				AND jsonb_exists(allowed_auto_join_email_origins::jsonb, LOWER(?))
			ORDER BY workspaces.name ASC
		`, admin.ID, domain).Find(&joinableWorkspaces).Error; err != nil {
		return nil, e.Wrap(err, "error getting joinable workspaces")
	}

	return joinableWorkspaces, nil
}

func (r *queryResolver) ErrorAlerts(ctx context.Context, projectID int) ([]*model.ErrorAlert, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	alerts := []*model.ErrorAlert{}
	if err := r.DB.Order("created_at asc").Model(&model.ErrorAlert{}).Where("project_id = ?", projectID).Find(&alerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying error alerts")
	}
	return alerts, nil
}

func (r *queryResolver) SessionFeedbackAlerts(ctx context.Context, projectID int) ([]*model.SessionAlert, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project on session feedback alerts")
	}
	var alerts []*model.SessionAlert
	if err := r.DB.Model(&model.SessionAlert{}).Where("project_id = ?", projectID).
		Where("type=?", model.AlertType.SESSION_FEEDBACK).Find(&alerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying session feedback alerts")
	}
	return alerts, nil
}

func (r *queryResolver) NewUserAlerts(ctx context.Context, projectID int) ([]*model.SessionAlert, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project on new user alerts")
	}
	var alerts []*model.SessionAlert
	if err := r.DB.Model(&model.SessionAlert{}).Where("project_id = ?", projectID).
		Where("type IS NULL OR type=?", model.AlertType.NEW_USER).Find(&alerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying new user alerts")
	}
	return alerts, nil
}

func (r *queryResolver) TrackPropertiesAlerts(ctx context.Context, projectID int) ([]*model.SessionAlert, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	var alerts []*model.SessionAlert
	if err := r.DB.Where(&model.SessionAlert{Alert: model.Alert{Type: &model.AlertType.TRACK_PROPERTIES}}).
		Where("project_id = ?", projectID).Find(&alerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying track properties alerts")
	}
	return alerts, nil
}

func (r *queryResolver) UserPropertiesAlerts(ctx context.Context, projectID int) ([]*model.SessionAlert, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	var alerts []*model.SessionAlert
	if err := r.DB.Where(&model.SessionAlert{Alert: model.Alert{Type: &model.AlertType.USER_PROPERTIES}}).
		Where("project_id = ?", projectID).Find(&alerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying user properties alerts")
	}
	return alerts, nil
}

func (r *queryResolver) NewSessionAlerts(ctx context.Context, projectID int) ([]*model.SessionAlert, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	var alerts []*model.SessionAlert
	if err := r.DB.Where(&model.SessionAlert{Alert: model.Alert{Type: &model.AlertType.NEW_SESSION}}).
		Where("project_id = ?", projectID).Find(&alerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying new session alerts")
	}
	return alerts, nil
}

func (r *queryResolver) RageClickAlerts(ctx context.Context, projectID int) ([]*model.SessionAlert, error) {
	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project on rage click alert")
	}
	var alerts []*model.SessionAlert
	if err := r.DB.Model(&model.SessionAlert{}).Where("project_id = ?", projectID).
		Where("type=?", model.AlertType.RAGE_CLICK).Find(&alerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying rage click alert")
	}
	return alerts, nil
}

func (r *queryResolver) ProjectSuggestion(ctx context.Context, query string) ([]*model.Project, error) {
	projects := []*model.Project{}
	if r.isWhitelistedAccount(ctx) {
		if err := r.DB.Model(&model.Project{}).Where("name ILIKE ?", "%"+query+"%").Find(&projects).Error; err != nil {
			return nil, e.Wrap(err, "error getting associated projects")
		}
	}
	return projects, nil
}

func (r *queryResolver) WorkspaceSuggestion(ctx context.Context, query string) ([]*model.Workspace, error) {
	workspaces := []*model.Workspace{}
	if r.isWhitelistedAccount(ctx) {
		if err := r.DB.Model(&model.Workspace{}).Where("name ILIKE ?", "%"+query+"%").Find(&workspaces).Error; err != nil {
			return nil, e.Wrap(err, "error getting workspace suggestions")
		}
	}
	return workspaces, nil
}

func (r *queryResolver) EnvironmentSuggestion(ctx context.Context, projectID int) ([]*model.Field, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	fields := []*model.Field{}
	res := r.DB.Where(&model.Field{Type: "session", Name: "environment"}).
		Where("project_id = ?", projectID).
		Where("length(value) > ?", 0).
		Distinct("value").
		Find(&fields)
	if err := res.Error; err != nil {
		return nil, e.Wrap(err, "error querying field suggestion")
	}
	return fields, nil
}

func (r *queryResolver) IdentifierSuggestion(ctx context.Context, projectID int) ([]*string, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	identifiers := []*string{}
	if err := r.DB.Raw(`
		SELECT
			DISTINCT identifier
		FROM sessions
		WHERE project_id=?
			AND identifier <> ''
			AND identifier IS NOT NULL
		ORDER BY identifier ASC
		`, projectID).Scan(&identifiers).Error; err != nil {
		return nil, e.Wrap(err, "error querying identifier suggestion")
	}
	return identifiers, nil
}

func (r *queryResolver) AppVersionSuggestion(ctx context.Context, projectID int) ([]*string, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	appVersions := []*string{}

	if err := r.DB.Raw("SELECT DISTINCT app_version FROM sessions WHERE app_version IS NOT NULL AND project_id = ?", projectID).Find(&appVersions).Error; err != nil {
		return nil, e.Wrap(err, "error getting app version suggestions")
	}

	return appVersions, nil
}

func (r *queryResolver) SlackChannelSuggestion(ctx context.Context, projectID int) ([]*modelInputs.SanitizedSlackChannel, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error getting project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, err
	}

	chs, err := workspace.IntegratedSlackChannels()
	if err != nil {
		return nil, e.Wrap(err, "error retrieving existing channels")
	}
	ret := []*modelInputs.SanitizedSlackChannel{}
	for _, ch := range chs {
		channel := ch.WebhookChannel
		channelID := ch.WebhookChannelID
		ret = append(ret, &modelInputs.SanitizedSlackChannel{
			WebhookChannel:   &channel,
			WebhookChannelID: &channelID,
		})
	}
	return ret, nil
}

func (r *queryResolver) SlackMembers(ctx context.Context, projectID int) ([]*modelInputs.SanitizedSlackChannel, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error getting project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, err
	}

	chs, err := workspace.IntegratedSlackChannels()
	if err != nil {
		return nil, e.Wrap(err, "error retrieving existing channels")
	}

	ret := []*modelInputs.SanitizedSlackChannel{}
	for _, ch := range chs {
		channel := ch.WebhookChannel
		channelID := ch.WebhookChannelID

		ret = append(ret, &modelInputs.SanitizedSlackChannel{
			WebhookChannel:   &channel,
			WebhookChannelID: &channelID,
		})
	}
	return ret, nil
}

func (r *queryResolver) GenerateZapierAccessToken(ctx context.Context, projectID int) (string, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return "", e.Wrap(err, "error querying project")
	}

	if project.ZapierAccessToken != nil {
		return "", e.New("zapier access token already exists, can't generate another jwt")
	}

	token, err := zapier.GenerateZapierAccessToken(project.ID)
	if err != nil {
		return "", e.Wrap(err, "error generating zapier access token")
	}

	return token, nil
}

func (r *queryResolver) IsIntegratedWith(ctx context.Context, integrationType modelInputs.IntegrationType, projectID int) (bool, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)

	if err != nil {
		return false, e.Wrap(err, "error querying project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return false, err
	}

	if integrationType == modelInputs.IntegrationTypeLinear {
		return workspace.LinearAccessToken != nil, nil
	} else if integrationType == modelInputs.IntegrationTypeSlack {
		return workspace.SlackAccessToken != nil, nil
	} else if integrationType == modelInputs.IntegrationTypeZapier {
		return project.ZapierAccessToken != nil, nil
	}

	return false, e.New("invalid integrationType")
}

func (r *queryResolver) Project(ctx context.Context, id int) (*model.Project, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, id)
	if err != nil {
		return nil, nil
	}
	return project, nil
}

func (r *queryResolver) Workspace(ctx context.Context, id int) (*model.Workspace, error) {
	workspace, err := r.isAdminInWorkspace(ctx, id)
	if err != nil {
		return nil, nil
	}

	projects := []model.Project{}
	if err := r.DB.Order("name ASC").Model(&workspace).Association("Projects").Find(&projects); err != nil {
		return nil, e.Wrap(err, "error querying associated projects")
	}

	workspace.Projects = projects
	return workspace, nil
}

func (r *queryResolver) WorkspaceInviteLinks(ctx context.Context, workspaceID int) (*model.WorkspaceInviteLink, error) {
	_, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, nil
	}

	var workspaceInviteLink *model.WorkspaceInviteLink
	shouldCreateNewInviteLink := false

	if err := r.DB.Where(&model.WorkspaceInviteLink{WorkspaceID: &workspaceID, InviteeEmail: nil}).Where("invitee_email IS NULL").Order("created_at desc").First(&workspaceInviteLink).Error; err != nil {
		if e.Is(err, gorm.ErrRecordNotFound) {
			shouldCreateNewInviteLink = true
		} else {
			return nil, e.Wrap(err, "error querying workspace invite links")
		}
	}

	if r.IsInviteLinkExpired(workspaceInviteLink) && !shouldCreateNewInviteLink {
		shouldCreateNewInviteLink = true
		if err := r.DB.Delete(workspaceInviteLink).Error; err != nil {
			return nil, e.Wrap(err, "error while deleting expired invite link for workspace")
		}
	}

	if workspaceInviteLink != nil && workspaceInviteLink.ExpirationDate != nil {
		// Create a new invite link if the current one expires within 7 days.
		daysRemainingForInvite := int(math.Abs(time.Now().UTC().Sub(*workspaceInviteLink.ExpirationDate).Hours() / 24))
		if daysRemainingForInvite <= 7 {
			shouldCreateNewInviteLink = true
		}

	}

	if shouldCreateNewInviteLink {
		workspaceInviteLink = r.CreateInviteLink(workspaceID, nil, model.AdminRole.ADMIN, true)

		if err := r.DB.Create(&workspaceInviteLink).Error; err != nil {
			return nil, e.Wrap(err, "failed to create new invite link to replace expired one.")
		}
	}

	return workspaceInviteLink, nil
}

func (r *queryResolver) WorkspaceForProject(ctx context.Context, projectID int) (*model.Workspace, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, nil
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "error querying workspace")
	}

	// workspace secret should not be visible unless the admin has workspace access
	workspace.Secret = new(string)

	projects := []model.Project{}
	if err := r.DB.Order("name ASC").Model(&workspace).Association("Projects").Find(&projects); err != nil {
		return nil, e.Wrap(err, "error querying associated projects")
	}

	workspace.Projects = projects
	return workspace, nil
}

func (r *queryResolver) Admin(ctx context.Context) (*model.Admin, error) {
	uid := fmt.Sprintf("%v", ctx.Value(model.ContextKeys.UID))
	adminSpan := tracer.StartSpan("resolver.getAdmin", tracer.ResourceName("db.admin"),
		tracer.Tag("admin_uid", uid))
	admin := &model.Admin{UID: &uid}
	if err := r.DB.Where(&model.Admin{UID: &uid}).First(&admin).Error; err != nil {
		firebaseSpan := tracer.StartSpan("resolver.getAdmin", tracer.ResourceName("db.createAdminFromFirebase"),
			tracer.Tag("admin_uid", uid))
		firebaseUser, err := AuthClient.GetUser(context.Background(), uid)
		if err != nil {
			spanError := e.Wrap(err, "error retrieving user from firebase api")
			firebaseSpan.Finish(tracer.WithError(spanError))
			adminSpan.Finish(tracer.WithError(spanError))
			return nil, spanError
		}
		newAdmin := &model.Admin{
			UID:           &uid,
			Name:          &firebaseUser.DisplayName,
			Email:         &firebaseUser.Email,
			PhotoURL:      &firebaseUser.PhotoURL,
			EmailVerified: &firebaseUser.EmailVerified,
		}
		if err := r.DB.Create(newAdmin).Error; err != nil {
			spanError := e.Wrap(err, "error creating new admin")
			adminSpan.Finish(tracer.WithError(spanError))
			return nil, spanError
		}
		firebaseSpan.Finish()
		r.PrivateWorkerPool.SubmitRecover(func() {
			if contact, err := apolloio.CreateContact(*newAdmin.Email); err != nil {
				log.Errorf("error creating apollo contact: %v", err)
			} else {
				sequenceID := "6105bc9bf2a2dd0112bdd26b" // represents the "New Authenticated Users" sequence.
				if err := apolloio.AddToSequence(contact.ID, sequenceID); err != nil {
					log.Errorf("error adding new contact to sequence: %v", err)
				}
			}
		})
		admin = newAdmin
	}
	if admin.PhotoURL == nil || admin.Name == nil {
		firebaseSpan := tracer.StartSpan("resolver.getAdmin", tracer.ResourceName("db.updateAdminFromFirebase"),
			tracer.Tag("admin_uid", uid))
		firebaseUser, err := AuthClient.GetUser(context.Background(), uid)
		if err != nil {
			spanError := e.Wrap(err, "error retrieving user from firebase api")
			adminSpan.Finish(tracer.WithError(spanError))
			firebaseSpan.Finish(tracer.WithError(spanError))
			return nil, spanError
		}
		if err := r.DB.Model(admin).Updates(&model.Admin{
			PhotoURL: &firebaseUser.PhotoURL,
			Name:     &firebaseUser.DisplayName,
		}).Error; err != nil {
			spanError := e.Wrap(err, "error updating org fields")
			adminSpan.Finish(tracer.WithError(spanError))
			firebaseSpan.Finish(tracer.WithError(spanError))
			return nil, spanError
		}
		admin.PhotoURL = &firebaseUser.PhotoURL
		admin.Name = &firebaseUser.DisplayName
		firebaseSpan.Finish()
	}

	// Check email verification status
	if admin.EmailVerified != nil && !*admin.EmailVerified {
		firebaseSpan := tracer.StartSpan("resolver.getAdmin", tracer.ResourceName("db.updateAdminFromFirebaseForEmailVerification"),
			tracer.Tag("admin_uid", uid))
		firebaseUser, err := AuthClient.GetUser(context.Background(), uid)
		if err != nil {
			spanError := e.Wrap(err, "error retrieving user from firebase api for email verification")
			adminSpan.Finish(tracer.WithError(spanError))
			firebaseSpan.Finish(tracer.WithError(spanError))
			return nil, spanError
		}
		if err := r.DB.Model(admin).Updates(&model.Admin{
			EmailVerified: &firebaseUser.EmailVerified,
		}).Error; err != nil {
			spanError := e.Wrap(err, "error updating admin fields")
			adminSpan.Finish(tracer.WithError(spanError))
			firebaseSpan.Finish(tracer.WithError(spanError))
			return nil, spanError
		}
		admin.EmailVerified = &firebaseUser.EmailVerified
		firebaseSpan.Finish()

	}
	adminSpan.Finish()
	return admin, nil
}

func (r *queryResolver) Segments(ctx context.Context, projectID int) ([]*model.Segment, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}
	// list of maps, where each map represents a field query.
	segments := []*model.Segment{}
	if err := r.DB.Model(model.Segment{}).Where("project_id = ?", projectID).Find(&segments).Error; err != nil {
		log.Errorf("error querying segments from project: %v", err)
	}
	return segments, nil
}

func (r *queryResolver) ErrorSegments(ctx context.Context, projectID int) ([]*model.ErrorSegment, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}
	// list of maps, where each map represents a field query.
	segments := []*model.ErrorSegment{}
	if err := r.DB.Model(model.ErrorSegment{}).Where("project_id = ?", projectID).Find(&segments).Error; err != nil {
		log.Errorf("error querying segments from project: %v", err)
	}
	return segments, nil
}

func (r *queryResolver) APIKeyToOrgID(ctx context.Context, apiKey string) (*int, error) {
	var projectId int
	if err := r.DB.Table("projects").Select("id").Where("secret=?", apiKey).Scan(&projectId).Error; err != nil {
		return nil, e.Wrap(err, "error getting project id from api key")
	}
	return &projectId, nil
}

func (r *queryResolver) CustomerPortalURL(ctx context.Context, workspaceID int) (string, error) {
	frontendUri := os.Getenv("FRONTEND_URI")

	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return "", e.Wrap(err, "admin does not have workspace access")
	}

	if err := r.validateAdminRole(ctx); err != nil {
		return "", e.Wrap(err, "must have ADMIN role to access the Stripe customer portal")
	}

	returnUrl := fmt.Sprintf("%s/w/%d/billing", frontendUri, workspaceID)

	params := &stripe.BillingPortalSessionParams{
		Customer:  workspace.StripeCustomerID,
		ReturnURL: &returnUrl,
	}

	portalSession, err := r.StripeClient.BillingPortalSessions.New(params)
	if err != nil {
		return "", e.Wrap(err, "error creating customer portal session")
	}

	return portalSession.URL, nil
}

func (r *queryResolver) SubscriptionDetails(ctx context.Context, workspaceID int) (*modelInputs.SubscriptionDetails, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, nil
	}

	if err := r.validateAdminRole(ctx); err != nil {
		return nil, e.Wrap(err, "must have ADMIN role to access the subscription details")
	}

	customerParams := &stripe.CustomerParams{}
	customerParams.AddExpand("subscriptions")
	c, err := r.StripeClient.Customers.Get(*workspace.StripeCustomerID, customerParams)
	if err != nil {
		return nil, e.Wrap(err, "error querying stripe customer")
	}

	if len(c.Subscriptions.Data) == 0 {
		return &modelInputs.SubscriptionDetails{}, nil
	}

	amount := c.Subscriptions.Data[0].Items.Data[0].Price.UnitAmount

	discount := c.Subscriptions.Data[0].Discount
	if discount == nil || discount.Coupon == nil {
		return &modelInputs.SubscriptionDetails{
			BaseAmount: amount,
		}, nil
	}

	return &modelInputs.SubscriptionDetails{
		BaseAmount:      amount,
		DiscountAmount:  discount.Coupon.AmountOff,
		DiscountPercent: discount.Coupon.PercentOff,
	}, nil
}

func (r *queryResolver) WebVitalDashboard(ctx context.Context, projectID int, webVitalName string, params modelInputs.WebVitalDashboardParamsInput) ([]*modelInputs.WebVitalDashboardPayload, error) {
	payload := []*modelInputs.WebVitalDashboardPayload{}
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return payload, nil
	}

	if err := r.DB.Raw(`
	SELECT
		created_at::date as date,
		AVG(value) as avg,
		percentile_cont(0.50) WITHIN GROUP (ORDER BY value) as p50,
		percentile_cont(0.75) WITHIN GROUP (ORDER BY value) as p75,
		percentile_cont(0.90) WITHIN GROUP (ORDER BY value) as p90,
		percentile_cont(0.99) WITHIN GROUP (ORDER BY value) as p99
	FROM metrics
	WHERE name=?
	AND project_id=?
	AND created_at >= ?
	AND created_at <= ?
	GROUP BY created_at::date, name;
	`, webVitalName, projectID, params.DateRange.StartDate, params.DateRange.EndDate).Scan(&payload).Error; err != nil {
		log.Error(err)
		return payload, nil
	}

	return payload, nil
}

func (r *queryResolver) MetricPreview(ctx context.Context, projectID int, typeArg modelInputs.MetricType, name string, aggregateFunction string) ([]*modelInputs.MetricPreview, error) {
	payload := []*modelInputs.MetricPreview{}
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return payload, nil
	}
	aggregateStatement := GetAggregateSQLStatement(aggregateFunction)

	if err := r.DB.Raw(fmt.Sprintf(`
	SELECT
		*
	from
		(
		SELECT
			date_trunc('minute', created_at) date,
			%s as value
		FROM
			metrics
		where
			name = '%s'
			and project_id = %d
			group by 1, name
		order by
			1 desc
		limit 100
		) as newestPoints
	order by
		date asc;
	`, aggregateStatement, name, projectID)).Scan(&payload).Error; err != nil {
		log.Error(err)
		return payload, nil
	}

	return payload, nil
}

func (r *queryResolver) MetricMonitors(ctx context.Context, projectID int) ([]*model.MetricMonitor, error) {
	metricMonitors := []*model.MetricMonitor{}

	_, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return metricMonitors, nil
	}

	if err := r.DB.Order("created_at asc").Model(&model.MetricMonitor{}).Where("project_id = ?", projectID).Find(&metricMonitors).Error; err != nil {
		return nil, e.Wrap(err, "error querying metric monitors")
	}
	return metricMonitors, nil
}

func (r *queryResolver) EventChunkURL(ctx context.Context, secureID string, index int) (string, error) {
	session, err := r.canAdminViewSession(ctx, secureID)
	if err != nil {
		return "", nil
	}

	str, err := r.StorageClient.GetDirectDownloadURL(session.ProjectID, session.ID, storage.SessionContentsCompressed, pointy.Int(index))
	if err != nil {
		return "", e.Wrap(err, "error getting direct download URL")
	}

	if str == nil {
		return "", e.Wrap(err, "nil direct download URL")
	}

	return *str, err
}

func (r *queryResolver) EventChunks(ctx context.Context, secureID string) ([]*model.EventChunk, error) {
	session, err := r.canAdminViewSession(ctx, secureID)
	if err != nil {
		return nil, nil
	}

	chunks := []*model.EventChunk{}
	if err := r.DB.Order("chunk_index ASC").Model(&model.EventChunk{}).Where(&model.EventChunk{SessionID: session.ID}).
		Scan(&chunks).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving event chunks from DB")
	}

	return chunks, nil
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

func (r *sessionResolver) DirectDownloadURL(ctx context.Context, obj *model.Session) (*string, error) {
	// Direct download only supported for clients that accept Brotli content encoding
	if !obj.DirectDownloadEnabled || !r.isBrotliAccepted(ctx) {
		return nil, nil
	}

	str, err := r.StorageClient.GetDirectDownloadURL(obj.ProjectID, obj.ID, storage.SessionContentsCompressed, nil)
	if err != nil {
		return nil, e.Wrap(err, "error getting direct download URL")
	}

	return str, err
}

func (r *sessionResolver) ResourcesURL(ctx context.Context, obj *model.Session) (*string, error) {
	// Direct download only supported for clients that accept Brotli content encoding
	if !obj.AllObjectsCompressed || !r.isBrotliAccepted(ctx) {
		return nil, nil
	}

	str, err := r.StorageClient.GetDirectDownloadURL(obj.ProjectID, obj.ID, storage.NetworkResourcesCompressed, nil)
	if err != nil {
		return nil, e.Wrap(err, "error getting resources URL")
	}

	return str, err
}

func (r *sessionResolver) MessagesURL(ctx context.Context, obj *model.Session) (*string, error) {
	// Direct download only supported for clients that accept Brotli content encoding
	if !obj.AllObjectsCompressed || !r.isBrotliAccepted(ctx) {
		return nil, nil
	}

	str, err := r.StorageClient.GetDirectDownloadURL(obj.ProjectID, obj.ID, storage.ConsoleMessagesCompressed, nil)
	if err != nil {
		return nil, e.Wrap(err, "error getting messages URL")
	}

	return str, err
}

func (r *sessionResolver) DeviceMemory(ctx context.Context, obj *model.Session) (*int, error) {
	var deviceMemory *int
	metric := &model.Metric{}

	if err := r.DB.Model(&model.Metric{}).Where(&model.Metric{
		Type:      modelInputs.MetricTypeDevice,
		Name:      "DeviceMemory",
		SessionID: obj.ID,
	}).First(&metric).Error; err != nil {
		if !e.Is(err, gorm.ErrRecordNotFound) {
			log.Error(err)
		}
	}

	if metric != nil {
		valueAsInt := int(metric.Value)
		deviceMemory = &valueAsInt
	}

	return deviceMemory, nil
}

func (r *sessionAlertResolver) ChannelsToNotify(ctx context.Context, obj *model.SessionAlert) ([]*modelInputs.SanitizedSlackChannel, error) {
	return obj.GetChannelsToNotify()
}

func (r *sessionAlertResolver) EmailsToNotify(ctx context.Context, obj *model.SessionAlert) ([]*string, error) {
	return obj.GetEmailsToNotify()
}

func (r *sessionAlertResolver) ExcludedEnvironments(ctx context.Context, obj *model.SessionAlert) ([]*string, error) {
	return obj.GetExcludedEnvironments()
}

func (r *sessionAlertResolver) TrackProperties(ctx context.Context, obj *model.SessionAlert) ([]*model.TrackProperty, error) {
	return obj.GetTrackProperties()
}

func (r *sessionAlertResolver) UserProperties(ctx context.Context, obj *model.SessionAlert) ([]*model.UserProperty, error) {
	return obj.GetUserProperties()
}

func (r *sessionAlertResolver) ExcludeRules(ctx context.Context, obj *model.SessionAlert) ([]*string, error) {
	return obj.GetExcludeRules()
}

func (r *sessionAlertResolver) DailyFrequency(ctx context.Context, obj *model.SessionAlert) ([]*int64, error) {
	var dailyAlerts []*int64
	if err := r.DB.Raw(`
		SELECT COUNT(e.id)
		FROM (
			SELECT to_char(date_trunc('day', (current_date - offs)), 'YYYY-MM-DD') AS date
			FROM generate_series(0, 6, 1)
			AS offs
		) d LEFT OUTER JOIN
		alert_events e
		ON d.date = to_char(date_trunc('day', e.created_at), 'YYYY-MM-DD')
			AND e.type=?
			AND e.alert_id=?
			AND e.project_id=?
		GROUP BY d.date
		ORDER BY d.date ASC;
	`, obj.Type, obj.ID, obj.ProjectID).Scan(&dailyAlerts).Error; err != nil {
		return nil, e.Wrap(err, "error querying daily alert frequency")
	}

	return dailyAlerts, nil
}

func (r *sessionCommentResolver) Author(ctx context.Context, obj *model.SessionComment) (*modelInputs.SanitizedAdmin, error) {
	admin := &model.Admin{}

	// This case happens when the feedback is provided by feedback mechanism.
	if obj.Type == modelInputs.SessionCommentTypeFeedback.String() {
		name := "Anonymous"
		email := ""

		if obj.Metadata != nil {
			if val, ok := obj.Metadata["name"]; ok {
				switch val.(type) {
				case string:
					name = fmt.Sprintf("%v", val)
				}
			}
			if val, ok := obj.Metadata["email"]; ok {
				switch val.(type) {
				case string:
					email = fmt.Sprintf("%v", val)
				}
			}

		}

		feedbackAdmin := &modelInputs.SanitizedAdmin{
			ID:    -1,
			Name:  &name,
			Email: email,
		}
		return feedbackAdmin, nil
	}

	if err := r.DB.Where(&model.Admin{Model: model.Model{ID: obj.AdminId}}).First(&admin).Error; err != nil {
		return nil, e.Wrap(err, "Error finding admin for comment")
	}

	return r.formatSanitizedAuthor(admin), nil
}

func (r *sessionCommentResolver) Type(ctx context.Context, obj *model.SessionComment) (modelInputs.SessionCommentType, error) {
	switch obj.Type {
	case model.SessionCommentTypes.ADMIN:
		return modelInputs.SessionCommentTypeAdmin, nil
	case model.SessionCommentTypes.FEEDBACK:
		return modelInputs.SessionCommentTypeFeedback, nil
	default:
		return modelInputs.SessionCommentTypeFeedback, e.New("invalid session comment type")
	}
}

func (r *sessionCommentResolver) Metadata(ctx context.Context, obj *model.SessionComment) (interface{}, error) {
	return obj.Metadata, nil
}

func (r *sessionCommentResolver) Tags(ctx context.Context, obj *model.SessionComment) ([]*string, error) {
	var (
		tags []sql.NullString
	)
	var tagsResponse []*string

	if err := r.DB.Raw(`
	SELECT
    array_agg(t.name)
FROM
    session_tags st
    JOIN session_comment_tags t ON t.id = st.session_comment_tag_id
WHERE
    st.session_comment_id = ?
GROUP BY
    st.session_comment_id`, obj.ID).Scan(&tags).Error; err != nil {
		log.Error(err, "Failed to query for session comment tags")
	}

	for i := range tags {
		temp, _ := tags[i].Value()
		tagValue, _ := temp.(string)
		tagValue = strings.Replace(tagValue, "\"", "", -1)
		tagValue = strings.Replace(tagValue, "\"", "", -1)
		tagValue = strings.Replace(tagValue, "{", "[\"", 1)
		tagValue = strings.Replace(tagValue, "}", "\"]", 1)
		tagValue = strings.Replace(tagValue, ",", "\",\"", -1)

		tagsResponse = append(tagsResponse, &tagValue)
	}

	return tagsResponse, nil
}

func (r *subscriptionResolver) SessionPayloadAppended(ctx context.Context, sessionSecureID string, initialEventsCount int) (<-chan *model.SessionPayload, error) {
	ch := make(chan *model.SessionPayload)
	r.SubscriptionWorkerPool.SubmitRecover(func() {
		defer close(ch)
		log.Infof("Polling for events on %s starting from index %d, number of waiting tasks %d",
			sessionSecureID,
			initialEventsCount,
			r.SubscriptionWorkerPool.WaitingQueueSize())

		cursor := EventsCursor{EventIndex: initialEventsCount, EventObjectIndex: nil}
		for {
			select {
			case <-ctx.Done():
				return
			default:
			}

			session, err := r.canAdminViewSession(ctx, sessionSecureID)
			if err != nil {
				log.Error(e.Wrap(err, "error fetching session for subscription"))
				return
			}
			events, err, nextCursor := r.getEvents(ctx, session, cursor)
			if err != nil {
				log.Error(e.Wrap(err, "error fetching events incrementally"))
				return
			}
			if len(events) != 0 {
				// TODO live updating for other event types
				ch <- &model.SessionPayload{
					Events:                  events,
					Errors:                  []model.ErrorObject{},
					RageClicks:              []model.RageClickEvent{},
					SessionComments:         []model.SessionComment{},
					LastUserInteractionTime: session.LastUserInteractionTime,
				}
			}
			cursor = *nextCursor

			time.Sleep(1 * time.Second)
		}
	})
	return ch, nil
}

func (r *timelineIndicatorEventResolver) Data(ctx context.Context, obj *model.TimelineIndicatorEvent) (interface{}, error) {
	return obj.Data, nil
}

// CommentReply returns generated.CommentReplyResolver implementation.
func (r *Resolver) CommentReply() generated.CommentReplyResolver { return &commentReplyResolver{r} }

// ErrorAlert returns generated.ErrorAlertResolver implementation.
func (r *Resolver) ErrorAlert() generated.ErrorAlertResolver { return &errorAlertResolver{r} }

// ErrorComment returns generated.ErrorCommentResolver implementation.
func (r *Resolver) ErrorComment() generated.ErrorCommentResolver { return &errorCommentResolver{r} }

// ErrorGroup returns generated.ErrorGroupResolver implementation.
func (r *Resolver) ErrorGroup() generated.ErrorGroupResolver { return &errorGroupResolver{r} }

// ErrorObject returns generated.ErrorObjectResolver implementation.
func (r *Resolver) ErrorObject() generated.ErrorObjectResolver { return &errorObjectResolver{r} }

// ErrorSegment returns generated.ErrorSegmentResolver implementation.
func (r *Resolver) ErrorSegment() generated.ErrorSegmentResolver { return &errorSegmentResolver{r} }

// Metric returns generated.MetricResolver implementation.
func (r *Resolver) Metric() generated.MetricResolver { return &metricResolver{r} }

// MetricMonitor returns generated.MetricMonitorResolver implementation.
func (r *Resolver) MetricMonitor() generated.MetricMonitorResolver { return &metricMonitorResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Segment returns generated.SegmentResolver implementation.
func (r *Resolver) Segment() generated.SegmentResolver { return &segmentResolver{r} }

// Session returns generated.SessionResolver implementation.
func (r *Resolver) Session() generated.SessionResolver { return &sessionResolver{r} }

// SessionAlert returns generated.SessionAlertResolver implementation.
func (r *Resolver) SessionAlert() generated.SessionAlertResolver { return &sessionAlertResolver{r} }

// SessionComment returns generated.SessionCommentResolver implementation.
func (r *Resolver) SessionComment() generated.SessionCommentResolver {
	return &sessionCommentResolver{r}
}

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

// TimelineIndicatorEvent returns generated.TimelineIndicatorEventResolver implementation.
func (r *Resolver) TimelineIndicatorEvent() generated.TimelineIndicatorEventResolver {
	return &timelineIndicatorEventResolver{r}
}

type commentReplyResolver struct{ *Resolver }
type errorAlertResolver struct{ *Resolver }
type errorCommentResolver struct{ *Resolver }
type errorGroupResolver struct{ *Resolver }
type errorObjectResolver struct{ *Resolver }
type errorSegmentResolver struct{ *Resolver }
type metricResolver struct{ *Resolver }
type metricMonitorResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type segmentResolver struct{ *Resolver }
type sessionResolver struct{ *Resolver }
type sessionAlertResolver struct{ *Resolver }
type sessionCommentResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
type timelineIndicatorEventResolver struct{ *Resolver }
