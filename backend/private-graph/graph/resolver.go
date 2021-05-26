package graph

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/highlight-run/highlight/backend/pricing"

	log "github.com/sirupsen/logrus"

	"github.com/stripe/stripe-go"

	"github.com/highlight-run/highlight/backend/model"
	storage "github.com/highlight-run/highlight/backend/object-storage"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/k0kubun/pp"
	"github.com/sendgrid/sendgrid-go"
	"github.com/stripe/stripe-go/client"
	"gorm.io/gorm"

	e "github.com/pkg/errors"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var (
	WhitelistedUID                        = os.Getenv("WHITELISTED_FIREBASE_ACCOUNT")
	DemoSession                           = os.Getenv("DEMO_SESSION")
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

// Prints time since 'time' and msg, fid.
// return time.Now() to reset the clock.
func profile(msg string, fid int, t time.Time) time.Time {
	pp.Printf("%v => "+msg+" took: %s \n", fid, fmt.Sprintf("%s", time.Since(t)))
	return time.Now()
}

func (r *Resolver) isWhitelistedAccount(ctx context.Context) bool {
	uid := fmt.Sprintf("%v", ctx.Value("uid"))
	// If the user is engineering@..., we whitelist.
	if uid == WhitelistedUID {
		return true
	}
	return false
}

// These are authentication methods used to make sure that data is secured.
// This'll probably get expensive at some point; they can probably be cached.
func (r *Resolver) isAdminInOrganization(ctx context.Context, org_id int) (*model.Organization, error) {
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
		newProperty := &model.UserProperty{
			Name:  property.Name,
			Value: property.Value,
		}
		modelParams.UserProperties = append(modelParams.UserProperties, newProperty)
	}
	for _, property := range params.ExcludedProperties {
		newProperty := &model.UserProperty{
			Name:  property.Name,
			Value: property.Value,
		}
		modelParams.ExcludedProperties = append(modelParams.ExcludedProperties, newProperty)
	}
	for _, property := range params.TrackProperties {
		newProperty := &model.UserProperty{
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
	if params.HideResolved != nil {
		modelParams.HideResolved = *params.HideResolved
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

func (r *Resolver) isAdminSessionOwner(ctx context.Context, session_id int) (*model.Session, error) {
	session := &model.Session{}
	if err := r.DB.Where(&model.Session{Model: model.Model{ID: session_id}}).First(&session).Error; err != nil {
		return nil, e.Wrap(err, "error querying session")
	}
	// This returns true if its the Whitelisted Session.
	if strconv.Itoa(session_id) == DemoSession {
		return session, nil
	}
	_, err := r.isAdminInOrganization(ctx, session.OrganizationID)
	if err != nil {
		return nil, e.Wrap(err, "error validating admin in organization")
	}
	return session, nil
}

func toDuration(duration string) (time.Duration, error) {
	d, err := strconv.ParseInt(duration, 10, 64)
	if err != nil || d <= 0 {
		return time.Duration(0), e.Wrap(err, "error parsing duration integer")
	}
	return time.Duration(int64(time.Millisecond) * d), nil
}

func (r *Resolver) MakeSessionsViewable(organizationID int, newPlan modelInputs.PlanType, itemList *stripe.SubscriptionItemList) {
	isPlanUpgrade := true
	if itemList != nil {
		originalPlan := itemList.Data[0].Plan
		if originalPlan != nil {
			switch pricing.FromPriceID(originalPlan.ID) {
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
		}
	} else if newPlan == modelInputs.PlanTypeFree {
		isPlanUpgrade = false
	}
	if isPlanUpgrade {
		original := false
		update := true
		if err := r.DB.Model(&model.Session{OrganizationID: organizationID, WithinBillingQuota: &original}).Updates(model.Session{WithinBillingQuota: &update}).Error; err != nil {
			log.Error(e.Wrap(err, "error updating within_billing_quota on sessions upon plan upgrade"))
		}
	}
}
