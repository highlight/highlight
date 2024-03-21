package pricing

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/marketplaceentitlementservice"
	mpeTypes "github.com/aws/aws-sdk-go-v2/service/marketplaceentitlementservice/types"
	"github.com/aws/aws-sdk-go-v2/service/marketplacemetering"
	"github.com/aws/aws-sdk-go-v2/service/marketplacemetering/types"
	"github.com/aws/smithy-go/ptr"
	"github.com/stripe/stripe-go/v76"

	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/store"

	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v76/client"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/model"
	backend "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
)

const (
	highlightProductType             string = "highlightProductType"
	highlightProductTier             string = "highlightProductTier"
	highlightProductUnlimitedMembers string = "highlightProductUnlimitedMembers"
	highlightRetentionPeriod         string = "highlightRetentionPeriod"
)

type AWSMPProductCode = string

const AWSMPProductCodeUsageBased AWSMPProductCode = "24dmmonsy3i8lrvjcct8mq07y"

var AWSMPProducts = map[AWSMPProductCode]backend.PlanType{
	AWSMPProductCodeUsageBased: backend.PlanTypeUsageBased,
}

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

var StandardTest = []backend.RetentionPeriod{
	backend.RetentionPeriodSixMonths,
	backend.RetentionPeriodTwelveMonths,
	backend.RetentionPeriodTwoYears,
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
	count := IncludedAmount(planType, productType)
	if planType == backend.PlanTypeFree {
		return pointy.Int64(count)
	}
	if limitCostCents == nil {
		return nil
	}

	retentionMultiplier := RetentionMultiplier(retentionPeriod)
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
		return ProductPrices[planType][productType].Items[0].Rate * 100.
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
	return price / float64(meter-included) * 100.
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
	case backend.RetentionPeriodThreeYears:
		return 3
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
func GetStripePrices(stripeClient *client.API, workspace *model.Workspace, productTier backend.PlanType, interval model.PricingSubscriptionInterval, unlimitedMembers bool, sessionsRetention *backend.RetentionPeriod, errorsRetention *backend.RetentionPeriod) (map[model.PricingProductType]*stripe.Price, error) {
	// Default to the `RetentionPeriodThreeMonths` prices for customers grandfathered into 6 month retention
	sessionsRetentionPeriod := backend.RetentionPeriodThreeMonths
	if sessionsRetention != nil {
		sessionsRetentionPeriod = *sessionsRetention
	}
	errorsRetentionPeriod := backend.RetentionPeriodThreeMonths
	if errorsRetention != nil {
		errorsRetentionPeriod = *errorsRetention
	}
	baseLookupKey := GetBaseLookupKey(productTier, interval, unlimitedMembers, sessionsRetentionPeriod)

	membersLookupKey := string(model.PricingProductTypeMembers)
	sessionsLookupKey := GetOverageKey(model.PricingProductTypeSessions, sessionsRetentionPeriod, productTier)
	errorsLookupKey := GetOverageKey(model.PricingProductTypeErrors, errorsRetentionPeriod, productTier)
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
	redis        *redis.Client
	store        *store.Store
	ccClient     *clickhouse.Client
	stripeClient *client.API
	awsmpClient  *marketplacemetering.Client
	mailClient   *sendgrid.Client
}

func NewWorker(db *gorm.DB, redis *redis.Client, store *store.Store, ccClient *clickhouse.Client, stripeClient *client.API, awsmpClient *marketplacemetering.Client, mailClient *sendgrid.Client) *Worker {
	return &Worker{
		db:           db,
		redis:        redis,
		store:        store,
		ccClient:     ccClient,
		stripeClient: stripeClient,
		awsmpClient:  awsmpClient,
		mailClient:   mailClient,
	}
}

func (w *Worker) ReportStripeUsageForWorkspace(ctx context.Context, workspaceID int) error {
	return w.reportStripeUsage(ctx, workspaceID)
}

type WorkspaceOverages = map[model.PricingProductType]int64
type AWSCustomerUsage struct {
	Customer *model.AWSMarketplaceCustomer
	Usage    WorkspaceOverages
}
type AWSCustomerUsages = map[int]AWSCustomerUsage

func (w *Worker) ReportAWSMPUsages(ctx context.Context, usages AWSCustomerUsages) {
	var now = time.Now()
	var usageRecords []types.UsageRecord
	for workspaceID, usage := range usages {
		for product, overage := range usage.Usage {
			if int64(int32(overage)) != overage {
				log.WithContext(ctx).WithField("workspaceID", workspaceID).WithField("product", product).WithField("overage", overage).Error("BILLING_ERROR aws mp overage overflowed")
				continue
			}
			usageRecords = append(usageRecords, types.UsageRecord{
				CustomerIdentifier: usage.Customer.CustomerIdentifier,
				Timestamp:          &now,
				Dimension:          pointy.String(strings.ToLower(string(product))),
				Quantity:           pointy.Int32(int32(overage)),
			})
		}
	}
	for _, chunk := range lo.Chunk(usageRecords, 25) {
		if _, err := w.awsmpClient.BatchMeterUsage(ctx, &marketplacemetering.BatchMeterUsageInput{
			ProductCode:  pointy.String(AWSMPProductCodeUsageBased),
			UsageRecords: chunk,
		}); err != nil {
			log.WithContext(ctx).WithError(err).Error("BILLING_ERROR failed to report aws mp usages")
		}
		log.WithContext(ctx).WithField("chunk", chunk).Infof("reported aws mp usage for %d records", len(chunk))
	}
}

func (w *Worker) CalculateOverages(ctx context.Context, workspaceID int) (WorkspaceOverages, error) {
	var workspace model.Workspace
	if err := w.db.WithContext(ctx).Model(&workspace).Where("id = ?", workspaceID).Take(&workspace).Error; err != nil {
		return nil, e.Wrap(err, "error querying workspace")
	}

	var usage = make(WorkspaceOverages)
	// Update members overage
	membersMeter := GetWorkspaceMembersMeter(w.db, workspaceID)
	membersLimit := TypeToMemberLimit(backend.PlanType(workspace.PlanTier), workspace.UnlimitedMembers)
	if membersLimit != nil && workspace.MonthlyMembersLimit != nil {
		membersLimit = pointy.Int64(int64(*workspace.MonthlyMembersLimit))
	}
	usage[model.PricingProductTypeMembers] = calculateOverage(&workspace, membersLimit, membersMeter)

	// Update sessions overage
	sessionsMeter, err := GetWorkspaceSessionsMeter(ctx, w.db, w.ccClient, &workspace)
	if err != nil {
		return nil, e.Wrap(err, "BILLING_ERROR error getting sessions meter")
	}
	sessionsLimit := IncludedAmount(backend.PlanType(workspace.PlanTier), model.PricingProductTypeSessions)
	if workspace.MonthlySessionLimit != nil {
		sessionsLimit = int64(*workspace.MonthlySessionLimit)
	}
	usage[model.PricingProductTypeSessions] = calculateOverage(&workspace, &sessionsLimit, sessionsMeter)

	// Update errors overage
	errorsMeter, err := GetWorkspaceErrorsMeter(ctx, w.db, w.ccClient, &workspace)
	if err != nil {
		return nil, e.Wrap(err, "BILLING_ERROR error getting errors meter")
	}
	errorsLimit := IncludedAmount(backend.PlanType(workspace.PlanTier), model.PricingProductTypeErrors)
	if workspace.MonthlyErrorsLimit != nil {
		errorsLimit = int64(*workspace.MonthlyErrorsLimit)
	}
	usage[model.PricingProductTypeErrors] = calculateOverage(&workspace, &errorsLimit, errorsMeter)

	// Update logs overage
	logsMeter, err := GetWorkspaceLogsMeter(ctx, w.db, w.ccClient, &workspace)
	if err != nil {
		return nil, e.Wrap(err, "BILLING_ERROR error getting errors meter")
	}
	logsLimit := IncludedAmount(backend.PlanType(workspace.PlanTier), model.PricingProductTypeLogs)
	if workspace.MonthlyLogsLimit != nil {
		logsLimit = int64(*workspace.MonthlyLogsLimit)
	}
	usage[model.PricingProductTypeLogs] = calculateOverage(&workspace, &logsLimit, logsMeter)

	// Update traces overage
	tracesMeter, err := GetWorkspaceTracesMeter(ctx, w.db, w.ccClient, &workspace)
	if err != nil {
		return nil, e.Wrap(err, "BILLING_ERROR error getting traces meter")
	}
	tracesLimit := IncludedAmount(backend.PlanType(workspace.PlanTier), model.PricingProductTypeTraces)
	if workspace.MonthlyTracesLimit != nil {
		tracesLimit = int64(*workspace.MonthlyTracesLimit)
	}
	usage[model.PricingProductTypeTraces] = calculateOverage(&workspace, &tracesLimit, tracesMeter)

	return usage, nil
}

func (w *Worker) reportStripeUsage(ctx context.Context, workspaceID int) error {
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
		return e.New("BILLING_ERROR cannot report usage - customer has multiple subscriptions")
	} else if len(c.Subscriptions.Data) == 0 {
		return e.New("BILLING_ERROR cannot report usage - customer has no subscriptions")
	}

	subscriptions := c.Subscriptions.Data
	FillProducts(w.stripeClient, subscriptions)

	subscription := subscriptions[0]

	if len(lo.Filter(subscription.Items.Data, func(item *stripe.SubscriptionItem, _ int) bool {
		return item.Price.Recurring.UsageType != stripe.PriceRecurringUsageTypeMetered
	})) != 1 {
		return e.New("BILLING_ERROR cannot report usage - subscription has multiple products")
	}

	baseProductItem, ok := lo.Find(subscription.Items.Data, func(item *stripe.SubscriptionItem) bool {
		_, ok := item.Price.Product.Metadata[highlightProductType]
		return ok
	})
	if !ok {
		return e.New("BILLING_ERROR cannot report usage - cannot find base product")
	}

	_, productTier, _, interval, _ := GetProductMetadata(baseProductItem.Price)
	if productTier == nil {
		return e.New("BILLING_ERROR cannot report usage - product has no tier")
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
				log.WithContext(ctx).Error(e.Wrap(err, "BILLING_ERROR failed to send billing notifications"))
			}
		} else if subscriptionEnd.Before(time.Now().AddDate(0, 0, 7)) {
			// If the Stripe trial is ending within 7 days, send an email
			if err := model.SendBillingNotifications(ctx, w.db, w.mailClient, email.BillingStripeTrial7Days, &workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "BILLING_ERROR failed to send billing notifications"))
			}
		}
	}

	// For annual subscriptions, set PendingInvoiceItemInterval to 'month' if not set
	if interval == model.PricingSubscriptionIntervalAnnual &&
		subscription.PendingInvoiceItemInterval != nil &&
		subscription.PendingInvoiceItemInterval.Interval != stripe.SubscriptionPendingInvoiceItemIntervalIntervalMonth {
		updated, err := w.stripeClient.Subscriptions.Update(subscription.ID, &stripe.SubscriptionParams{
			PendingInvoiceItemInterval: &stripe.SubscriptionPendingInvoiceItemIntervalParams{
				Interval: stripe.String(string(stripe.SubscriptionPendingInvoiceItemIntervalIntervalMonth)),
			},
		})
		if err != nil {
			return e.Wrap(err, "BILLING_ERROR failed to update PendingInvoiceItemInterval")
		}

		if updated.NextPendingInvoiceItemInvoice != 0 {
			timestamp := time.Unix(updated.NextPendingInvoiceItemInvoice, 0)
			if err := w.db.WithContext(ctx).Model(&workspace).Where("id = ?", workspaceID).
				Updates(&model.Workspace{
					NextInvoiceDate: &timestamp,
				}).Error; err != nil {
				return e.Wrapf(err, "BILLING_ERROR error updating workspace NextInvoiceDate")
			}
		}
	}

	prices, err := GetStripePrices(w.stripeClient, &workspace, *productTier, interval, workspace.UnlimitedMembers, workspace.RetentionPeriod, workspace.ErrorsRetentionPeriod)
	if err != nil {
		return e.Wrap(err, "BILLING_ERROR cannot report usage - failed to get Stripe prices")
	}

	invoiceParams := &stripe.InvoiceUpcomingParams{
		Customer:     &c.ID,
		Subscription: &subscription.ID,
	}

	invoice, err := w.stripeClient.Invoices.Upcoming(invoiceParams)
	// Cancelled subscriptions have no upcoming invoice - we can skip these since we won't
	// be charging any overage for their next billing period.
	if err != nil {
		if err.Error() == string(stripe.ErrorCodeInvoiceUpcomingNone) {
			return nil
		} else {
			log.WithContext(ctx).Error(err)
			return e.Wrap(err, "BILLING_ERROR cannot report usage - failed to retrieve upcoming invoice for customer "+c.ID)
		}
	}

	invoiceLinesParams := &stripe.InvoiceUpcomingLinesParams{
		Customer:     &c.ID,
		Subscription: &subscription.ID,
	}
	invoiceLinesParams.AddExpand("data.price.product")

	i := w.stripeClient.Invoices.UpcomingLines(invoiceLinesParams)
	if err = i.Err(); err != nil {
		return e.Wrap(err, "BILLING_ERROR cannot report usage - failed to retrieve invoice lines for customer "+c.ID)
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
			return e.Wrapf(err, "BILLING_ERROR empty group, failed to group invoice lines for %s", subscriptionItem)
		}
		// if the subscriptionItem is not set, these are non-graduated line items that we want to delete
		// if set, we only want to keep the first line item
		if subscriptionItem != "" {
			group = []*stripe.InvoiceLineItem{group[0]}
		}
		for _, line := range group {
			productType, _, _, _, _ := GetProductMetadata(line.Price)
			if productType != nil {
				// if the line is from an old price, warn so we can check and manually delete it
				if line.Price.ID != prices[*productType].ID {
					log.WithContext(ctx).Warnf("STRIPE_INTEGRATION_WARN mismatched invoice line item %s existing %s expected %s for customer %s", line.ID, line.Price.ID, prices[*productType].ID, c.ID)
				} else {
					invoiceLines[*productType] = line
				}
			}
		}
	}
	log.WithContext(ctx).WithField("invoiceLinesLen", len(invoiceLines)).Infof("STRIPE_INTEGRATION_INFO found invoice lines %d %+v", len(invoiceLines), invoiceLines)

	billingIssue, err := w.GetBillingIssue(ctx, &workspace, c, subscription, invoice)
	if err != nil {
		log.WithContext(ctx).WithError(err).WithField("customer", c.ID).Error("BILLING_ERROR failed to get billing issue status")
	} else {
		w.ProcessBillingIssue(ctx, &workspace, billingIssue)
	}

	overages, err := w.CalculateOverages(ctx, workspaceID)
	if err != nil {
		return e.Wrap(err, "BILLING_ERROR error calculating workspace overages")
	}

	for _, productType := range []model.PricingProductType{
		model.PricingProductTypeMembers,
		model.PricingProductTypeSessions,
		model.PricingProductTypeErrors,
		model.PricingProductTypeLogs,
		model.PricingProductTypeTraces,
	} {
		if err := w.AddOrUpdateOverageItem(prices[productType], invoiceLines[productType], c, subscription, overages[productType]); err != nil {
			return e.Wrapf(err, "BILLING_ERROR error updating overage item for product %s", productType)
		}
	}

	return nil
}

type PaymentIssueType = string

const PaymentIssueTypeSubscriptionDue PaymentIssueType = "subscription_due"
const PaymentIssueTypeInvoiceUncollectible PaymentIssueType = "invoice_uncollectible"
const PaymentIssueTypeInvoiceOpenAttempted PaymentIssueType = "invoice_open_attempted"
const PaymentIssueTypeNoPaymentMethod PaymentIssueType = "no_payment_method"
const PaymentIssueTypeCardCheckFail PaymentIssueType = "payment_method_check_failed"

func (w *Worker) GetBillingIssue(ctx context.Context, workspace *model.Workspace, customer *stripe.Customer, subscription *stripe.Subscription, invoice *stripe.Invoice) (PaymentIssueType, error) {
	settings, err := w.store.GetAllWorkspaceSettings(ctx, workspace.ID)
	if err != nil {
		return "", err
	}
	if !settings.CanShowBillingIssueBanner {
		return "", err
	}

	if invalid := map[stripe.SubscriptionStatus]bool{
		stripe.SubscriptionStatusIncomplete: true,
		stripe.SubscriptionStatusPastDue:    true,
		stripe.SubscriptionStatusUnpaid:     true,
	}[subscription.Status]; invalid {
		log.WithContext(ctx).WithField("customer", customer.ID).WithField("subscription_status", subscription.Status).Info("stripe unpaid invoice detected", invoice.ID)
		return PaymentIssueTypeSubscriptionDue, nil
	}

	if invoice != nil && invoice.Status == stripe.InvoiceStatusUncollectible {
		log.WithContext(ctx).WithField("customer", customer.ID).Info("stripe uncollectible invoice detected", invoice.ID)
		return PaymentIssueTypeInvoiceUncollectible, nil
	}

	if invoice != nil && invoice.Status == stripe.InvoiceStatusOpen {
		if invoice.AttemptCount > 0 {
			log.WithContext(ctx).WithField("customer", customer.ID).Info("stripe invoice found with failed attempts", invoice.ID)
			return PaymentIssueTypeInvoiceOpenAttempted, nil
		}
	}

	// check for valid CC to make sure customer is valid
	i := w.stripeClient.PaymentMethods.List(&stripe.PaymentMethodListParams{Customer: pointy.String(customer.ID)})
	if err := i.Err(); err != nil {
		return "", err
	}

	if len(i.PaymentMethodList().Data) == 0 {
		log.WithContext(ctx).WithField("customer", customer.ID).Info("no payment methods found")
		return PaymentIssueTypeNoPaymentMethod, nil
	}

	var failures, paymentMethods int
	for _, paymentMethod := range i.PaymentMethodList().Data {
		paymentMethods += 1
		if paymentMethod.Card != nil && paymentMethod.Card.Checks != nil {
			if paymentMethod.Card.Checks.CVCCheck == stripe.PaymentMethodCardChecksCVCCheckFail {
				log.WithContext(ctx).WithField("customer", customer.ID).Info("stripe cvc check failed")
				failures += 1
			}
		}
	}
	if failures >= paymentMethods {
		return PaymentIssueTypeCardCheckFail, nil
	}

	return "", nil
}

const BillingWarningPeriod = 7 * 24 * time.Hour

func (w *Worker) ProcessBillingIssue(ctx context.Context, workspace *model.Workspace, status PaymentIssueType) {
	if status == "" {
		if err := w.redis.SetCustomerBillingWarning(ctx, ptr.ToString(workspace.StripeCustomerID), time.Time{}); err != nil {
			log.WithContext(ctx).WithError(err).Error("BILLING_ERROR failed to clear customer billing warning status")
		}

		if err := w.redis.SetCustomerBillingInvalid(ctx, ptr.ToString(workspace.StripeCustomerID), false); err != nil {
			log.WithContext(ctx).WithError(err).Error("BILLING_ERROR failed to clear customer invalid billing status")
		}

		return
	}

	warningSent, err := w.redis.GetCustomerBillingWarning(ctx, ptr.ToString(workspace.StripeCustomerID))
	if err != nil {
		log.WithContext(ctx).WithError(err).Error("BILLING_ERROR failed to get customer invalid billing warning status")
		return
	}

	if warningSent.IsZero() {
		if err = model.SendBillingNotifications(ctx, w.db, w.mailClient, email.BillingInvalidPayment, workspace); err != nil {
			log.WithContext(ctx).WithError(err).Error("BILLING_ERROR failed to send customer invalid billing warning notification")
			return
		}
		warningSent = time.Now()
	}
	// keep setting the warning time to save that this customer has had a warning before
	if err := w.redis.SetCustomerBillingWarning(ctx, ptr.ToString(workspace.StripeCustomerID), warningSent); err != nil {
		log.WithContext(ctx).WithError(err).Error("BILLING_ERROR failed to set customer billing warning status")
	}

	if time.Since(warningSent) > BillingWarningPeriod {
		if err := w.redis.SetCustomerBillingInvalid(ctx, ptr.ToString(workspace.StripeCustomerID), true); err != nil {
			log.WithContext(ctx).WithError(err).Error("BILLING_ERROR failed to set customer invalid billing status")
		}
	}
}

func calculateOverage(workspace *model.Workspace, limit *int64, meter int64) int64 {
	// Calculate overage if the workspace allows it
	overage := int64(0)
	if limit != nil &&
		backend.PlanType(workspace.PlanTier) != backend.PlanTypeFree &&
		workspace.AllowMeterOverage && meter > *limit {
		overage = meter - *limit
	}
	return overage
}

func (w *Worker) AddOrUpdateOverageItem(newPrice *stripe.Price, invoiceLine *stripe.InvoiceLineItem, customer *stripe.Customer, subscription *stripe.Subscription, overage int64) error {
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
			subscriptionItem, err := w.stripeClient.SubscriptionItems.New(params)
			if err != nil {
				return e.Wrapf(err, "BILLING_ERROR failed to add invoice item for usage record item; invoiceLine=%+v, priceID=%s, subscriptionID=%s", invoiceLine, newPrice.ID, subscription.ID)
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
		if _, err := w.stripeClient.UsageRecords.New(params); err != nil {
			return e.Wrap(err, "BILLING_ERROR failed to add usage record item")
		}
	} else {
		if invoiceLine != nil {
			if _, err := w.stripeClient.InvoiceItems.Update(invoiceLine.InvoiceItem.ID, &stripe.InvoiceItemParams{
				Price:    &newPrice.ID,
				Quantity: stripe.Int64(overage),
			}); err != nil {
				return e.Wrap(err, "BILLING_ERROR failed to update invoice item")
			}
		} else {
			params := &stripe.InvoiceItemParams{
				Customer:     &customer.ID,
				Subscription: &subscription.ID,
				Price:        &newPrice.ID,
				Quantity:     stripe.Int64(overage),
			}
			params.SetIdempotencyKey(customer.ID + ":" + subscription.ID + ":" + newPrice.ID)
			if _, err := w.stripeClient.InvoiceItems.New(params); err != nil {
				return e.Wrap(err, "BILLING_ERROR failed to add invoice item")
			}
		}
	}

	return nil
}

func (w *Worker) ReportAllUsage(ctx context.Context) {
	// Get all workspace IDs
	var workspaces []*model.Workspace
	if err := w.db.WithContext(ctx).
		Model(&model.Workspace{}).
		Joins("AWSMarketplaceCustomer").
		Where("billing_period_start is not null").
		Where("billing_period_end is not null").
		Find(&workspaces).Error; err != nil {
		log.WithContext(ctx).Error("failed to query workspaces")
		return
	}

	awsWorkspaceUsages := AWSCustomerUsages{}
	for _, workspace := range workspaces {
		if workspace.AWSMarketplaceCustomer != nil {
			usage, err := w.CalculateOverages(ctx, workspace.ID)
			if err != nil {
				log.WithContext(ctx).Error(e.Wrapf(err, "error calculating aws overages for workspace %d", workspace.ID))
			} else {
				awsWorkspaceUsages[workspace.ID] = AWSCustomerUsage{workspace.AWSMarketplaceCustomer, usage}
				log.WithContext(ctx).
					WithField("workspaceID", workspace.ID).
					WithField("usage", awsWorkspaceUsages[workspace.ID].Usage).
					Info("reporting aws mp overages")
			}
		} else if err := w.reportStripeUsage(ctx, workspace.ID); err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "error reporting stripe usage for workspace %d", workspace.ID))
		}
	}
	w.ReportAWSMPUsages(ctx, awsWorkspaceUsages)
}

func GetEntitlements(ctx context.Context, customer *marketplacemetering.ResolveCustomerOutput) ([]mpeTypes.Entitlement, error) {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion("us-east-1"))
	if err != nil {
		return nil, err
	}

	var entitlements []mpeTypes.Entitlement
	var page *string
	mpe := marketplaceentitlementservice.NewFromConfig(cfg)
	for {
		ent, err := mpe.GetEntitlements(ctx, &marketplaceentitlementservice.GetEntitlementsInput{
			ProductCode: customer.ProductCode,
			Filter: map[string][]string{
				"CUSTOMER_IDENTIFIER": {pointy.StringValue(customer.CustomerIdentifier, "")},
			},
			MaxResults: pointy.Int32(25),
			NextToken:  page,
		})
		if err != nil {
			return nil, err
		}
		log.WithContext(ctx).
			WithField("customer", pointy.StringValue(customer.CustomerIdentifier, "")).
			WithField("entitlements", ent.Entitlements).
			Info("made entitlement request for customer")

		if len(ent.Entitlements) == 0 || ent.NextToken == nil {
			break
		}
		entitlements = append(entitlements, ent.Entitlements...)
		page = ent.NextToken
	}

	for _, ent := range entitlements {
		log.WithContext(ctx).
			WithField("customer", pointy.StringValue(customer.CustomerIdentifier, "")).
			WithField("entitlement_dimension", pointy.StringValue(ent.Dimension, "")).
			WithField("entitlement_value", ent.Value).
			Info("found entitlement for customer")
	}

	return entitlements, nil
}
