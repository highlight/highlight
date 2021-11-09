package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/clearbit/clearbit-go/clearbit"
	"github.com/highlight-run/highlight/backend/apolloio"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/pricing"
	"github.com/highlight-run/highlight/backend/private-graph/graph/generated"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	e "github.com/pkg/errors"
	"github.com/rs/xid"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	log "github.com/sirupsen/logrus"
	"github.com/slack-go/slack"
	stripe "github.com/stripe/stripe-go"
	"golang.org/x/sync/errgroup"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

func (r *errorAlertResolver) ChannelsToNotify(ctx context.Context, obj *model.ErrorAlert) ([]*modelInputs.SanitizedSlackChannel, error) {
	return obj.GetChannelsToNotify()
}

func (r *errorAlertResolver) ExcludedEnvironments(ctx context.Context, obj *model.ErrorAlert) ([]*string, error) {
	return obj.GetExcludedEnvironments()
}

func (r *errorCommentResolver) Author(ctx context.Context, obj *model.ErrorComment) (*modelInputs.SanitizedAdmin, error) {
	admin := &model.Admin{}
	if err := r.DB.Where(&model.Admin{Model: model.Model{ID: obj.AdminId}}).First(&admin).Error; err != nil {
		return nil, e.Wrap(err, "Error finding admin for comment")
	}

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

	return sanitizedAdmin, nil
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
		ORDER BY s.updated_at DESC
		LIMIT 20;
	`, obj.ID).Scan(&metadataLogs)
	return metadataLogs, nil
}

func (r *errorGroupResolver) FieldGroup(ctx context.Context, obj *model.ErrorGroup) ([]*model.ErrorField, error) {
	if obj == nil || obj.FieldGroup == nil {
		return nil, nil
	}
	var fields []*model.ErrorField
	err := json.Unmarshal([]byte(*obj.FieldGroup), &fields)
	if err != nil {
		err := e.Wrap(err, "error converting field group to struct")
		return nil, err
	}
	var parsedFields []*model.ErrorField
	for _, f := range fields {
		if f.Name == "event" {
			continue
		}
		parsedFields = append(parsedFields, f)
	}
	return parsedFields, nil
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

func (r *mutationResolver) CreateProject(ctx context.Context, name string, workspaceID int) (*model.Project, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in the workspace")
	}

	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error getting admin")
	}

	project := &model.Project{
		Name:         &name,
		BillingEmail: admin.Email,
		WorkspaceID:  workspace.ID,
	}

	if err := r.DB.Create(project).Error; err != nil {
		return nil, e.Wrap(err, "error creating project")
	}
	if err := r.DB.Create(
		&model.ErrorAlert{
			Alert: model.Alert{
				ProjectID:            project.ID,
				ExcludedEnvironments: nil,
				CountThreshold:       1,
				ChannelsToNotify:     nil,
				Type:                 &model.AlertType.ERROR,
				ThresholdWindow:      util.MakeIntPointer(30),
			},
		}).Error; err != nil {
		return nil, e.Wrap(err, "error creating error alert for new project")
	}
	if err := r.DB.Create(
		&model.SessionAlert{
			Alert: model.Alert{
				ProjectID:            project.ID,
				ExcludedEnvironments: nil,
				CountThreshold:       1,
				ChannelsToNotify:     nil,
				Type:                 &model.AlertType.SESSION_FEEDBACK,
				ThresholdWindow:      util.MakeIntPointer(30),
			},
		}).Error; err != nil {
		return nil, e.Wrap(err, "error creating session feedback alert for new project")
	}
	if err := r.DB.Create(
		&model.SessionAlert{
			Alert: model.Alert{
				ProjectID:            project.ID,
				ExcludedEnvironments: nil,
				CountThreshold:       1,
				ChannelsToNotify:     nil,
				Type:                 &model.AlertType.NEW_USER,
				ThresholdWindow:      util.MakeIntPointer(0),
			},
		}).Error; err != nil {
		return nil, e.Wrap(err, "error creating session new user alert for new project")
	}
	if err := r.DB.Create(
		&model.SessionAlert{
			Alert: model.Alert{
				ProjectID:            project.ID,
				ExcludedEnvironments: nil,
				CountThreshold:       1,
				ChannelsToNotify:     nil,
				Type:                 &model.AlertType.TRACK_PROPERTIES,
				ThresholdWindow:      util.MakeIntPointer(0),
			},
		}).Error; err != nil {
		return nil, e.Wrap(err, "error creating session track properties alert for new project")
	}
	if err := r.DB.Create(
		&model.SessionAlert{
			Alert: model.Alert{
				ProjectID:            project.ID,
				ExcludedEnvironments: nil,
				CountThreshold:       1,
				ChannelsToNotify:     nil,
				Type:                 &model.AlertType.USER_PROPERTIES,
				ThresholdWindow:      util.MakeIntPointer(0),
			},
		}).Error; err != nil {
		return nil, e.Wrap(err, "error creating session user properties alert for new project")
	}
	if err := r.DB.Create(
		&model.SessionAlert{
			Alert: model.Alert{
				ProjectID:            project.ID,
				ExcludedEnvironments: nil,
				CountThreshold:       1,
				ChannelsToNotify:     nil,
				Type:                 &model.AlertType.RAGE_CLICK,
				ThresholdWindow:      util.MakeIntPointer(30),
			},
		}).Error; err != nil {
		return nil, e.Wrap(err, "error creating session rage click alert for new project")
	}

	if err := r.DB.Create(
		&model.SessionAlert{
			Alert: model.Alert{
				ProjectID:            project.ID,
				ExcludedEnvironments: nil,
				CountThreshold:       1,
				ChannelsToNotify:     nil,
				Type:                 &model.AlertType.NEW_SESSION,
				ThresholdWindow:      util.MakeIntPointer(0),
			},
		}).Error; err != nil {
		return nil, e.Wrap(err, "error creating session user properties alert for new project")
	}
	return project, nil
}

func (r *mutationResolver) CreateWorkspace(ctx context.Context, name string) (*model.Workspace, error) {
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error getting admin")
	}

	workspace := &model.Workspace{
		Admins: []model.Admin{*admin},
		Name:   &name,
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

func (r *mutationResolver) EditProject(ctx context.Context, id int, name *string, billingEmail *string) (*model.Project, error) {
	project, err := r.isAdminInProject(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	if err := r.DB.Model(project).Updates(&model.Project{
		Name:         name,
		BillingEmail: billingEmail,
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
	session := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: s.ID}}).First(&session).Updates(&model.Session{
		Viewed: viewed,
	}).Error; err != nil {
		return nil, e.Wrap(err, "error writing session as viewed")
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

func (r *mutationResolver) SendAdminWorkspaceInvite(ctx context.Context, workspaceID int, email string, baseURL string) (*string, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "error querying workspace")
	}
	admin, err := r.getCurrentAdmin(ctx)
	if err != nil {
		return nil, e.Wrap(err, "error querying admin")
	}

	// TODO: Should migrate these nil secrets so we can remove this
	var secret string
	if workspace.Secret == nil {
		uid := xid.New().String()
		if err := r.DB.Model(workspace).Updates(&model.Workspace{Secret: &uid}).Error; err != nil {
			return nil, e.Wrap(err, "error updating uid in project secret")
		}
		secret = uid
	} else {
		secret = *workspace.Secret
	}

	inviteLink := baseURL + "/w/" + strconv.Itoa(workspaceID) + "/invite/" + secret
	return r.SendAdminInviteImpl(*admin.Name, *workspace.Name, inviteLink, email)
}

func (r *mutationResolver) AddAdminToProject(ctx context.Context, projectID int, inviteID string) (*int, error) {
	project := &model.Project{}
	adminId, err := r.addAdminMembership(ctx, project, projectID, inviteID)
	if err != nil {
		log.Error("failed to add admin to workspace")
	}

	// For this Real Magic, set all new admins to normal role so they don't have access to billing.
	// This should be removed when we implement RBAC.
	if projectID == 388 {
		admin, err := r.getCurrentAdmin(ctx)
		if err != nil {
			log.Error("Failed get current admin.")
		}
		if err := r.DB.Model(admin).Updates(model.Admin{
			Role: &model.AdminRole.MEMBER,
		}); err != nil {
			log.Error("Failed to update admin when changing role to normal.")
		}
	}

	return adminId, nil
}

func (r *mutationResolver) AddAdminToWorkspace(ctx context.Context, workspaceID int, inviteID string) (*int, error) {
	workspace := &model.Workspace{}
	adminId, err := r.addAdminMembership(ctx, workspace, workspaceID, inviteID)
	if err != nil {
		log.Error("failed to add admin to workspace")
	}

	// For this Real Magic, set all new admins to normal role so they don't have access to billing.
	// This should be removed when we implement RBAC.
	if workspaceID == 388 {
		admin, err := r.getCurrentAdmin(ctx)
		if err != nil {
			log.Error("Failed get current admin.")
		}
		if err := r.DB.Model(admin).Updates(model.Admin{
			Role: &model.AdminRole.MEMBER,
		}); err != nil {
			log.Error("Failed to update admin when changing role to normal.")
		}
	}

	return adminId, nil
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

	return r.DeleteAdminAssociation(ctx, workspace, adminID)
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

func (r *mutationResolver) CreateOrUpdateStripeSubscription(ctx context.Context, workspaceID int, planType modelInputs.PlanType) (*string, error) {
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

	// Check if there's already a subscription on the user. If there is, we do an update and return early.
	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions")

	c, err := r.StripeClient.Customers.Get(*workspace.StripeCustomerID, params)
	if err != nil {
		return nil, e.Wrap(err, "couldn't retrieve stripe customer data")
	}
	// If there's a single subscription on the user and a single price item on the subscription
	if len(c.Subscriptions.Data) == 1 && len(c.Subscriptions.Data[0].Items.Data) == 1 {
		plan := pricing.ToPriceID(planType)
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
	plan := pricing.ToPriceID(planType)
	checkoutSessionParams := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String(os.Getenv("FRONTEND_URI") + "/w/" + strconv.Itoa(workspaceID) + "/billing/success"),
		CancelURL:  stripe.String(os.Getenv("FRONTEND_URI") + "/w/" + strconv.Itoa(workspaceID) + "/billing/checkoutCanceled"),
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		Customer: workspace.StripeCustomerID,
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			Items: []*stripe.CheckoutSessionSubscriptionDataItemsParams{
				{
					Plan: stripe.String(plan),
				},
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

	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions")
	c, err := r.StripeClient.Customers.Get(*workspace.StripeCustomerID, params)
	if err != nil {
		return nil, e.Wrap(err, "couldn't retrieve stripe customer data")
	}
	// If there's a single subscription on the user and a single price item on the subscription
	if len(c.Subscriptions.Data) != 1 || len(c.Subscriptions.Data[0].Items.Data) != 1 {
		return nil, e.New("no stripe subscription for customer")
	}

	planTypeId := c.Subscriptions.Data[0].Plan.ID

	if err := r.DB.Model(&workspace).Updates(model.Workspace{StripePriceID: &planTypeId}).Error; err != nil {
		return nil, e.Wrap(err, "error setting stripe_price_id on project")
	}
	// mark sessions as within billing quota on plan upgrade
	// this code is repeated as the first time, the user already has a billing plan and the function returns early.
	// here, the user doesn't already have a billing plan, so it's considered an upgrade unless the plan is free

	r.PrivateWorkerPool.SubmitRecover(func() {
		r.UpdateSessionsVisibility(workspaceID, pricing.FromPriceID(planTypeId), modelInputs.PlanTypeFree)
	})

	return &model.T, nil
}

func (r *mutationResolver) CreateSessionComment(ctx context.Context, projectID int, sessionSecureID string, sessionTimestamp int, text string, textForEmail string, xCoordinate float64, yCoordinate float64, taggedAdmins []*modelInputs.SanitizedAdminInput, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput, sessionURL string, time float64, authorName string, sessionImage *string) (*model.SessionComment, error) {
	admin, isGuestCreatingSession := r.getCurrentAdminOrGuest(ctx)

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

	admins := []model.Admin{}
	if !isGuestCreatingSession {
		for _, a := range taggedAdmins {
			admins = append(admins,
				model.Admin{
					Model: model.Model{ID: a.ID},
				},
			)
		}
	}

	sessionComment := &model.SessionComment{
		Admins:          admins,
		ProjectID:       projectID,
		AdminId:         admin.Model.ID,
		SessionId:       session.ID,
		SessionSecureId: session.SecureID,
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

	viewLink := fmt.Sprintf("%v?commentId=%v&ts=%v", sessionURL, sessionComment.ID, time)

	if len(taggedAdmins) > 0 && !isGuestCreatingSession {

		tos := []*mail.Email{}
		var adminIds []int

		for _, admin := range taggedAdmins {
			tos = append(tos, &mail.Email{Address: admin.Email})
			adminIds = append(adminIds, admin.ID)
		}

		r.PrivateWorkerPool.SubmitRecover(func() {
			commentMentionEmailSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createSessionComment",
				tracer.ResourceName("sendgrid.sendCommentMention"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(taggedAdmins)))
			defer commentMentionEmailSpan.Finish()

			err := r.SendEmailAlert(tos, authorName, viewLink, textForEmail, SendGridSessionCommentEmailTemplateID, sessionImage)
			if err != nil {
				log.Error(e.Wrap(err, "error notifying tagged admins in session comment"))
			}
		})

		r.PrivateWorkerPool.SubmitRecover(func() {
			commentMentionSlackSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createSessionComment",
				tracer.ResourceName("slack.sendCommentMention"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(adminIds)))
			defer commentMentionSlackSpan.Finish()

			err := r.SendPersonalSlackAlert(workspace, admin, adminIds, viewLink, textForEmail, "session")
			if err != nil {
				log.Error(e.Wrap(err, "error notifying tagged admins in session comment"))
			}
		})
	}

	if len(taggedSlackUsers) > 0 && !isGuestCreatingSession {
		r.PrivateWorkerPool.SubmitRecover(func() {
			commentMentionSlackSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createSessionComment",
				tracer.ResourceName("slackBot.sendCommentMention"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(taggedSlackUsers)))
			defer commentMentionSlackSpan.Finish()

			err := r.SendSlackAlertToUser(workspace, admin, taggedSlackUsers, viewLink, textForEmail, "session", sessionImage)
			if err != nil {
				log.Error(e.Wrap(err, "error notifying tagged admins in session comment for slack bot"))
			}
		})
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
	return &model.T, nil
}

func (r *mutationResolver) CreateErrorComment(ctx context.Context, projectID int, errorGroupSecureID string, text string, textForEmail string, taggedAdmins []*modelInputs.SanitizedAdminInput, taggedSlackUsers []*modelInputs.SanitizedSlackChannelInput, errorURL string, authorName string) (*model.ErrorComment, error) {
	admin, isGuest := r.getCurrentAdminOrGuest(ctx)

	errorGroup, err := r.canAdminViewErrorGroup(ctx, errorGroupSecureID)
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
		tos := []*mail.Email{}
		var adminIds []int

		for _, admin := range taggedAdmins {
			tos = append(tos, &mail.Email{Address: admin.Email})
			adminIds = append(adminIds, admin.ID)
		}

		r.PrivateWorkerPool.SubmitRecover(func() {
			commentMentionEmailSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createErrorComment",
				tracer.ResourceName("sendgrid.sendCommentMention"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(taggedAdmins)))
			defer commentMentionEmailSpan.Finish()

			err := r.SendEmailAlert(tos, authorName, viewLink, textForEmail, SendGridErrorCommentEmailTemplateId, nil)
			if err != nil {
				log.Error(e.Wrap(err, "error notifying tagged admins in error comment"))
			}
		})

		r.PrivateWorkerPool.SubmitRecover(func() {
			commentMentionSlackSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createErrorComment",
				tracer.ResourceName("slack.sendCommentMention"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(adminIds)))
			defer commentMentionSlackSpan.Finish()

			err = r.SendPersonalSlackAlert(workspace, admin, adminIds, viewLink, textForEmail, "error")
			if err != nil {
				log.Error(e.Wrap(err, "error notifying tagged admins in error comment"))
			}
		})

	}
	if len(taggedSlackUsers) > 0 && !isGuest {
		r.PrivateWorkerPool.SubmitRecover(func() {
			commentMentionSlackSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.createErrorComment",
				tracer.ResourceName("slackBot.sendErrorCommentMention"), tracer.Tag("project_id", projectID), tracer.Tag("count", len(taggedSlackUsers)))
			defer commentMentionSlackSpan.Finish()

			err := r.SendSlackAlertToUser(workspace, admin, taggedSlackUsers, viewLink, textForEmail, "error", nil)
			if err != nil {
				log.Error(e.Wrap(err, "error notifying tagged admins in error comment for slack bot"))
			}
		})
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
	return &model.T, nil
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

func (r *mutationResolver) AddSlackBotIntegrationToProject(ctx context.Context, projectID int, code string, redirectPath string) (bool, error) {
	var (
		SLACK_CLIENT_ID     string
		SLACK_CLIENT_SECRET string
	)
	project, err := r.isAdminInProject(ctx, projectID)
	if err != nil {
		return false, e.Wrap(err, "admin is not in project")
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
		return false, e.Wrap(err, "error getting slack oauth response")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return false, err
	}

	if workspace.SlackAccessToken == nil {
		if err := r.DB.Where(&workspace).Updates(&model.Workspace{SlackAccessToken: &resp.AccessToken}).Error; err != nil {
			return false, e.Wrap(err, "error updating slack access token in workspace")
		}
	}

	slackClient := slack.New(resp.AccessToken)

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
			return false, e.Wrap(err, "error getting Slack channels from Slack.")
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

	existingChannels, err := workspace.IntegratedSlackChannels()

	// Filter out `newChannels` that already exist in `existingChannels` so we don't have duplicates.
	filteredNewChannels := []model.SlackChannel{}
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
		}
	}

	if err != nil {
		return false, e.Wrap(err, "error retrieving existing slack channels")
	}

	existingChannels = append(existingChannels, filteredNewChannels...)
	channelBytes, err := json.Marshal(existingChannels)
	if err != nil {
		return false, e.Wrap(err, "error marshaling existing channels")
	}
	channelString := string(channelBytes)
	if err := r.DB.Model(&workspace).Updates(&model.Workspace{
		SlackChannels: &channelString,
	}).Error; err != nil {
		return false, e.Wrap(err, "error updating project fields")
	}

	return true, nil
}

func (r *mutationResolver) CreateRageClickAlert(ctx context.Context, projectID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string) (*model.SessionAlert, error) {
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

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			ExcludedEnvironments: envString,
			CountThreshold:       countThreshold,
			ThresholdWindow:      &thresholdWindow,
			Type:                 &model.AlertType.RAGE_CLICK,
			ChannelsToNotify:     channelsString,
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

func (r *mutationResolver) CreateErrorAlert(ctx context.Context, projectID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string) (*model.ErrorAlert, error) {
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

	newAlert := &model.ErrorAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			CountThreshold:       countThreshold,
			ThresholdWindow:      &thresholdWindow,
			Type:                 &model.AlertType.ERROR,
			ChannelsToNotify:     channelsString,
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

func (r *mutationResolver) UpdateErrorAlert(ctx context.Context, projectID int, name string, errorAlertID int, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string) (*model.ErrorAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	alert := &model.ErrorAlert{}
	if err := r.DB.Where(&model.ErrorAlert{Model: model.Model{ID: errorAlertID}}).Find(&alert).Error; err != nil {
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

	alert.ChannelsToNotify = channelsString
	alert.ExcludedEnvironments = envString
	alert.CountThreshold = countThreshold
	alert.ThresholdWindow = &thresholdWindow
	alert.Name = &name
	alert.LastAdminToEditID = admin.ID
	if err := r.DB.Model(&model.ErrorAlert{
		Model: model.Model{
			ID: errorAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(alert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields")
	}

	if err := alert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &errorAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return alert, nil
}

func (r *mutationResolver) DeleteErrorAlert(ctx context.Context, projectID int, errorAlertID int) (*model.ErrorAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	alert := &model.ErrorAlert{}
	if err := r.DB.Where(&model.ErrorAlert{Model: model.Model{ID: errorAlertID}, Alert: model.Alert{ProjectID: projectID}}).Find(&alert).Error; err != nil {
		return nil, e.Wrap(err, "this error alert does not exist in this project.")
	}

	if err := r.DB.Delete(alert).Error; err != nil {
		return nil, e.Wrap(err, "error trying to delete error alert")
	}

	if err := alert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &errorAlertID, Project: project, OperationName: "deleted", OperationDescription: "Alerts will no longer be sent to this channel.", IncludeEditLink: false}); err != nil {
		log.Error(err)
	}

	return alert, nil
}

func (r *mutationResolver) UpdateSessionFeedbackAlert(ctx context.Context, projectID int, sessionFeedbackAlertID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	var alert *model.SessionAlert
	if err := r.DB.Where(&model.SessionAlert{Model: model.Model{ID: sessionFeedbackAlertID}}).Find(&alert).Error; err != nil {
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

	alert.ChannelsToNotify = &channelsString
	alert.ExcludedEnvironments = &envString
	alert.CountThreshold = countThreshold
	alert.ThresholdWindow = &thresholdWindow
	alert.Name = &name
	alert.LastAdminToEditID = admin.ID
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionFeedbackAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(alert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields")
	}

	if err := alert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionFeedbackAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return alert, nil
}

func (r *mutationResolver) CreateSessionFeedbackAlert(ctx context.Context, projectID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string) (*model.SessionAlert, error) {
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

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			CountThreshold:       countThreshold,
			ThresholdWindow:      &thresholdWindow,
			Type:                 &model.AlertType.SESSION_FEEDBACK,
			ChannelsToNotify:     channelsString,
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

func (r *mutationResolver) UpdateRageClickAlert(ctx context.Context, projectID int, rageClickAlertID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	alert := &model.SessionAlert{}
	if err := r.DB.Where(&model.SessionAlert{Model: model.Model{ID: rageClickAlertID}}).Find(&alert).Error; err != nil {
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

	alert.ChannelsToNotify = channelsString
	alert.ExcludedEnvironments = envString
	alert.CountThreshold = countThreshold
	alert.ThresholdWindow = &thresholdWindow
	alert.Name = &name
	alert.LastAdminToEditID = admin.ID
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: rageClickAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(alert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields")
	}
	if err := alert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &rageClickAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return alert, nil
}

func (r *mutationResolver) UpdateNewUserAlert(ctx context.Context, projectID int, sessionAlertID int, name string, countThreshold int, thresholdWindow int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string) (*model.SessionAlert, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	admin, _ := r.getCurrentAdmin(ctx)
	workspace, _ := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in project")
	}

	alert := &model.SessionAlert{}
	if err := r.DB.Where(&model.SessionAlert{Model: model.Model{ID: sessionAlertID}}).Where("type=?", model.AlertType.NEW_USER).Find(&alert).Error; err != nil {
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

	alert.ChannelsToNotify = &channelsString
	alert.ExcludedEnvironments = &envString
	alert.CountThreshold = countThreshold
	alert.Name = &name
	alert.LastAdminToEditID = admin.ID
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(alert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields")
	}
	if err := alert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return alert, nil
}

func (r *mutationResolver) CreateNewUserAlert(ctx context.Context, projectID int, name string, countThreshold int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string, thresholdWindow int) (*model.SessionAlert, error) {
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

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			ThresholdWindow:      &thresholdWindow,
			CountThreshold:       countThreshold,
			Type:                 &model.AlertType.NEW_USER,
			ChannelsToNotify:     channelsString,
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

func (r *mutationResolver) UpdateTrackPropertiesAlert(ctx context.Context, projectID int, sessionAlertID int, name string, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string, trackProperties []*modelInputs.TrackPropertyInput, thresholdWindow int) (*model.SessionAlert, error) {
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

	alert := &model.SessionAlert{}
	alert.ExcludedEnvironments = &envString
	alert.ChannelsToNotify = &channelsString
	alert.TrackProperties = &trackPropertiesString
	alert.Name = &name
	alert.LastAdminToEditID = admin.ID
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(alert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields for track properties alert")
	}
	if err := alert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return alert, nil
}

func (r *mutationResolver) CreateTrackPropertiesAlert(ctx context.Context, projectID int, name string, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string, trackProperties []*modelInputs.TrackPropertyInput, thresholdWindow int) (*model.SessionAlert, error) {
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

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			Type:                 &model.AlertType.TRACK_PROPERTIES,
			ChannelsToNotify:     channelsString,
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

func (r *mutationResolver) CreateUserPropertiesAlert(ctx context.Context, projectID int, name string, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string, userProperties []*modelInputs.UserPropertyInput, thresholdWindow int) (*model.SessionAlert, error) {
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

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			Type:                 &model.AlertType.USER_PROPERTIES,
			ChannelsToNotify:     channelsString,
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

	alert := &model.SessionAlert{}
	if err := r.DB.Where(&model.ErrorAlert{Model: model.Model{ID: sessionAlertID}, Alert: model.Alert{ProjectID: projectID}}).Find(&alert).Error; err != nil {
		return nil, e.Wrap(err, "this session alert does not exist in this project.")
	}

	if err := r.DB.Delete(alert).Error; err != nil {
		return nil, e.Wrap(err, "error trying to delete session alert")
	}

	if err := alert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "deleted", OperationDescription: "Alerts will no longer be sent to this channel.", IncludeEditLink: false}); err != nil {
		log.Error(err)
	}

	return alert, nil
}

func (r *mutationResolver) UpdateUserPropertiesAlert(ctx context.Context, projectID int, sessionAlertID int, name string, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string, userProperties []*modelInputs.UserPropertyInput, thresholdWindow int) (*model.SessionAlert, error) {
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

	alert := &model.SessionAlert{}
	alert.ExcludedEnvironments = &envString
	alert.ChannelsToNotify = &channelsString
	alert.UserProperties = &userPropertiesString
	alert.Name = &name
	alert.LastAdminToEditID = admin.ID
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(alert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields for user properties alert")
	}
	if err := alert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return alert, nil
}

func (r *mutationResolver) UpdateNewSessionAlert(ctx context.Context, projectID int, sessionAlertID int, name string, countThreshold int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string, thresholdWindow int) (*model.SessionAlert, error) {
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

	alert := &model.SessionAlert{}
	alert.ExcludedEnvironments = &envString
	alert.ChannelsToNotify = &channelsString
	alert.LastAdminToEditID = admin.ID
	alert.Name = &name
	alert.ThresholdWindow = &thresholdWindow
	if err := r.DB.Model(&model.SessionAlert{
		Model: model.Model{
			ID: sessionAlertID,
		},
	}).Where("project_id = ?", projectID).Updates(alert).Error; err != nil {
		return nil, e.Wrap(err, "error updating org fields for new session alert")
	}
	if err := alert.SendWelcomeSlackMessage(&model.SendWelcomeSlackMessageInput{Workspace: workspace, Admin: admin, AlertID: &sessionAlertID, Project: project, OperationName: "updated", OperationDescription: "Alerts will now be sent to this channel.", IncludeEditLink: true}); err != nil {
		log.Error(err)
	}
	return alert, nil
}

func (r *mutationResolver) CreateNewSessionAlert(ctx context.Context, projectID int, name string, countThreshold int, slackChannels []*modelInputs.SanitizedSlackChannelInput, environments []*string, thresholdWindow int) (*model.SessionAlert, error) {
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

	newAlert := &model.SessionAlert{
		Alert: model.Alert{
			ProjectID:            projectID,
			OrganizationID:       projectID,
			ExcludedEnvironments: envString,
			Type:                 &model.AlertType.NEW_SESSION,
			ChannelsToNotify:     channelsString,
			Name:                 &name,
			ThresholdWindow:      &thresholdWindow,
			LastAdminToEditID:    admin.ID,
		},
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

	return errorGroup, nil
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
		return nil, e.Wrap(err, "admin not session owner")
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
	s, err := r.canAdminViewSession(ctx, sessionSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not session owner")
	}
	if en := s.ObjectStorageEnabled; en != nil && *en {
		objectStorageSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
			tracer.ResourceName("db.objectStorageQuery"), tracer.Tag("project_id", s.ProjectID))
		defer objectStorageSpan.Finish()
		ret, err := r.StorageClient.ReadSessionsFromS3(s.ID, s.ProjectID)
		if err != nil {
			return nil, err
		}
		return ret, nil
	}
	eventsQuerySpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.eventsObjectsQuery"), tracer.Tag("project_id", s.ProjectID))
	eventObjs := []*model.EventsObject{}
	if err := r.DB.Order("created_at desc").Where(&model.EventsObject{SessionID: s.ID}).Find(&eventObjs).Error; err != nil {
		return nil, e.Wrap(err, "error reading from events")
	}
	eventsQuerySpan.Finish()
	eventsParseSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("parse.eventsObjects"), tracer.Tag("project_id", s.ProjectID))
	allEvents := make(map[string][]interface{})
	for _, eventObj := range eventObjs {
		subEvents := make(map[string][]interface{})
		if err := json.Unmarshal([]byte(eventObj.Events), &subEvents); err != nil {
			return nil, e.Wrap(err, "error decoding event data")
		}
		allEvents["events"] = append(subEvents["events"], allEvents["events"]...)
	}
	eventsParseSpan.Finish()
	return allEvents["events"], nil
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
		rageClicks. *
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
		WHERE session_secure_id IS NOT NULL
		ORDER BY total_clicks DESC
		LIMIT 100`,
		projectID, lookBackPeriod).Scan(&rageClicks).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving rage clicks for project")
	}
	rageClicksSpan.Finish()

	return rageClicks, nil
}

func (r *queryResolver) ErrorGroups(ctx context.Context, projectID int, count int, params *modelInputs.ErrorSearchParamsInput) (*model.ErrorResults, error) {
	endpointStart := time.Now().UTC()
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
		start := time.Now().UTC()
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
		start := time.Now().UTC()
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

func (r *queryResolver) ErrorGroup(ctx context.Context, secureID string) (*model.ErrorGroup, error) {
	return r.canAdminViewErrorGroup(ctx, secureID)
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
			fbLink := fmt.Sprintf("https://www.linkedin.com/in/%v", liHandle)
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
	if err := r.DB.Where(model.SessionComment{SessionId: s.ID}).Order("timestamp asc").Find(&sessionComments).Error; err != nil {
		return nil, e.Wrap(err, "error querying session comments for session")
	}
	return sessionComments, nil
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
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in org for session comments")
	}

	var sessionComments []*model.SessionComment
	if err := r.DB.Model(model.SessionComment{}).Where("project_id = ?", projectID).Find(&sessionComments).Error; err != nil {
		return nil, e.Wrap(err, "error getting session comments for project")
	}

	return sessionComments, nil
}

func (r *queryResolver) ErrorComments(ctx context.Context, errorGroupSecureID string) ([]*model.ErrorComment, error) {
	errorGroup, err := r.canAdminViewErrorGroup(ctx, errorGroupSecureID)
	if err != nil {
		return nil, e.Wrap(err, "admin not error owner")
	}

	errorComments := []*model.ErrorComment{}
	if err := r.DB.Where(model.ErrorComment{ErrorId: errorGroup.ID}).Order("created_at asc").Find(&errorComments).Error; err != nil {
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
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in org for error comments")
	}

	var errorComments []*model.ErrorComment
	if err := r.DB.Model(model.ErrorComment{}).Where("project_id = ?", projectID).Find(&errorComments).Error; err != nil {
		return nil, e.Wrap(err, "error getting error comments for project")
	}

	return errorComments, nil
}

func (r *queryResolver) ProjectAdmins(ctx context.Context, projectID int) ([]*model.Admin, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	admins := []*model.Admin{}
	if err := r.DB.Order("created_at ASC").Model(&model.Admin{}).Where(`
		id IN (
			SELECT admin_id
			FROM project_admins
			WHERE project_id = ?
			UNION
			SELECT admin_id
			FROM workspace_admins
			where workspace_id = ?
		)
	`, projectID, project.WorkspaceID).Scan(&admins).Error; err != nil {
		return nil, e.Wrap(err, "error getting associated admins")
	}

	return admins, nil
}

func (r *queryResolver) WorkspaceAdmins(ctx context.Context, workspaceID int) ([]*model.Admin, error) {
	workspace, err := r.isAdminInWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "current admin not in the workspace")
	}

	admins := []*model.Admin{}
	if err := r.DB.Order("created_at ASC").Model(workspace).Association("Admins").Find(&admins); err != nil {
		return nil, e.Wrap(err, "error getting admins for the workspace")
	}

	return admins, nil
}

func (r *queryResolver) IsIntegrated(ctx context.Context, projectID int) (*bool, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
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

func (r *queryResolver) UnprocessedSessionsCount(ctx context.Context, projectID int) (*int64, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	var count int64
	if err := r.DB.Model(&model.Session{}).Where("project_id = ?", projectID).Where(&model.Session{Processed: &model.F}).Count(&count).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving count of unprocessed sessions")
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
	if err := r.DB.Model(&session).Where("project_id = ?", projectID).Where(&model.Session{Viewed: &model.T}).First(&session).Error; err != nil {
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

	if err := r.DB.Where("project_id = ?", projectID).Where("date BETWEEN ? AND ?", startDateUTC, endDateUTC).Find(&dailySessions).Error; err != nil {
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
	errGroup, err := r.canAdminViewErrorGroup(ctx, errorGroupSecureID)
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
		SELECT identifier, (
			SELECT id
			FROM fields
			WHERE project_id=?
				AND type='user'
				AND name='identifier'
				AND value=identifier
			LIMIT 1
		) AS id, SUM(active_length) as total_active_time, SUM(active_length) / (
			SELECT SUM(active_length)
			FROM sessions
			WHERE active_length IS NOT NULL
				AND project_id=?
				AND identifier <> ''
				AND created_at >= NOW() - (? * INTERVAL '1 DAY')
				AND processed=true
		) AS active_time_percentage
		FROM (
			SELECT identifier, active_length
			FROM sessions
			WHERE active_length IS NOT NULL
				AND project_id=?
				AND identifier <> ''
				AND created_at >= NOW() - (? * INTERVAL '1 DAY')
				AND processed=true
		) q1
		GROUP BY identifier
		ORDER BY total_active_time DESC
		LIMIT 50`,
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
	query := fmt.Sprintf("SELECT COALESCE(avg(active_length), 0) FROM sessions WHERE project_id=%d AND processed=true AND active_length IS NOT NULL AND created_at >= NOW() - INTERVAL '%d DAY';", projectID, lookBackPeriod)
	if err := r.DB.Raw(query).Scan(&length).Error; err != nil {
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
	if err := r.DB.Raw(fmt.Sprintf("SELECT count(DISTINCT fingerprint) from sessions WHERE identifier='' AND fingerprint IS NOT NULL AND created_at >= NOW() - INTERVAL '%d DAY' AND project_id=%d AND length >= 1000;", lookBackPeriod, projectID)).Scan(&count).Error; err != nil {
		return nil, e.Wrap(err, "error retrieving user fingerprint count")
	}
	span.Finish()

	return &modelInputs.UserFingerprintCount{Count: count}, nil
}

func (r *queryResolver) Sessions(ctx context.Context, projectID int, count int, lifecycle modelInputs.SessionLifecycle, starred bool, params *modelInputs.SearchParamsInput) (*model.SessionResults, error) {
	endpointStart := time.Now().UTC()
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "admin not found in project")
	}

	sessionsQueryPreamble := "SELECT id, secure_id, project_id, processed, starred, first_time, os_name, os_version, browser_name, browser_version, city, state, postal, identifier, fingerprint, created_at, deleted_at, length, active_length, user_object, viewed, field_group, user_properties, enable_recording_network_contents, language, event_counts"
	joinClause := "FROM sessions"

	fieldFilters, err := r.getFieldFilters(ctx, projectID, params)
	if err != nil {
		return nil, err
	}

	whereClause := ` `

	whereClause += fmt.Sprintf("WHERE (project_id = %d) ", projectID)
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

	var g errgroup.Group
	queriedSessions := []model.Session{}
	var queriedSessionsCount int64
	whereClauseSuffix := "AND NOT ((processed = true AND ((active_length IS NOT NULL AND active_length < 1000) OR (active_length IS NULL AND length < 1000)))) "
	logTags := []string{fmt.Sprintf("project_id:%d", projectID), fmt.Sprintf("filtered:%t", fieldFilters != "")}

	g.Go(func() error {
		if params.LengthRange != nil {
			if params.LengthRange.Min != nil || params.LengthRange.Max != nil {
				whereClauseSuffix = "AND processed = true "
			}

		}
		whereClause += whereClauseSuffix
		sessionsSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
			tracer.ResourceName("db.sessionsQuery"), tracer.Tag("project_id", projectID))
		start := time.Now().UTC()
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
		start := time.Now().UTC()
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

func (r *queryResolver) BillingDetailsForProject(ctx context.Context, projectID int) (*modelInputs.BillingDetails, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "admin not in project")
	}

	return r.BillingDetails(ctx, project.WorkspaceID)
}

func (r *queryResolver) BillingDetails(ctx context.Context, workspaceID int) (*modelInputs.BillingDetails, error) {
	workspace, err := r.isAdminInWorkspaceOrDemoWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, e.Wrap(err, "admin not in workspace")
	}

	stripePriceID := workspace.StripePriceID
	planType := modelInputs.PlanTypeFree
	if stripePriceID != nil {
		planType = pricing.FromPriceID(*stripePriceID)
	}

	var g errgroup.Group
	var meter int64
	var queriedSessionsOutOfQuota int64

	g.Go(func() error {
		meter, err = pricing.GetWorkspaceQuota(r.DB, workspaceID)
		if err != nil {
			return e.Wrap(err, "error from get quota")
		}
		return nil
	})

	g.Go(func() error {
		queriedSessionsOutOfQuota, err = pricing.GetWorkspaceQuotaOverflow(ctx, r.DB, workspaceID)
		if err != nil {
			return e.Wrap(err, "error from get quota overflow")
		}
		return nil
	})

	// Waits for both goroutines to finish, then returns the first non-nil error (if any).
	if err := g.Wait(); err != nil {
		return nil, e.Wrap(err, "error querying session data for billing details")
	}

	quota := pricing.TypeToQuota(planType)
	// use monthly session limit if it exists
	if workspace.MonthlySessionLimit != nil {
		quota = *workspace.MonthlySessionLimit
	}
	details := &modelInputs.BillingDetails{
		Plan: &modelInputs.Plan{
			Type:  modelInputs.PlanType(planType.String()),
			Quota: quota,
		},
		Meter:              meter,
		SessionsOutOfQuota: queriedSessionsOutOfQuota,
	}
	return details, nil
}

func (r *queryResolver) FieldSuggestion(ctx context.Context, projectID int, name string, query string) ([]*model.Field, error) {
	if _, err := r.isAdminInProjectOrDemoProject(ctx, projectID); err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	fields := []*model.Field{}
	res := r.DB.Where(&model.Field{Name: name}).
		Where("project_id = ?", projectID).
		Where("length(value) > ?", 0).
		Where("value ILIKE ?", "%"+query+"%").
		Limit(model.SUGGESTION_LIMIT_CONSTANT).
		Find(&fields)
	if err := res.Error; err != nil {
		return nil, e.Wrap(err, "error querying field suggestion")
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
		return nil, e.Wrap(err, "error retrieving user")
	}

	workspaces := []*model.Workspace{}
	if err := r.DB.Order("name ASC").Model(&admin).Association("Workspaces").Find(&workspaces); err != nil {
		return nil, e.Wrap(err, "error getting associated workspaces")
	}

	return workspaces, nil
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

func (r *queryResolver) IsIntegratedWithSlack(ctx context.Context, projectID int) (bool, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)

	if err != nil {
		return false, e.Wrap(err, "error querying project")
	}

	workspace, err := r.GetWorkspace(project.WorkspaceID)
	if err != nil {
		return false, err
	}

	return workspace.SlackAccessToken != nil, nil
}

func (r *queryResolver) Project(ctx context.Context, id int) (*model.Project, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
	}
	return project, nil
}

func (r *queryResolver) Workspace(ctx context.Context, id int) (*model.Workspace, error) {
	workspace, err := r.isAdminInWorkspace(ctx, id)
	if err != nil {
		return nil, e.Wrap(err, "admin is not in the workspace")
	}

	projects := []model.Project{}
	if err := r.DB.Order("name ASC").Model(&workspace).Association("Projects").Find(&projects); err != nil {
		return nil, e.Wrap(err, "error querying associated projects")
	}

	workspace.Projects = projects
	return workspace, nil
}

func (r *queryResolver) WorkspaceForProject(ctx context.Context, projectID int) (*model.Workspace, error) {
	project, err := r.isAdminInProjectOrDemoProject(ctx, projectID)
	if err != nil {
		return nil, e.Wrap(err, "error querying project")
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
			UID:      &uid,
			Name:     &firebaseUser.DisplayName,
			Email:    &firebaseUser.Email,
			PhotoURL: &firebaseUser.PhotoURL,
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
	acceptEncodingString := ctx.Value(model.ContextKeys.AcceptEncoding).(string)

	// Direct download only supported for clients that accept Brotli content encoding
	if !obj.DirectDownloadEnabled || !strings.Contains(acceptEncodingString, "br") {
		return nil, nil
	}

	str, err := r.StorageClient.GetDirectDownloadURL(obj.ProjectID, obj.ID)
	if err != nil {
		return nil, e.Wrap(err, "error getting direct download URL")
	}

	return str, err
}

func (r *sessionAlertResolver) ChannelsToNotify(ctx context.Context, obj *model.SessionAlert) ([]*modelInputs.SanitizedSlackChannel, error) {
	return obj.GetChannelsToNotify()
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

	return sanitizedAdmin, nil
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

type errorAlertResolver struct{ *Resolver }
type errorCommentResolver struct{ *Resolver }
type errorGroupResolver struct{ *Resolver }
type errorObjectResolver struct{ *Resolver }
type errorSegmentResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type segmentResolver struct{ *Resolver }
type sessionResolver struct{ *Resolver }
type sessionAlertResolver struct{ *Resolver }
type sessionCommentResolver struct{ *Resolver }
