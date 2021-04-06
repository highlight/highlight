package util

import (
	"os"
	"time"

	"github.com/jay-khatri/fullstory/backend/client-graph/graph/resolver"
	backend "github.com/jay-khatri/fullstory/backend/main-graph/graph/model"
	model "github.com/jay-khatri/fullstory/backend/model"
	e "github.com/pkg/errors"
	stripe "github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/client"
)

func GetSessionCount(r *resolver.Resolver, org_id int) (int, error) {
	year, month, _ := time.Now().Date()
	var meter int
	if err := r.DB.Model(&model.Session{}).Where(&model.Session{OrganizationID: org_id}).Where("created_at > ?", time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)).Count(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
}

func GetOrgPlanString(stripeClient *client.API, customerID string) string {
	params := &stripe.CustomerParams{}
	priceID := ""
	params.AddExpand("subscriptions")
	c, err := stripeClient.Customers.Get(customerID, params)
	if !(err != nil || len(c.Subscriptions.Data) == 0 || len(c.Subscriptions.Data[0].Items.Data) == 0) {
		priceID = c.Subscriptions.Data[0].Items.Data[0].Plan.ID
	}
	planType := FromPriceID(priceID).String()
	return planType
}

func TypeToQuota(planType backend.PlanType) int {
	switch planType {
	case backend.PlanTypeNone:
		return 1000
	case backend.PlanTypeBasic:
		return 20000
	case backend.PlanTypeStartup:
		return 80000
	case backend.PlanTypeEnterprise:
		return 300000
	default:
		return 1000
	}
}

func FromPriceID(priceID string) backend.PlanType {
	switch priceID {
	case os.Getenv("BASIC_PLAN_PRICE_ID"):
		return backend.PlanTypeBasic
	case os.Getenv("STARTUP_PLAN_PRICE_ID"):
		return backend.PlanTypeStartup
	case os.Getenv("ENTERPRISE_PLAN_PRICE_ID"):
		return backend.PlanTypeEnterprise
	}
	return backend.PlanTypeNone
}

func ToPriceID(plan backend.PlanType) string {
	switch plan {
	case backend.PlanTypeBasic:
		return os.Getenv("BASIC_PLAN_PRICE_ID")
	case backend.PlanTypeStartup:
		return os.Getenv("STARTUP_PLAN_PRICE_ID")
	case backend.PlanTypeEnterprise:
		return os.Getenv("ENTERPRISE_PLAN_PRICE_ID")
	}
	return ""
}
