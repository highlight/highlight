package pricing

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/highlight-run/highlight/backend/clickhouse"
	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/model"
	backend "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	"github.com/samber/lo"
	"github.com/sendgrid/sendgrid-go"
	log "github.com/sirupsen/logrus"
	stripe "github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
)

const (
	highlightProductType             string = "highlightProductType"
	highlightProductTier             string = "highlightProductTier"
	highlightProductUnlimitedMembers string = "highlightProductUnlimitedMembers"
	highlightRetentionPeriod         string = "highlightRetentionPeriod"
)

type ProductType string

const (
	ProductTypeBase     ProductType = "BASE"
	ProductTypeMembers  ProductType = "MEMBERS"
	ProductTypeSessions ProductType = "SESSIONS"
	ProductTypeErrors   ProductType = "ERRORS"
	ProductTypeLogs     ProductType = "LOGS"
)

type SubscriptionInterval string

const (
	SubscriptionIntervalMonthly SubscriptionInterval = "MONTHLY"
	SubscriptionIntervalAnnual  SubscriptionInterval = "ANNUAL"
)

func GetWorkspaceMembersMeter(DB *gorm.DB, workspaceID int) int64 {
	return DB.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).Association("Admins").Count()
}

func GetSessions7DayAverage(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (float64, error) {
	var avg float64
	if err := DB.Raw(`
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
	var meter int64
	if err := DB.Raw(`
			SELECT COALESCE(SUM(count), 0) as currentPeriodSessionCount
			FROM daily_session_counts_view
			WHERE project_id in (SELECT id FROM projects WHERE workspace_id=?)
			AND date >= (
				SELECT COALESCE(next_invoice_date - interval '1 month', billing_period_start, date_trunc('month', now(), 'UTC'))
				FROM workspaces
				WHERE id=?)
			AND date < (
				SELECT COALESCE(next_invoice_date, billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=?)`, workspace.ID, workspace.ID, workspace.ID).
		Scan(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
}

func GetErrors7DayAverage(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (float64, error) {
	var avg float64
	if err := DB.Raw(`
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
	var meter int64
	if err := DB.Raw(`
			SELECT COALESCE(SUM(count), 0) as currentPeriodErrorsCount
			FROM daily_error_counts_view
			WHERE project_id in (SELECT id FROM projects WHERE workspace_id=?)
			AND date >= (
				SELECT COALESCE(next_invoice_date - interval '1 month', billing_period_start, date_trunc('month', now(), 'UTC'))
				FROM workspaces
				WHERE id=?)
			AND date < (
				SELECT COALESCE(next_invoice_date, billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=?)`, workspace.ID, workspace.ID, workspace.ID).
		Scan(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
}

func GetLogs7DayAverage(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (float64, error) {
	startDate := time.Now().AddDate(0, 0, -8)
	endDate := time.Now().AddDate(0, 0, -1)
	projectIds := lo.Map(workspace.Projects, func(p model.Project, _ int) int {
		return p.ID
	})

	return ccClient.ReadLogsDailyAverage(ctx, projectIds, backend.DateRangeRequiredInput{StartDate: startDate, EndDate: endDate})
}

func GetWorkspaceLogsMeter(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, workspace *model.Workspace) (int64, error) {
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

	count, err := ccClient.ReadLogsDailySum(ctx, projectIds, backend.DateRangeRequiredInput{StartDate: startDate, EndDate: endDate})
	if err != nil {
		return 0, err
	}

	return int64(count), nil
}

func GetProjectQuotaOverflow(ctx context.Context, DB *gorm.DB, projectID int) (int64, error) {
	var queriedSessionsOverQuota int64
	sessionsOverQuotaCountSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.sessionsOverQuotaCountQuery"), tracer.Tag("project_id", projectID))
	defer sessionsOverQuotaCountSpan.Finish()
	if err := DB.Model(&model.Session{}).
		Where(`project_id = ?
			AND within_billing_quota = false`, projectID).
		Count(&queriedSessionsOverQuota).Error; err != nil {
		return 0, e.Wrap(err, "error querying sessions over quota count")
	}
	return queriedSessionsOverQuota, nil
}

func ProductToIncludedQuantity(productType ProductType) int64 {
	switch productType {
	case ProductTypeSessions:
		return 500
	case ProductTypeErrors:
		return 1_000
	case ProductTypeLogs:
		return 1_000_000
	default:
		return 0
	}
}

func ProductToBasePriceCents(productType ProductType) float64 {
	switch productType {
	case ProductTypeSessions:
		return 2
	case ProductTypeErrors:
		return .02
	case ProductTypeLogs:
		return .00015
	default:
		return 0
	}
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

func TypeToMemberLimit(planType backend.PlanType, unlimitedMembers bool) *int {
	if unlimitedMembers {
		return nil
	}
	switch planType {
	case backend.PlanTypeFree:
		return pointy.Int(2)
	case backend.PlanTypeBasic:
		return pointy.Int(2)
	case backend.PlanTypeStartup:
		return pointy.Int(8)
	case backend.PlanTypeEnterprise:
		return pointy.Int(15)
	default:
		return pointy.Int(2)
	}
}

func TypeToSessionsLimit(planType backend.PlanType) int {
	switch planType {
	case backend.PlanTypeFree:
		return 500
	case backend.PlanTypeLite:
		return 2000
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

func TypeToErrorsLimit(planType backend.PlanType) int {
	switch planType {
	case backend.PlanTypeFree:
		return 1000
	case backend.PlanTypeLite:
		return 4000
	case backend.PlanTypeBasic:
		return 20000
	case backend.PlanTypeStartup:
		return 160000
	case backend.PlanTypeEnterprise:
		return 600000
	default:
		return 1000
	}
}

func TypeToLogsLimit(planType backend.PlanType) int {
	switch planType {
	case backend.PlanTypeFree:
		return 1000000
	case backend.PlanTypeLite:
		return 4000000
	case backend.PlanTypeBasic:
		return 20000000
	case backend.PlanTypeStartup:
		return 160000000
	case backend.PlanTypeEnterprise:
		return 600000000
	default:
		return 1000000
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

// MustUpgradeForClearbit shows when tier is insufficient for Clearbit.
func MustUpgradeForClearbit(tier string) bool {
	pt := backend.PlanType(tier)
	return pt != backend.PlanTypeStartup && pt != backend.PlanTypeEnterprise
}

// Returns a Stripe lookup key which maps to a single Stripe Price
func GetBaseLookupKey(productTier backend.PlanType, interval SubscriptionInterval, unlimitedMembers bool, retentionPeriod backend.RetentionPeriod) (result string) {
	if productTier == backend.PlanTypeUsageBased {
		return fmt.Sprintf("%s|%s", ProductTypeBase, backend.PlanTypeUsageBased)
	}
	result = fmt.Sprintf("%s|%s|%s", ProductTypeBase, string(productTier), string(interval))
	if unlimitedMembers {
		result += "|UNLIMITED_MEMBERS"
	}
	if retentionPeriod != backend.RetentionPeriodThreeMonths {
		result += "|" + string(retentionPeriod)
	}
	return
}

func GetOverageKey(productType ProductType, retentionPeriod backend.RetentionPeriod, planType backend.PlanType) string {
	result := string(productType)
	if retentionPeriod != backend.RetentionPeriodThreeMonths {
		result += "|" + string(retentionPeriod)
	}
	if productType == ProductTypeSessions && planType == backend.PlanTypeUsageBased {
		result += "|UsageBased"
	}
	return result
}

// Returns the Highlight ProductType, Tier, and Interval for the Stripe Price
func GetProductMetadata(price *stripe.Price) (*ProductType, *backend.PlanType, bool, SubscriptionInterval, backend.RetentionPeriod) {
	interval := SubscriptionIntervalMonthly
	if price.Recurring != nil && price.Recurring.Interval == stripe.PriceRecurringIntervalYear {
		interval = SubscriptionIntervalAnnual
	}

	retentionPeriod := backend.RetentionPeriodSixMonths

	// If the price id corresponds to a tier using the old conversion,
	// return it for backward compatibility
	oldTier := FromPriceID(price.ID)
	if oldTier != backend.PlanTypeFree {
		base := ProductTypeBase
		return &base, &oldTier, false, interval, retentionPeriod
	}

	var productTypePtr *ProductType
	var tierPtr *backend.PlanType

	if typeStr, ok := price.Product.Metadata[highlightProductType]; ok {
		productType := ProductType(typeStr)
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
func GetStripePrices(stripeClient *client.API, productTier backend.PlanType, interval SubscriptionInterval, unlimitedMembers bool, retentionPeriod *backend.RetentionPeriod) (map[ProductType]*stripe.Price, error) {
	// Default to the `RetentionPeriodThreeMonths` prices for customers grandfathered into 6 month retention
	rp := backend.RetentionPeriodThreeMonths
	if retentionPeriod != nil {
		rp = *retentionPeriod
	}
	baseLookupKey := GetBaseLookupKey(productTier, interval, unlimitedMembers, rp)

	sessionsLookupKey := GetOverageKey(ProductTypeSessions, rp, productTier)
	membersLookupKey := string(ProductTypeMembers)
	errorsLookupKey := GetOverageKey(ProductTypeErrors, rp, productTier)
	logsLookupKey := string(ProductTypeLogs)

	priceListParams := stripe.PriceListParams{}
	priceListParams.LookupKeys = []*string{&baseLookupKey, &sessionsLookupKey, &membersLookupKey, &errorsLookupKey, &logsLookupKey}
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

	priceMap := map[ProductType]*stripe.Price{}
	for _, price := range prices {
		switch price.LookupKey {
		case baseLookupKey:
			priceMap[ProductTypeBase] = price
		case sessionsLookupKey:
			priceMap[ProductTypeSessions] = price
		case membersLookupKey:
			priceMap[ProductTypeMembers] = price
		case errorsLookupKey:
			priceMap[ProductTypeErrors] = price
		case logsLookupKey:
			priceMap[ProductTypeLogs] = price
		}
	}

	if len(priceMap) != expected {
		return nil, e.New("one or more prices was not found")
	}

	return priceMap, nil
}

func ReportUsageForWorkspace(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, stripeClient *client.API, mailClient *sendgrid.Client, workspaceID int) error {
	return reportUsage(ctx, DB, ccClient, stripeClient, mailClient, workspaceID, nil)
}

func reportUsage(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, stripeClient *client.API, mailClient *sendgrid.Client, workspaceID int, productType *ProductType) error {
	var workspace model.Workspace
	if err := DB.Model(&workspace).Where("id = ?", workspaceID).First(&workspace).Error; err != nil {
		return e.Wrap(err, "error querying workspace")
	}
	var projects []model.Project
	if err := DB.Model(&model.Project{}).Where("workspace_id = ?", workspaceID).Find(&projects).Error; err != nil {
		return e.Wrap(err, "error querying projects in workspace")
	}
	workspace.Projects = projects

	// If the trial end date is recent (within the past 7 days) or it hasn't ended yet
	// The 7 day check is to avoid sending emails to customers whose trials ended long ago
	if workspace.TrialEndDate != nil && workspace.TrialEndDate.After(time.Now().AddDate(0, 0, -7)) {
		if workspace.TrialEndDate.Before(time.Now()) {
			// If the trial has ended, send an email
			if err := model.SendBillingNotifications(ctx, DB, mailClient, email.BillingHighlightTrialEnded, &workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		} else if workspace.TrialEndDate.Before(time.Now().AddDate(0, 0, 7)) {
			// If the trial is ending within 7 days, send an email
			if err := model.SendBillingNotifications(ctx, DB, mailClient, email.BillingHighlightTrial7Days, &workspace); err != nil {
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
	c, err := stripeClient.Customers.Get(*workspace.StripeCustomerID, customerParams)
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
	FillProducts(stripeClient, subscriptions)

	subscription := subscriptions[0]

	if len(subscription.Items.Data) != 1 {
		return e.New("STRIPE_INTEGRATION_ERROR cannot report usage - subscription has multiple products")
	}
	subscriptionItem := subscription.Items.Data[0]
	_, productTier, _, interval, _ := GetProductMetadata(subscriptionItem.Price)
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
			if err := model.SendBillingNotifications(ctx, DB, mailClient, email.BillingStripeTrial3Days, &workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		} else if subscriptionEnd.Before(time.Now().AddDate(0, 0, 7)) {
			// If the Stripe trial is ending within 7 days, send an email
			if err := model.SendBillingNotifications(ctx, DB, mailClient, email.BillingStripeTrial7Days, &workspace); err != nil {
				log.WithContext(ctx).Error(e.Wrap(err, "failed to send billing notifications"))
			}
		}
	}

	// For annual subscriptions, set PendingInvoiceItemInterval to 'month' if not set
	if interval == SubscriptionIntervalAnnual &&
		subscription.PendingInvoiceItemInterval.Interval != stripe.SubscriptionPendingInvoiceItemIntervalIntervalMonth {
		updated, err := stripeClient.Subscriptions.Update(subscription.ID, &stripe.SubscriptionParams{
			PendingInvoiceItemInterval: &stripe.SubscriptionPendingInvoiceItemIntervalParams{
				Interval: stripe.String(string(stripe.SubscriptionPendingInvoiceItemIntervalIntervalMonth)),
			},
		})
		if err != nil {
			return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to update PendingInvoiceItemInterval")
		}

		if updated.NextPendingInvoiceItemInvoice != 0 {
			timestamp := time.Unix(updated.NextPendingInvoiceItemInvoice, 0)
			if err := DB.Model(&workspace).Where("id = ?", workspaceID).
				Updates(&model.Workspace{
					NextInvoiceDate: &timestamp,
				}).Error; err != nil {
				return e.Wrapf(err, "STRIPE_INTEGRATION_ERROR error updating workspace NextInvoiceDate")
			}
		}
	}

	prices, err := GetStripePrices(stripeClient, *productTier, interval, workspace.UnlimitedMembers, workspace.RetentionPeriod)
	if err != nil {
		return e.Wrap(err, "STRIPE_INTEGRATION_ERROR cannot report usage - failed to get Stripe prices")
	}

	invoiceParams := &stripe.InvoiceParams{
		Customer:     &c.ID,
		Subscription: &subscription.ID,
	}
	invoiceParams.AddExpand("lines.data.price.product")

	invoice, err := stripeClient.Invoices.GetNext(invoiceParams)
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

	invoiceLines := map[ProductType]*stripe.InvoiceLine{}
	for _, line := range invoice.Lines.Data {
		productType, _, _, _, _ := GetProductMetadata(line.Price)
		if productType != nil {
			invoiceLines[*productType] = line
		}
	}

	// Update members overage
	membersMeter := GetWorkspaceMembersMeter(DB, workspaceID)
	membersLimit := TypeToMemberLimit(backend.PlanType(workspace.PlanTier), workspace.UnlimitedMembers)
	if membersLimit != nil && workspace.MonthlyMembersLimit != nil {
		membersLimit = workspace.MonthlyMembersLimit
	}
	if err := AddOrUpdateOverageItem(stripeClient, &workspace, prices[ProductTypeMembers], invoiceLines[ProductTypeMembers], c, subscription, membersLimit, membersMeter); err != nil {
		return e.Wrap(err, "error updating overage item")
	}

	// Update sessions overage
	sessionsMeter, err := GetWorkspaceSessionsMeter(ctx, DB, ccClient, &workspace)
	if err != nil {
		return e.Wrap(err, "error getting sessions meter")
	}
	sessionsLimit := TypeToSessionsLimit(backend.PlanType(workspace.PlanTier))
	if workspace.MonthlySessionLimit != nil {
		sessionsLimit = *workspace.MonthlySessionLimit
	}
	if err := AddOrUpdateOverageItem(stripeClient, &workspace, prices[ProductTypeSessions], invoiceLines[ProductTypeSessions], c, subscription, &sessionsLimit, sessionsMeter); err != nil {
		return e.Wrap(err, "error updating overage item")
	}

	// Update errors overage
	errorsMeter, err := GetWorkspaceErrorsMeter(ctx, DB, ccClient, &workspace)
	if err != nil {
		return e.Wrap(err, "error getting errors meter")
	}
	errorsLimit := TypeToErrorsLimit(backend.PlanType(workspace.PlanTier))
	if workspace.MonthlyErrorsLimit != nil {
		errorsLimit = *workspace.MonthlyErrorsLimit
	}
	if err := AddOrUpdateOverageItem(stripeClient, &workspace, prices[ProductTypeErrors], invoiceLines[ProductTypeErrors], c, subscription, &errorsLimit, errorsMeter); err != nil {
		return e.Wrap(err, "error updating overage item")
	}

	// Update logs overage
	logsMeter, err := GetWorkspaceLogsMeter(ctx, DB, ccClient, &workspace)
	if err != nil {
		return e.Wrap(err, "error getting errors meter")
	}
	logsLimit := TypeToLogsLimit(backend.PlanType(workspace.PlanTier))
	if workspace.MonthlyLogsLimit != nil {
		errorsLimit = *workspace.MonthlyErrorsLimit
	}
	if err := AddOrUpdateOverageItem(stripeClient, &workspace, prices[ProductTypeLogs], invoiceLines[ProductTypeLogs], c, subscription, &logsLimit, logsMeter); err != nil {
		return e.Wrap(err, "error updating overage item")
	}

	return nil
}

func AddOrUpdateOverageItem(stripeClient *client.API, workspace *model.Workspace, newPrice *stripe.Price, invoiceLine *stripe.InvoiceLine, customer *stripe.Customer, subscription *stripe.Subscription, limit *int, meter int64) error {
	// Calculate overage if the workspace allows it
	overage := int64(0)
	if limit != nil &&
		backend.PlanType(workspace.PlanTier) != backend.PlanTypeFree &&
		workspace.AllowMeterOverage && meter > int64(*limit) {
		overage = meter - int64(*limit)
	}

	if invoiceLine != nil {
		if _, err := stripeClient.InvoiceItems.Update(invoiceLine.InvoiceItem, &stripe.InvoiceItemParams{
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

	return nil
}

func ReportAllUsage(ctx context.Context, DB *gorm.DB, ccClient *clickhouse.Client, stripeClient *client.API, mailClient *sendgrid.Client) {
	// Get all workspace IDs
	var workspaceIDs []int
	if err := DB.Raw(`
		SELECT id
		FROM workspaces
		WHERE billing_period_start is not null
		AND billing_period_end is not null
	`).Scan(&workspaceIDs).Error; err != nil {
		log.WithContext(ctx).Error("failed to query workspaces")
		return
	}

	for _, workspaceID := range workspaceIDs {
		if err := reportUsage(ctx, DB, ccClient, stripeClient, mailClient, workspaceID, nil); err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "error reporting usage for workspace %d", workspaceID))
		}
	}
}
