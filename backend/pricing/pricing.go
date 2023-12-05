package pricing

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/stripe/stripe-go/v76"
	"os"
	"time"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/model"
	backend "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v76/client"
	"gorm.io/gorm"
)

const (
	highlightProductType             string = "highlightProductType"
	highlightProductTier             string = "highlightProductTier"
	highlightProductUnlimitedMembers string = "highlightProductUnlimitedMembers"
	highlightRetentionPeriod         string = "highlightRetentionPeriod"
)

type GraduatedPriceItem struct {
	Rate  float64
	Count int64
}

type ProductPricing struct {
	Included int64
	Items    []GraduatedPriceItem
}

var ProductPrices = map[backend.PlanType]map[model.PricingProductType]ProductPricing{
	backend.PlanTypeGraduated: {
		model.PricingProductTypeSessions: {
			Included: 500,
			Items: []GraduatedPriceItem{{
				Rate:  20. / 1_000,
				Count: 15_000,
			}, {
				Rate:  15. / 1_000,
				Count: 50_000,
			}, {
				Rate:  12. / 1_000,
				Count: 150_000,
			}, {
				Rate:  6.5 / 1_000,
				Count: 500_000,
			}, {
				Rate:  3.5 / 1_000,
				Count: 1_000_000,
			}, {
				Rate: 2.5 / 1_000,
			}},
		},
		model.PricingProductTypeErrors: {
			Included: 1_000,
			Items: []GraduatedPriceItem{{
				Rate:  2. / 1_000,
				Count: 50_000,
			}, {
				Rate:  0.5 / 1_000,
				Count: 100_000,
			}, {
				Rate:  0.25 / 1_000,
				Count: 200_000,
			}, {
				Rate:  0.2 / 1_000,
				Count: 500_000,
			}, {
				Rate:  0.1 / 1_000,
				Count: 5_000_000,
			}, {
				Rate: 0.05 / 1_000,
			}},
		},
		model.PricingProductTypeLogs: {
			Included: 1_000_000,
			Items: []GraduatedPriceItem{{
				Rate:  2.5 / 1_000_000,
				Count: 1_000_000,
			}, {
				Rate:  2. / 1_000_000,
				Count: 10_000_000,
			}, {
				Rate:  1.5 / 1_000_000,
				Count: 100_000_000,
			}, {
				Rate:  1. / 1_000_000,
				Count: 1_000_000_000,
			}, {
				Rate: 0.5 / 1_000_000,
			}},
		},
		model.PricingProductTypeTraces: {
			Included: 25_000_000,
			Items: []GraduatedPriceItem{{
				Rate:  2.5 / 1_000_000,
				Count: 1_000_000,
			}, {
				Rate:  2. / 1_000_000,
				Count: 10_000_000,
			}, {
				Rate:  1.5 / 1_000_000,
				Count: 100_000_000,
			}, {
				Rate:  1. / 1_000_000,
				Count: 1_000_000_000,
			}, {
				Rate: 0.5 / 1_000_000,
			}},
		},
	},
	backend.PlanTypeUsageBased: {
		model.PricingProductTypeSessions: {
			Included: 500,
			Items: []GraduatedPriceItem{{
				Rate: 20. / 1_000,
			}},
		},
		model.PricingProductTypeErrors: {
			Included: 1_000,
			Items: []GraduatedPriceItem{{
				Rate: 2. / 1_000,
			}},
		},
		model.PricingProductTypeLogs: {
			Included: 1_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
		model.PricingProductTypeTraces: {
			Included: 1_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
	},
	backend.PlanTypeLite: {
		model.PricingProductTypeSessions: {
			Included: 2_000,
			Items: []GraduatedPriceItem{{
				Rate: 5. / 1_000,
			}},
		},
		model.PricingProductTypeErrors: {
			Included: 4_000,
			Items: []GraduatedPriceItem{{
				Rate: 0.2 / 1_000,
			}},
		},
		model.PricingProductTypeLogs: {
			Included: 4_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
		model.PricingProductTypeTraces: {
			Included: 4_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
	},
	backend.PlanTypeBasic: {
		model.PricingProductTypeSessions: {
			Included: 10_000,
			Items: []GraduatedPriceItem{{
				Rate: 5. / 1_000,
			}},
		},
		model.PricingProductTypeErrors: {
			Included: 20_000,
			Items: []GraduatedPriceItem{{
				Rate: 0.2 / 1_000,
			}},
		},
		model.PricingProductTypeLogs: {
			Included: 20_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
		model.PricingProductTypeTraces: {
			Included: 20_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
	},
	backend.PlanTypeStartup: {
		model.PricingProductTypeSessions: {
			Included: 80_000,
			Items: []GraduatedPriceItem{{
				Rate: 5. / 1_000,
			}},
		},
		model.PricingProductTypeErrors: {
			Included: 160_000,
			Items: []GraduatedPriceItem{{
				Rate: 0.2 / 1_000,
			}},
		},
		model.PricingProductTypeLogs: {
			Included: 160_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
		model.PricingProductTypeTraces: {
			Included: 160_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
	},
	backend.PlanTypeEnterprise: {
		model.PricingProductTypeSessions: {
			Included: 300_000,
			Items: []GraduatedPriceItem{{
				Rate: 5. / 1_000,
			}},
		},
		model.PricingProductTypeErrors: {
			Included: 600_000,
			Items: []GraduatedPriceItem{{
				Rate: 0.2 / 1_000,
			}},
		},
		model.PricingProductTypeLogs: {
			Included: 600_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
		model.PricingProductTypeTraces: {
			Included: 600_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
	},
	backend.PlanTypeFree: {
		model.PricingProductTypeSessions: {
			Included: 500,
			Items: []GraduatedPriceItem{{
				Rate: 5. / 1_000,
			}},
		},
		model.PricingProductTypeErrors: {
			Included: 1_000,
			Items: []GraduatedPriceItem{{
				Rate: 0.2 / 1_000,
			}},
		},
		model.PricingProductTypeLogs: {
			Included: 1_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
		model.PricingProductTypeTraces: {
			Included: 25_000_000,
			Items: []GraduatedPriceItem{{
				Rate: 1.5 / 1_000_000,
			}},
		},
	},
}

func GetWorkspaceMembersMeter(DB *gorm.DB, workspaceID int) int64 {
	return DB.WithContext(context.TODO()).Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).Association("Admins").Count()
}

func GetSessions7DayAverage(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (float64, error) {
	var avg float64
	if err := DB.WithContext(ctx).Raw(`
			SELECT COALESCE(AVG(count), 0) as trailingAvg
			FROM daily_session_counts_view
			WHERE project_id in (SELECT id FROM projects WHERE workspace_id=?)
			AND date >= now() - INTERVAL '8 days'
			AND date < now() - INTERVAL '1 day'`, workspace.ID).
		Scan(&avg).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return avg, nil
}

func GetWorkspaceSessionsMeter(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (int64, error) {
	meterSpan, _ := util.StartSpanFromContext(ctx, "pricing.GetWorkspaceSessionsMeter",
		util.ResourceName("GetWorkspaceSessionsMeter"),
		util.Tag("workspace_id", workspace.ID))
	defer meterSpan.Finish()

	var meter int64
	if err := DB.WithContext(ctx).Raw(`
		WITH materialized_rows AS (
			SELECT count, date
			FROM daily_session_counts_view
			WHERE project_id in (SELECT id FROM projects WHERE workspace_id=@workspace_id)
			AND date >= (
				SELECT COALESCE(next_invoice_date - interval '1 month', billing_period_start, date_trunc('month', now(), 'UTC'))
				FROM workspaces
				WHERE id=@workspace_id)
			AND date < (
				SELECT COALESCE(next_invoice_date, billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=@workspace_id))
		SELECT SUM(count) as currentPeriodSessionCount from (
			SELECT COUNT(*) FROM sessions
			WHERE project_id IN (SELECT id FROM projects WHERE workspace_id=@workspace_id)
			AND created_at >= (SELECT MAX(date) FROM materialized_rows)
			AND created_at < (
			SELECT COALESCE(next_invoice_date, billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
			FROM workspaces
			WHERE id=@workspace_id)
			AND excluded <> true
			AND within_billing_quota
			AND (active_length >= 1000 OR (active_length is null and length >= 1000))
			AND processed = true
			UNION ALL SELECT COALESCE(SUM(count), 0) FROM materialized_rows
			WHERE date < (SELECT MAX(date) FROM materialized_rows)
		) a`, sql.Named("workspace_id", workspace.ID)).
		Scan(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
}

func GetErrors7DayAverage(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (float64, error) {
	var avg float64
	if err := DB.WithContext(ctx).Raw(`
			SELECT COALESCE(AVG(count), 0) as trailingAvg
			FROM daily_error_counts_view
			WHERE project_id in (SELECT id FROM projects WHERE workspace_id=?)
			AND date >= now() - INTERVAL '8 days'
			AND date < now() - INTERVAL '1 day'`, workspace.ID).
		Scan(&avg).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return avg, nil
}

func GetWorkspaceErrorsMeter(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (int64, error) {
	meterSpan, _ := util.StartSpanFromContext(ctx, "pricing.GetWorkspaceErrorsMeter",
		util.ResourceName("GetWorkspaceErrorsMeter"),
		util.Tag("workspace_id", workspace.ID))
	defer meterSpan.Finish()

	var meter int64
	if err := DB.WithContext(ctx).Raw(`
		WITH materialized_rows AS (
			SELECT count, date
			FROM daily_error_counts_view
			WHERE project_id in (SELECT id FROM projects WHERE workspace_id=@workspace_id)
			AND date >= (
				SELECT COALESCE(next_invoice_date - interval '1 month', billing_period_start, date_trunc('month', now(), 'UTC'))
				FROM workspaces
				WHERE id=@workspace_id)
			AND date < (
				SELECT COALESCE(next_invoice_date, billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=@workspace_id))
		SELECT SUM(count) as currentPeriodErrorsCount from (
			SELECT COUNT(*) FROM error_objects
			WHERE project_id IN (SELECT id FROM projects WHERE workspace_id=@workspace_id)
			AND created_at >= (SELECT MAX(date) FROM materialized_rows)
			AND created_at < (
				SELECT COALESCE(next_invoice_date, billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=@workspace_id)
			UNION ALL SELECT COALESCE(SUM(count), 0) FROM materialized_rows
			WHERE date < (SELECT MAX(date) FROM materialized_rows)
		) a`, sql.Named("workspace_id", workspace.ID)).
		Scan(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
}

func get7DayAverageImpl(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace, productType model.PricingProductType) (float64, error) {
	startDate := time.Now().AddDate(0, 0, -8)
	endDate := time.Now().AddDate(0, 0, -1)
	projectIds := lo.Map(workspace.Projects, func(p model.Project, _ int) int {
		return p.ID
	})

	var avgFn func(ctx context.Context, projectIds []int, dateRange backend.DateRangeRequiredInput) (float64, error)
	switch productType {
	case model.PricingProductTypeLogs:
		avgFn = ccClient.ReadLogsDailyAverage
	case model.PricingProductTypeTraces:
		avgFn = ccClient.ReadTracesDailyAverage
	default:
		return 0, fmt.Errorf("invalid product type %s", productType)
	}

	return avgFn(ctx, projectIds, backend.DateRangeRequiredInput{StartDate: startDate, EndDate: endDate})
}

func getWorkspaceMeterImpl(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace, productType model.PricingProductType) (int64, error) {
	var startDate time.Time
	if workspace.NextInvoiceDate != nil {
		startDate = workspace.NextInvoiceDate.AddDate(0, -1, 0)
	} else if workspace.BillingPeriodStart != nil {
		startDate = *workspace.BillingPeriodStart
	} else {
		currentYear, currentMonth, _ := time.Now().Date()
		startDate = time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, time.UTC)
	}

	var endDate time.Time
	if workspace.NextInvoiceDate != nil {
		endDate = *workspace.NextInvoiceDate
	} else if workspace.BillingPeriodEnd != nil {
		endDate = *workspace.BillingPeriodEnd
	} else {
		currentYear, currentMonth, _ := time.Now().Date()
		endDate = time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, time.UTC).AddDate(0, 1, 0)
	}

	projectIds := lo.Map(workspace.Projects, func(p model.Project, _ int) int {
		return p.ID
	})

	var sumFn func(ctx context.Context, projectIds []int, dateRange backend.DateRangeRequiredInput) (uint64, error)
	switch productType {
	case model.PricingProductTypeLogs:
		sumFn = ccClient.ReadLogsDailySum
	case model.PricingProductTypeTraces:
		sumFn = ccClient.ReadTracesDailySum
	default:
		return 0, fmt.Errorf("invalid product type %s", productType)
	}

	count, err := sumFn(ctx, projectIds, backend.DateRangeRequiredInput{StartDate: startDate, EndDate: endDate})
	if err != nil {
		return 0, err
	}

	return int64(count), nil
}

func GetLogs7DayAverage(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (float64, error) {
	return get7DayAverageImpl(ctx, DB, ccClient, workspace, model.PricingProductTypeLogs)
}

func GetWorkspaceLogsMeter(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (int64, error) {
	return getWorkspaceMeterImpl(ctx, DB, ccClient, workspace, model.PricingProductTypeLogs)
}

func GetTraces7DayAverage(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (float64, error) {
	return get7DayAverageImpl(ctx, DB, ccClient, workspace, model.PricingProductTypeTraces)
}

func GetWorkspaceTracesMeter(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (int64, error) {
	return getWorkspaceMeterImpl(ctx, DB, ccClient, workspace, model.PricingProductTypeTraces)
}

func GetLimitAmount(limitCostCents *int, productType model.PricingProductType, planType backend.PlanType, retentionPeriod backend.RetentionPeriod) *int64 {
	included := IncludedAmount(planType, productType)
	if planType == backend.PlanTypeFree {
		return pointy.Int64(included)
	}
	if limitCostCents == nil {
		return nil
	}

	retentionMultiplier := RetentionMultiplier(retentionPeriod)
	count := IncludedAmount(planType, productType)
	var cost float64
	for _, item := range ProductPrices[planType][productType].Items {
		quota := int64((float64(*limitCostCents)/100. - cost) / item.Rate / retentionMultiplier)
		if item.Count > 0 && quota > item.Count {
			quota = item.Count
		}
		cost += float64(quota) * item.Rate
		count += quota
		if item.Count == 0 || (item.Count > 0 && quota < item.Count) {
			break
		}
	}

	return pointy.Int64(count)
}

func ProductToBasePriceCents(productType model.PricingProductType, planType backend.PlanType, meter int64) float64 {
	included := IncludedAmount(planType, productType)
	remainder := meter - included
	if remainder <= 0 {
		return 0
	}
	var price float64
	for _, item := range ProductPrices[planType][productType].Items {
		if remainder <= 0 {
			break
		}
		itemUsage := remainder
		if item.Count > 0 && itemUsage > item.Count {
			itemUsage = item.Count
		}
		price += float64(itemUsage) * item.Rate
		remainder -= itemUsage
	}
	return price / float64(meter) * 100.
}

func RetentionMultiplier(retentionPeriod backend.RetentionPeriod) float64 {
	switch retentionPeriod {
	case backend.RetentionPeriodThirtyDays:
		return 1
	case backend.RetentionPeriodThreeMonths:
		return 1
	case backend.RetentionPeriodSixMonths:
		return 1.5
	case backend.RetentionPeriodTwelveMonths:
		return 2
	case backend.RetentionPeriodTwoYears:
		return 2.5
	default:
		return 1
	}
}

func TypeToMemberLimit(planType backend.PlanType, unlimitedMembers bool) *int64 {
	if unlimitedMembers {
		return nil
	}
	switch planType {
	case backend.PlanTypeBasic:
		return pointy.Int64(2)
	case backend.PlanTypeStartup:
		return pointy.Int64(8)
	case backend.PlanTypeEnterprise:
		return pointy.Int64(15)
	default:
		return pointy.Int64(2)
	}
}

func IncludedAmount(planType backend.PlanType, productType model.PricingProductType) int64 {
	return ProductPrices[planType][productType].Included
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
	return backend.PlanTypeFree
}

// MustUpgradeForClearbit shows when tier is insufficient for Clearbit.
func MustUpgradeForClearbit(tier string) bool {
	pt := backend.PlanType(tier)
	return pt != backend.PlanTypeStartup && pt != backend.PlanTypeEnterprise
}

// Returns a Stripe lookup key which maps to a single Stripe Price
func GetBaseLookupKey(productTier backend.PlanType, interval model.PricingSubscriptionInterval, unlimitedMembers bool, retentionPeriod backend.RetentionPeriod) (result string) {
	switch productTier {
	case backend.PlanTypeUsageBased:
		return fmt.Sprintf("%s|%s", model.PricingProductTypeBase, backend.PlanTypeUsageBased)
	case backend.PlanTypeGraduated:
		return fmt.Sprintf("%s|%s", model.PricingProductTypeBase, backend.PlanTypeGraduated)
	default:
		result = fmt.Sprintf("%s|%s|%s", model.PricingProductTypeBase, string(productTier), string(interval))
		if unlimitedMembers {
			result += "|UNLIMITED_MEMBERS"
		}
		if retentionPeriod != backend.RetentionPeriodThreeMonths {
			result += "|" + string(retentionPeriod)
		}
	}
	return
}

func GetOverageKey(productType model.PricingProductType, retentionPeriod backend.RetentionPeriod, planType backend.PlanType) string {
	result := string(productType)
	if retentionPeriod != backend.RetentionPeriodThreeMonths {
		result += "|" + string(retentionPeriod)
	}

	if planType == backend.PlanTypeGraduated {
		result += "|" + backend.PlanTypeGraduated.String()
	} else if planType == backend.PlanTypeUsageBased && productType == model.PricingProductTypeSessions {
		result += "|" + backend.PlanTypeUsageBased.String()
	}
	return result
}

// Returns the Highlight model.PricingProductType, Tier, and Interval for the Stripe Price
func GetProductMetadata(price *stripe.Price) (*model.PricingProductType, *backend.PlanType, bool, model.PricingSubscriptionInterval, backend.RetentionPeriod) {
	interval := model.PricingSubscriptionIntervalMonthly
	if price.Recurring != nil && price.Recurring.Interval == stripe.PriceRecurringIntervalYear {
		interval = model.PricingSubscriptionIntervalAnnual
	}

	retentionPeriod := backend.RetentionPeriodSixMonths

	// If the price id corresponds to a tier using the old conversion,
	// return it for backward compatibility
	oldTier := FromPriceID(price.ID)
	if oldTier != backend.PlanTypeFree {
		base := model.PricingProductTypeBase
		return &base, &oldTier, false, interval, retentionPeriod
	}

	var productTypePtr *model.PricingProductType
	var tierPtr *backend.PlanType

	if typeStr, ok := price.Product.Metadata[highlightProductType]; ok {
		productType := model.PricingProductType(typeStr)
		productTypePtr = &productType
	}

	if tierStr, ok := price.Product.Metadata[highlightProductTier]; ok {
		tier := backend.PlanType(tierStr)
		tierPtr = &tier
	}

	unlimitedMembers := false
	if unlimitedMembersStr, ok := price.Product.Metadata[highlightProductUnlimitedMembers]; ok {
		if unlimitedMembersStr == "true" {
			unlimitedMembers = true
		}
	}

	if retentionStr, ok := price.Metadata[highlightRetentionPeriod]; ok {
		retentionPeriod = backend.RetentionPeriod(retentionStr)
	}

	return productTypePtr, tierPtr, unlimitedMembers, interval, retentionPeriod
}

// Products are too nested in the Subscription model to be added through the API
// This method calls the Stripe ListProducts API and replaces each product id in the
// subscriptions with the full product data.
func FillProducts(stripeClient *client.API, subscriptions []*stripe.Subscription) {
	productListParams := &stripe.ProductListParams{}
	for _, subscription := range subscriptions {
		for _, subscriptionItem := range subscription.Items.Data {
			productListParams.IDs = append(productListParams.IDs, &subscriptionItem.Price.Product.ID)
		}
	}

	productsById := map[string]*stripe.Product{}
	if len(productListParams.IDs) > 0 {
		// Loop over each product in the subscription
		products := stripeClient.Products.List(productListParams).ProductList().Data
		for _, product := range products {
			productsById[product.ID] = product
		}
	}

	for _, subscription := range subscriptions {
		for _, subscriptionItem := range subscription.Items.Data {
			productId := subscriptionItem.Price.Product.ID
			if product, ok := productsById[productId]; ok {
				subscriptionItem.Price.Product = product
			}
		}
	}
}

// Returns the Stripe Prices for the associated tier and interval
func GetStripePrices(stripeClient *client.API, workspace *model.Workspace, productTier backend.PlanType, interval model.PricingSubscriptionInterval, unlimitedMembers bool, retentionPeriod *backend.RetentionPeriod) (map[model.PricingProductType]*stripe.Price, error) {
	// Default to the `RetentionPeriodThreeMonths` prices for customers grandfathered into 6 month retention
	rp := backend.RetentionPeriodThreeMonths
	if retentionPeriod != nil {
		rp = *retentionPeriod
	}
	baseLookupKey := GetBaseLookupKey(productTier, interval, unlimitedMembers, rp)

	membersLookupKey := string(model.PricingProductTypeMembers)
	sessionsLookupKey := GetOverageKey(model.PricingProductTypeSessions, rp, productTier)
	errorsLookupKey := GetOverageKey(model.PricingProductTypeErrors, rp, productTier)
	// logs and traces are only available with three month retention
	logsLookupKey := GetOverageKey(model.PricingProductTypeLogs, backend.RetentionPeriodThreeMonths, productTier)
	tracesLookupKey := GetOverageKey(model.PricingProductTypeTraces, backend.RetentionPeriodThreeMonths, productTier)

	priceListParams := stripe.PriceListParams{}
	priceListParams.LookupKeys = []*string{&baseLookupKey, &sessionsLookupKey, &membersLookupKey, &errorsLookupKey, &logsLookupKey, &tracesLookupKey}
	prices := stripeClient.Prices.List(&priceListParams).PriceList().Data

	// Validate that we received exactly 1 response for each lookup key
	expected := len(priceListParams.LookupKeys)
	actual := len(prices)
	if expected != actual {
		searchedKeys := lo.Map(priceListParams.LookupKeys, func(key *string, _ int) string {
			return *key
		})
		foundKeys := lo.Map(prices, func(price *stripe.Price, _ int) string {
			return price.LookupKey
		})
		return nil, e.Errorf("expected %d prices, received %d; searched %#v, found %#v", expected, actual, searchedKeys, foundKeys)
	}

	priceMap := map[model.PricingProductType]*stripe.Price{}
	for _, price := range prices {
		switch price.LookupKey {
		case baseLookupKey:
			priceMap[model.PricingProductTypeBase] = price
		case sessionsLookupKey:
			priceMap[model.PricingProductTypeSessions] = price
		case membersLookupKey:
			priceMap[model.PricingProductTypeMembers] = price
		case errorsLookupKey:
			priceMap[model.PricingProductTypeErrors] = price
		case logsLookupKey:
			priceMap[model.PricingProductTypeLogs] = price
		case tracesLookupKey:
			priceMap[model.PricingProductTypeTraces] = price
		}
	}

	// fill values for custom price overrides
	for product, priceID := range map[model.PricingProductType]*string{
		model.PricingProductTypeSessions: workspace.StripeSessionOveragePriceID,
		model.PricingProductTypeErrors:   workspace.StripeErrorOveragePriceID,
		model.PricingProductTypeLogs:     workspace.StripeLogOveragePriceID,
		model.PricingProductTypeTraces:   workspace.StripeTracesOveragePriceID,
	} {
		if priceID != nil {
			price, err := stripeClient.Prices.Get(*priceID, &stripe.PriceParams{})
			if err != nil {
				return nil, err
			}
			priceMap[product] = price
		}
	}

	if len(priceMap) != expected {
		return nil, e.New("one or more prices was not found")
	}

	return priceMap, nil
}

type Worker struct {
	db           *gorm.DB
	ccClient     *clickhouse.Client
	stripeClient *client.API
	mailClient   *sendgrid.Client
}

func NewWorker(db *gorm.DB, ccClient *clickhouse.Client, stripeClient *client.API, mailClient *sendgrid.Client) *Worker {
	return &Worker{
		db:           db,
		ccClient:     ccClient,
		stripeClient: stripeClient,
		mailClient:   mailClient,
	}
}

func (w *Worker) ReportUsageForWorkspace(ctx context.Context, workspaceID int) error {
	return w.reportUsage(ctx, workspaceID, nil)
}

func (w *Worker) reportUsage(ctx context.Context, workspaceID int, productType *model.PricingProductType) error {
	var workspace model.Workspace
	if err := w.db.WithContext(ctx).Model(&workspace).Where("id = ?", workspaceID).Take(&workspace).Error; err != nil {
		return e.Wrap(err, "error querying workspace")
	}
	var projects []model.Project
	if err := w.db.WithContext(ctx).Model(&model.Project{}).Where("workspace_id = ?", workspaceID).Find(&projects).Error; err != nil {
		return e.Wrap(err, "error querying projects in workspace")
	}
	workspace.Projects = projects

	// If the trial end date is recent (within the past 7 days) or it hasn't ended yet
	// The 7 day check is to avoid sending emails to customers whose trials ended long ago
	if workspace.TrialEndDate != nil && workspace.TrialEndDate.After(time.Now().AddDate(0, 0, -7)) {
		if workspace.TrialEndDate.Before(time.Now()) {
			// If the trial has ended, send an email
			if err := model.SendBillingNotifications(ctx, w.db, w.mailClient, email.BillingHighlightTrialEnded, &workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		} else if workspace.TrialEndDate.Before(time.Now().AddDate(0, 0, 7)) {
			// If the trial is ending within 7 days, send an email
			if err := model.SendBillingNotifications(ctx, w.db, w.mailClient, email.BillingHighlightTrial7Days, &workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		}
	}

	// Don't report usage for free plans
	if backend.PlanType(workspace.PlanTier) == backend.PlanTypeFree {
		return nil
	}

	if workspace.BillingPeriodStart == nil ||
		workspace.BillingPeriodEnd == nil ||
		time.Now().Before(*workspace.BillingPeriodStart) ||
		!time.Now().Before(*workspace.BillingPeriodEnd) {
		return e.New("workspace billing period is not valid")
	}

	customerParams := &stripe.CustomerParams{}
	customerParams.AddExpand("subscriptions")
	customerParams.AddExpand("subscriptions.data.discount")
	customerParams.AddExpand("subscriptions.data.discount.coupon")
	c, err := w.stripeClient.Customers.Get(*workspace.StripeCustomerID, customerParams)
	if err != nil {
		return e.Wrap(err, "couldn't retrieve stripe customer data")
	}

	if len(c.Subscriptions.Data) > 1 {
		return e.New("STRIPE_INTEGRATION_ERROR cannot report usage - customer has multiple subscriptions")
	}
	if len(c.Subscriptions.Data) == 0 {
		return e.New("STRIPE_INTEGRATION_ERROR cannot report usage - customer has no subscriptions")
	}

	subscriptions := c.Subscriptions.Data
	FillProducts(w.stripeClient, subscriptions)

	subscription := subscriptions[0]

	if len(lo.Filter(subscription.Items.Data, func(item *stripe.SubscriptionItem, _ int) bool {
		return item.Price.Recurring.UsageType != stripe.PriceRecurringUsageTypeMetered
	})) != 1 {
		return e.New("STRIPE_INTEGRATION_ERROR cannot report usage - subscription has multiple products")
	}

	baseProductItem, ok := lo.Find(subscription.Items.Data, func(item *stripe.SubscriptionItem) bool {
		_, ok := item.Price.Product.Metadata[highlightProductType]
		return ok
	})
	if !ok {
		return e.New("STRIPE_INTEGRATION_ERROR cannot report usage - cannot find base product")
	}

	_, productTier, _, interval, _ := GetProductMetadata(baseProductItem.Price)
	if productTier == nil {
		return e.New("STRIPE_INTEGRATION_ERROR cannot report usage - product has no tier")
	}

	// If the subscription has a 100% coupon with an expiration
	if subscription.Discount != nil &&
		subscription.Discount.Coupon != nil &&
		subscription.Discount.Coupon.PercentOff == 100 &&
		subscription.Discount.End != 0 {
		subscriptionEnd := time.Unix(subscription.Discount.End, 0)
		if subscriptionEnd.Before(time.Now().AddDate(0, 0, 3)) {
			// If the Stripe trial is ending within 3 days, send an email
			if err := model.SendBillingNotifications(ctx, w.db, w.mailClient, email.BillingStripeTrial3Days, &workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		} else if subscriptionEnd.Before(time.Now().AddDate(0, 0, 7)) {
			// If the Stripe trial is ending within 7 days, send an email
			if err := model.SendBillingNotifications(ctx, w.db, w.mailClient, email.BillingStripeTrial7Days, &workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		}
	}

	// For annual subscriptions, set PendingInvoiceItemInterval to 'month' if not set
	if interval == model.PricingSubscriptionIntervalAnnual &&
		subscription.PendingInvoiceItemInterval.Interval != stripe.SubscriptionPendingInvoiceItemIntervalIntervalMonth {
		updated, err := w.stripeClient.Subscriptions.Update(subscription.ID, &stripe.SubscriptionParams{
			PendingInvoiceItemInterval: &stripe.SubscriptionPendingInvoiceItemIntervalParams{
				Interval: stripe.String(string(stripe.SubscriptionPendingInvoiceItemIntervalIntervalMonth)),
			},
		})
		if err != nil {
			return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to update PendingInvoiceItemInterval")
		}

		if updated.NextPendingInvoiceItemInvoice != 0 {
			timestamp := time.Unix(updated.NextPendingInvoiceItemInvoice, 0)
			if err := w.db.WithContext(ctx).Model(&workspace).Where("id = ?", workspaceID).
				Updates(&model.Workspace{
					NextInvoiceDate: &timestamp,
				}).Error; err != nil {
				return e.Wrapf(err, "STRIPE_INTEGRATION_ERROR error updating workspace NextInvoiceDate")
			}
		}
	}

	prices, err := GetStripePrices(w.stripeClient, &workspace, *productTier, interval, workspace.UnlimitedMembers, workspace.RetentionPeriod)
	if err != nil {
		return e.Wrap(err, "STRIPE_INTEGRATION_ERROR cannot report usage - failed to get Stripe prices")
	}

	invoiceParams := &stripe.InvoiceUpcomingParams{
		Customer:     &c.ID,
		Subscription: &subscription.ID,
	}

	_, err = w.stripeClient.Invoices.Upcoming(invoiceParams)
	// Cancelled subscriptions have no upcoming invoice - we can skip these since we won't
	// be charging any overage for their next billing period.
	if err != nil {
		if err.Error() == string(stripe.ErrorCodeInvoiceUpcomingNone) {
			return nil
		} else {
			log.WithContext(ctx).Error(err)
			return e.Wrap(err, "STRIPE_INTEGRATION_ERROR cannot report usage - failed to retrieve upcoming invoice for customer "+c.ID)
		}
	}

	invoiceLinesParams := &stripe.InvoiceUpcomingLinesParams{
		Customer:     &c.ID,
		Subscription: &subscription.ID,
	}
	invoiceLinesParams.AddExpand("data.price.product")

	i := w.stripeClient.Invoices.UpcomingLines(invoiceLinesParams)
	if err = i.Err(); err != nil {
		return e.Wrap(err, "STRIPE_INTEGRATION_ERROR cannot report usage - failed to retrieve invoice lines for customer "+c.ID)
	}
	var lineItems []*stripe.InvoiceLineItem
	for i.Next() {
		lineItems = append(lineItems, i.InvoiceLineItem())
	}

	invoiceLines := map[model.PricingProductType]*stripe.InvoiceLineItem{}
	// GroupBy to remove will extra line items
	// duplicates are present because graduated pricing (one invoice item)
	// has more than one invoice line item for each bucket's price.
	// ie. price of `First 4999` and `Next 19999` are two different line items for the same subscription item.
	grouped := lo.GroupBy(lineItems, func(item *stripe.InvoiceLineItem) string {
		if item.SubscriptionItem != nil {
			return item.SubscriptionItem.ID
		}
		return ""
	})
	for subscriptionItem, group := range grouped {
		if len(group) == 0 {
			return e.Wrapf(err, "STRIPE_INTEGRATION_ERROR empty group, failed to group invoice lines for %s", subscriptionItem)
		}
		// if the subscriptionItem is not set, these are non-graduated line items that we want to delete
		// if set, we only want to keep the first line item
		if subscriptionItem != "" {
			group = []*stripe.InvoiceLineItem{group[0]}
		}
		for _, line := range group {
			productType, _, _, _, _ := GetProductMetadata(line.Price)
			if productType != nil {
				// if the line is from an old price, delete it
				if line.Price.ID != prices[*productType].ID {
					log.WithContext(ctx).Warnf("STRIPE_INTEGRATION_WARN deleting old -invoice item %s for customer %s", invoiceLines[*productType].InvoiceItem.ID, c.ID)
					if _, err := w.stripeClient.InvoiceItems.Del(invoiceLines[*productType].InvoiceItem.ID, &stripe.InvoiceItemParams{}); err != nil {
						return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to add usage record item")
					}
				}
				invoiceLines[*productType] = line
			}
		}
	}
	log.WithContext(ctx).WithField("invoiceLinesLen", len(invoiceLines)).Infof("STRIPE_INTEGRATION_INFO found invoice lines %d %+v", len(invoiceLines), invoiceLines)

	// Update members overage
	membersMeter := GetWorkspaceMembersMeter(w.db, workspaceID)
	membersLimit := TypeToMemberLimit(backend.PlanType(workspace.PlanTier), workspace.UnlimitedMembers)
	if membersLimit != nil && workspace.MonthlyMembersLimit != nil {
		membersLimit = pointy.Int64(int64(*workspace.MonthlyMembersLimit))
	}
	if err := AddOrUpdateOverageItem(w.stripeClient, &workspace, prices[model.PricingProductTypeMembers], invoiceLines[model.PricingProductTypeMembers], c, subscription, membersLimit, membersMeter); err != nil {
		return e.Wrap(err, "error updating overage item")
	}

	// Update sessions overage
	sessionsMeter, err := GetWorkspaceSessionsMeter(ctx, w.db, w.ccClient, &workspace)
	if err != nil {
		return e.Wrap(err, "error getting sessions meter")
	}
	sessionsLimit := IncludedAmount(backend.PlanType(workspace.PlanTier), model.PricingProductTypeSessions)
	if workspace.MonthlySessionLimit != nil {
		sessionsLimit = int64(*workspace.MonthlySessionLimit)
	}
	if err := AddOrUpdateOverageItem(w.stripeClient, &workspace, prices[model.PricingProductTypeSessions], invoiceLines[model.PricingProductTypeSessions], c, subscription, &sessionsLimit, sessionsMeter); err != nil {
		return e.Wrap(err, "error updating overage item")
	}

	// Update errors overage
	errorsMeter, err := GetWorkspaceErrorsMeter(ctx, w.db, w.ccClient, &workspace)
	if err != nil {
		return e.Wrap(err, "error getting errors meter")
	}
	errorsLimit := IncludedAmount(backend.PlanType(workspace.PlanTier), model.PricingProductTypeErrors)
	if workspace.MonthlyErrorsLimit != nil {
		errorsLimit = int64(*workspace.MonthlyErrorsLimit)
	}
	if err := AddOrUpdateOverageItem(w.stripeClient, &workspace, prices[model.PricingProductTypeErrors], invoiceLines[model.PricingProductTypeErrors], c, subscription, &errorsLimit, errorsMeter); err != nil {
		return e.Wrap(err, "error updating overage item")
	}

	// Update logs overage
	logsMeter, err := GetWorkspaceLogsMeter(ctx, w.db, w.ccClient, &workspace)
	if err != nil {
		return e.Wrap(err, "error getting errors meter")
	}
	logsLimit := IncludedAmount(backend.PlanType(workspace.PlanTier), model.PricingProductTypeLogs)
	if workspace.MonthlyLogsLimit != nil {
		logsLimit = int64(*workspace.MonthlyLogsLimit)
	}
	if err := AddOrUpdateOverageItem(w.stripeClient, &workspace, prices[model.PricingProductTypeLogs], invoiceLines[model.PricingProductTypeLogs], c, subscription, &logsLimit, logsMeter); err != nil {
		return e.Wrap(err, "error updating overage item")
	}

	// Update traces overage
	tracesMeter, err := GetWorkspaceTracesMeter(ctx, w.db, w.ccClient, &workspace)
	if err != nil {
		return e.Wrap(err, "error getting traces meter")
	}
	tracesLimit := IncludedAmount(backend.PlanType(workspace.PlanTier), model.PricingProductTypeTraces)
	if workspace.MonthlyTracesLimit != nil {
		tracesLimit = int64(*workspace.MonthlyTracesLimit)
	}
	if err := AddOrUpdateOverageItem(w.stripeClient, &workspace, prices[model.PricingProductTypeTraces], invoiceLines[model.PricingProductTypeTraces], c, subscription, &tracesLimit, tracesMeter); err != nil {
		return e.Wrap(err, "error updating overage item")
	}

	return nil
}

func AddOrUpdateOverageItem(stripeClient *client.API, workspace *model.Workspace, newPrice *stripe.Price, invoiceLine *stripe.InvoiceLineItem, customer *stripe.Customer, subscription *stripe.Subscription, limit *int64, meter int64) error {
	// Calculate overage if the workspace allows it
	overage := int64(0)
	if limit != nil &&
		backend.PlanType(workspace.PlanTier) != backend.PlanTypeFree &&
		workspace.AllowMeterOverage && meter > *limit {
		overage = meter - *limit
	}

	// if the price is a metered recurring subscription, use subscription items and usage records
	if newPrice.Recurring != nil && newPrice.Recurring.UsageType == stripe.PriceRecurringUsageTypeMetered {
		var subscriptionItemID string
		// if the subscription item doesn't create for this price, create it
		if invoiceLine == nil || invoiceLine.SubscriptionItem.ID == "" {
			params := &stripe.SubscriptionItemParams{
				Subscription: &subscription.ID,
				Price:        &newPrice.ID,
			}
			params.SetIdempotencyKey(subscription.ID + ":" + newPrice.ID + ":item")
			subscriptionItem, err := stripeClient.SubscriptionItems.New(params)
			if err != nil {
				return e.Wrapf(err, "STRIPE_INTEGRATION_ERROR failed to add invoice item for usage record item; invoiceLine=%+v, priceID=%s, subscriptionID=%s", invoiceLine, newPrice.ID, subscription.ID)
			}
			subscriptionItemID = subscriptionItem.ID
		} else {
			subscriptionItemID = invoiceLine.SubscriptionItem.ID
		}
		// set the usage for this product, replacing existing values
		params := &stripe.UsageRecordParams{
			SubscriptionItem: stripe.String(subscriptionItemID),
			Action:           stripe.String("set"),
			Quantity:         stripe.Int64(overage),
		}
		if _, err := stripeClient.UsageRecords.New(params); err != nil {
			return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to add usage record item")
		}
	} else {
		if invoiceLine != nil {
			if _, err := stripeClient.InvoiceItems.Update(invoiceLine.InvoiceItem.ID, &stripe.InvoiceItemParams{
				Price:    &newPrice.ID,
				Quantity: stripe.Int64(overage),
			}); err != nil {
				return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to update invoice item")
			}
		} else {
			params := &stripe.InvoiceItemParams{
				Customer:     &customer.ID,
				Subscription: &subscription.ID,
				Price:        &newPrice.ID,
				Quantity:     stripe.Int64(overage),
			}
			params.SetIdempotencyKey(customer.ID + ":" + subscription.ID + ":" + newPrice.ID)
			if _, err := stripeClient.InvoiceItems.New(params); err != nil {
				return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to add invoice item")
			}
		}
	}

	return nil
}

func (w *Worker) ReportAllUsage(ctx context.Context) {
	// Get all workspace IDs
	var workspaceIDs []int
	if err := w.db.WithContext(ctx).Raw(`
		SELECT id
		FROM workspaces
		WHERE billing_period_start is not null
		AND billing_period_end is not null
	`).Scan(&workspaceIDs).Error; err != nil {
		log.WithContext(ctx).Error("failed to query workspaces")
		return
	}

	for _, workspaceID := range workspaceIDs {
		if err := w.reportUsage(ctx, workspaceID, nil); err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "error reporting usage for workspace %d", workspaceID))
		}
	}
}
