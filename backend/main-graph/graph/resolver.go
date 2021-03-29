package graph

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	modelInputs "github.com/jay-khatri/fullstory/backend/main-graph/graph/model"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jinzhu/gorm"
	"github.com/k0kubun/pp"
	"github.com/sendgrid/sendgrid-go"
	"github.com/stripe/stripe-go/client"

	e "github.com/pkg/errors"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var (
	WhitelistedUID = os.Getenv("WHITELISTED_FIREBASE_ACCOUNT")
	DemoSession    = os.Getenv("DEMO_SESSION")
)

type Resolver struct {
	DB           *gorm.DB
	MailClient   *sendgrid.Client
	StripeClient *client.API
}

// Prints time since 'time' and msg, fid.
// return time.Now() to reset the clock.
func profile(msg string, fid int, t time.Time) time.Time {
	pp.Printf("%v => "+msg+" took: %s \n", fid, fmt.Sprintf("%s", time.Since(t)))
	return time.Now()
}

func TypeToQuota(planType modelInputs.PlanType) int {
	switch planType {
	case modelInputs.PlanTypeNone:
		return 1000
	case modelInputs.PlanTypeBasic:
		return 20000
	case modelInputs.PlanTypeStartup:
		return 80000
	case modelInputs.PlanTypeEnterprise:
		return 300000
	default:
		return 1000
	}
}

func FromPriceID(priceID string) modelInputs.PlanType {
	switch priceID {
	case os.Getenv("BASIC_PLAN_PRICE_ID"):
		return modelInputs.PlanTypeBasic
	case os.Getenv("STARTUP_PLAN_PRICE_ID"):
		return modelInputs.PlanTypeStartup
	case os.Getenv("ENTERPRISE_PLAN_PRICE_ID"):
		return modelInputs.PlanTypeEnterprise
	}
	return modelInputs.PlanTypeNone
}

func ToPriceID(plan modelInputs.PlanType) string {
	switch plan {
	case modelInputs.PlanTypeBasic:
		return os.Getenv("BASIC_PLAN_PRICE_ID")
	case modelInputs.PlanTypeStartup:
		return os.Getenv("STARTUP_PLAN_PRICE_ID")
	case modelInputs.PlanTypeEnterprise:
		return os.Getenv("ENTERPRISE_PLAN_PRICE_ID")
	}
	return ""
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
		res := r.DB.Where(&model.Organization{Model: model.Model{ID: org_id}}).First(&org)
		if err := res.Error; err != nil || res.RecordNotFound() {
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
	res := r.DB.Where(&model.ErrorGroup{Model: model.Model{ID: errorGroupID}}).First(&errorGroup)
	if err := res.Error; err != nil || res.RecordNotFound() {
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
	res := r.DB.Where(&model.Session{Model: model.Model{ID: session_id}}).First(&session)
	if err := res.Error; err != nil || res.RecordNotFound() {
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
