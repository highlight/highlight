package pricing

import (
	"context"
	"os"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	backend "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	e "github.com/pkg/errors"
	stripe "github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/client"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
)

func GetWorkspaceQuota(DB *gorm.DB, workspace_id int) (int64, error) {
	year, month, _ := time.Now().Date()
	var meter int64
	if err := DB.Model(&model.Session{}).Where("project_id in (SELECT id FROM projects WHERE workspace_id=?)", workspace_id).Where("created_at > ?", time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)).Count(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
}

func GetWorkspaceQuotaOverflow(ctx context.Context, DB *gorm.DB, workspace_id int) (int64, error) {
	year, month, _ := time.Now().Date()
	var queriedSessionsOverQuota int64
	sessionsOverQuotaCountSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.sessionsOverQuotaCountQuery"), tracer.Tag("workspace_id", workspace_id))
	defer sessionsOverQuotaCountSpan.Finish()
	if err := DB.Model(&model.Session{}).Where("project_id in (SELECT id FROM projects WHERE workspace_id=?)", workspace_id).Where("within_billing_quota = false").Where("created_at > ?", time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)).Count(&queriedSessionsOverQuota).Error; err != nil {
		return 0, e.Wrap(err, "error querying sessions over quota count")
	}
	return queriedSessionsOverQuota, nil
}

func GetProjectPlanString(stripeClient *client.API, customerID string) backend.PlanType {
	if customerID == "" {
		return backend.PlanTypeFree
	}
	params := &stripe.CustomerParams{}
	priceID := ""
	params.AddExpand("subscriptions")
	c, err := stripeClient.Customers.Get(customerID, params)
	if !(err != nil || len(c.Subscriptions.Data) == 0 || len(c.Subscriptions.Data[0].Items.Data) == 0) {
		priceID = c.Subscriptions.Data[0].Items.Data[0].Plan.ID
	}
	planType := FromPriceID(priceID)
	return planType
}

func GetProjectPlanID(stripeClient *client.API, customerID string) (*string, error) {
	// gets plan id from stripe, sets plan id column on project
	priceID := ""
	if customerID == "" {
		return &priceID, e.New("project has no stripe subscription")
	}
	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions")
	c, err := stripeClient.Customers.Get(customerID, params)
	if !(err != nil || len(c.Subscriptions.Data) == 0 || len(c.Subscriptions.Data[0].Items.Data) == 0) {
		priceID = c.Subscriptions.Data[0].Items.Data[0].Plan.ID
	}
	return &priceID, nil
}

func TypeToQuota(planType backend.PlanType) int {
	switch planType {
	case backend.PlanTypeFree:
		return 500
	case backend.PlanTypeBasic:
		return 10000
	case backend.PlanTypeStartup:
		return 80000
	case backend.PlanTypeEnterprise:
		return 300000
	default:
		return 500
	}
}

func FromPriceID(priceID string) backend.PlanType {
	switch priceID {
	case os.Getenv("FREE_PLAN_PRICE_ID"):
		return backend.PlanTypeFree
	case os.Getenv("BASIC_PLAN_PRICE_ID"):
		return backend.PlanTypeBasic
	case os.Getenv("STARTUP_PLAN_PRICE_ID"):
		return backend.PlanTypeStartup
	case os.Getenv("ENTERPRISE_PLAN_PRICE_ID"):
		return backend.PlanTypeEnterprise
	}
	return backend.PlanTypeFree
}

func ToPriceID(plan backend.PlanType) string {
	switch plan {
	case backend.PlanTypeFree:
		return os.Getenv("FREE_PLAN_PRICE_ID")
	case backend.PlanTypeBasic:
		return os.Getenv("BASIC_PLAN_PRICE_ID")
	case backend.PlanTypeStartup:
		return os.Getenv("STARTUP_PLAN_PRICE_ID")
	case backend.PlanTypeEnterprise:
		return os.Getenv("ENTERPRISE_PLAN_PRICE_ID")
	}
	return ""
}
