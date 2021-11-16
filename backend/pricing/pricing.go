package pricing

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	backend "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	stripe "github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
	"gorm.io/gorm"
)

const (
	highlightProductType string = "highlightProductType"
	highlightProductTier string = "highlightProductTier"
)

type ProductType string

const (
	ProductTypeBase     ProductType = "BASE"
	ProductTypeMembers  ProductType = "MEMBERS"
	ProductTypeSessions ProductType = "SESSIONS"
)

type SubscriptionInterval string

const (
	SubscriptionIntervalMonthly SubscriptionInterval = "MONTHLY"
	SubscriptionIntervalAnnual  SubscriptionInterval = "ANNUAL"
)

func GetMembersMeter(DB *gorm.DB, workspaceID int) int64 {
	return DB.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).Association("Admins").Count()
}

func GetWorkspaceMeter(DB *gorm.DB, workspaceID int) (int64, error) {
	var meter int64
	if err := DB.Model(&model.DailySessionCount{}).
		Where(`project_id in (SELECT id FROM projects WHERE workspace_id=? AND free_tier = false)
			AND date >= (
				SELECT COALESCE(billing_period_start, date_trunc('month', now(), 'UTC'))
				FROM workspaces
				WHERE id=?)
			AND date < (
				SELECT COALESCE(billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=?)`, workspaceID, workspaceID, workspaceID).
		Select("COALESCE(SUM(count), 0) as currentPeriodSessionCount").
		Scan(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
}

func GetProjectMeter(DB *gorm.DB, project *model.Project) (int64, error) {
	var meter int64
	if err := DB.Model(&model.DailySessionCount{}).
		Where(`project_id = ?
			AND date >= (
				SELECT COALESCE(billing_period_start, date_trunc('month', now(), 'UTC'))
				FROM workspaces
				WHERE id=?)
			AND date < (
				SELECT COALESCE(billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=?)`, project.ID, project.WorkspaceID, project.WorkspaceID).
		Select("COALESCE(SUM(count), 0) as currentPeriodSessionCount").
		Scan(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
}

func GetWorkspaceQuotaOverflow(ctx context.Context, DB *gorm.DB, workspaceID int) (int64, error) {
	var queriedSessionsOverQuota int64
	sessionsOverQuotaCountSpan, _ := tracer.StartSpanFromContext(ctx, "resolver.internal",
		tracer.ResourceName("db.sessionsOverQuotaCountQuery"), tracer.Tag("workspace_id", workspaceID))
	defer sessionsOverQuotaCountSpan.Finish()
	if err := DB.Model(&model.Session{}).
		Where(`project_id in (SELECT id FROM projects WHERE workspace_id=?)
			AND created_at >= (
				SELECT COALESCE(billing_period_start, date_trunc('month', now(), 'UTC'))
				FROM workspaces
				WHERE id=?)
			AND created_at < (
				SELECT COALESCE(billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=?)`, workspaceID, workspaceID, workspaceID).
		Count(&queriedSessionsOverQuota).Error; err != nil {
		return 0, e.Wrap(err, "error querying sessions over quota count")
	}
	return queriedSessionsOverQuota, nil
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

// Returns a Stripe lookup key which maps to a single Stripe Price
func GetLookupKey(productType ProductType, productTier backend.PlanType, interval SubscriptionInterval) string {
	return fmt.Sprintf("%s|%s|%s", string(productType), string(productTier), string(interval))
}

// Returns the Highlight ProductType, Tier, and Interval for the Stripe Price
func GetProductMetadata(price *stripe.Price) (*ProductType, *backend.PlanType, SubscriptionInterval) {
	interval := SubscriptionIntervalMonthly
	if price.Recurring != nil && price.Recurring.Interval == stripe.PriceRecurringIntervalYear {
		interval = SubscriptionIntervalAnnual
	}

	// If the price id corresponds to a tier using the old conversion,
	// return it for backward compatibility
	oldTier := FromPriceID(price.ID)
	if oldTier != backend.PlanTypeFree {
		base := ProductTypeBase
		return &base, &oldTier, interval
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

	return productTypePtr, tierPtr, interval
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
func GetStripePrices(stripeClient *client.API, productTier backend.PlanType, interval SubscriptionInterval) (map[ProductType]*stripe.Price, error) {
	baseLookupKey := GetLookupKey(ProductTypeBase, productTier, interval)

	// TODO: sessions/members hardcoded to PlanTypeFree for now
	sessionsLookupKey := GetLookupKey(ProductTypeSessions, backend.PlanTypeFree, SubscriptionIntervalMonthly)
	membersLookupKey := GetLookupKey(ProductTypeMembers, backend.PlanTypeFree, SubscriptionIntervalMonthly)

	priceListParams := stripe.PriceListParams{}
	priceListParams.LookupKeys = []*string{&baseLookupKey, &sessionsLookupKey, &membersLookupKey}
	prices := stripeClient.Prices.List(&priceListParams).PriceList().Data

	// Validate that we received exactly 1 response for each lookup key
	if len(prices) != 3 {
		return nil, e.Errorf("expected 3 prices, received %d", len(prices))
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
		}
	}

	if len(priceMap) != 3 {
		return nil, e.New("one or more prices was not found")
	}

	return priceMap, nil
}

func ReportUsageForProduct(DB *gorm.DB, stripeClient *client.API, workspaceID int, productType ProductType) error {
	return reportUsage(DB, stripeClient, workspaceID, &productType)
}

func reportUsage(DB *gorm.DB, stripeClient *client.API, workspaceID int, productType *ProductType) error {
	var workspace model.Workspace
	if err := DB.Model(workspace).Where("id = ?", workspaceID).First(&workspace).Error; err != nil {
		return e.Wrap(err, "error querying workspace")
	}

	if workspace.BillingPeriodStart == nil ||
		workspace.BillingPeriodEnd == nil ||
		time.Now().Before(*workspace.BillingPeriodStart) ||
		!time.Now().Before(*workspace.BillingPeriodEnd) {
		return e.New("workspace billing period is not valid")
	}

	customerParams := &stripe.CustomerParams{}
	customerParams.AddExpand("subscriptions")
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
	_, productTier, interval := GetProductMetadata(subscriptionItem.Price)
	if productTier == nil {
		return e.New("STRIPE_INTEGRATION_ERROR cannot report usage - product has no tier")
	}

	// Set PendingInvoiceItemInterval to 'month' if not set
	if subscription.PendingInvoiceItemInterval.Interval != stripe.SubscriptionPendingInvoiceItemIntervalIntervalMonth {
		if _, err := stripeClient.Subscriptions.Update(subscription.ID, &stripe.SubscriptionParams{
			PendingInvoiceItemInterval: &stripe.SubscriptionPendingInvoiceItemIntervalParams{
				Interval: stripe.String(string(stripe.SubscriptionPendingInvoiceItemIntervalIntervalMonth)),
			},
		}); err != nil {
			return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to update PendingInvoiceItemInterval")
		}
	}

	prices, err := GetStripePrices(stripeClient, *productTier, interval)
	if err != nil {
		return e.Wrap(err, "STRIPE_INTEGRATION_ERROR cannot report usage - failed to get Stripe prices")
	}

	invoiceParams := &stripe.InvoiceParams{
		Customer:     &c.ID,
		Subscription: &subscription.ID,
	}
	invoiceParams.AddExpand("lines.data.price.product")

	invoice, err := stripeClient.Invoices.GetNext(invoiceParams)
	if err != nil {
		return e.Wrap(err, "STRIPE_INTEGRATION_ERROR cannot report usage - failed to retrieve upcoming invoice")
	}

	invoiceLines := map[ProductType]*stripe.InvoiceLine{}
	for _, line := range invoice.Lines.Data {
		productType, _, _ := GetProductMetadata(line.Price)
		if productType != nil {
			invoiceLines[*productType] = line
		}
	}

	if productType == nil || *productType == ProductTypeMembers {
		newPrice := prices[ProductTypeMembers]
		meter := GetMembersMeter(DB, workspaceID)
		log.Infof("reporting members usage for workspace %d", workspaceID)
		if membersLine, ok := invoiceLines[ProductTypeMembers]; ok {
			max := meter
			if membersLine.Quantity > max {
				max = membersLine.Quantity
			}
			if _, err := stripeClient.InvoiceItems.Update(membersLine.InvoiceItem, &stripe.InvoiceItemParams{
				Price:    &newPrice.ID,
				Quantity: stripe.Int64(max),
			}); err != nil {
				return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to update members invoice item")
			}
		} else {
			if _, err := stripeClient.InvoiceItems.New(&stripe.InvoiceItemParams{
				Customer:     &c.ID,
				Subscription: &subscription.ID,
				Price:        &newPrice.ID,
				Quantity:     stripe.Int64(meter),
			}); err != nil {
				return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to add members invoice item")
			}
		}
	}

	if productType == nil || *productType == ProductTypeSessions {
		newPrice := prices[ProductTypeSessions]
		meter, err := GetWorkspaceMeter(DB, workspaceID)
		if err != nil {
			return e.Wrap(err, "error getting sessions meter")
		}

		// If meter exceeds the plan limit, and overage is not allowed,
		// set the meter to the plan limit and report that.
		if !workspace.AllowMeterOverage {
			limit := TypeToQuota(backend.PlanType(workspace.PlanTier))
			if workspace.MonthlySessionLimit != nil {
				limit = *workspace.MonthlySessionLimit
			}
			if meter > int64(limit) {
				meter = int64(limit)
			}
		}

		log.Infof("reporting sessions usage for workspace %d", workspaceID)
		if sessionsLine, ok := invoiceLines[ProductTypeSessions]; ok {
			max := meter
			if sessionsLine.Quantity > max {
				max = sessionsLine.Quantity
			}
			if _, err := stripeClient.InvoiceItems.Update(sessionsLine.InvoiceItem, &stripe.InvoiceItemParams{
				Price:    &newPrice.ID,
				Quantity: stripe.Int64(max),
			}); err != nil {
				return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to update sessions invoice item")
			}
		} else {
			if _, err := stripeClient.InvoiceItems.New(&stripe.InvoiceItemParams{
				Customer:     &c.ID,
				Subscription: &subscription.ID,
				Price:        &newPrice.ID,
				Quantity:     stripe.Int64(meter),
			}); err != nil {
				return e.Wrap(err, "STRIPE_INTEGRATION_ERROR failed to add sessions invoice item")
			}
		}
	}

	return nil
}

func ReportAllUsage(DB *gorm.DB, stripeClient *client.API) {
	// Get all workspace IDs
	var workspaceIDs []int
	if err := DB.Raw(`
		SELECT id
		FROM workspaces
		WHERE billing_period_start is not null
		AND billing_period_end is not null
	`).Scan(&workspaceIDs).Error; err != nil {
		log.Error("failed to query workspaces")
		return
	}

	for _, workspaceID := range workspaceIDs {
		if err := reportUsage(DB, stripeClient, workspaceID, nil); err != nil {
			log.Error(e.Wrapf(err, "error reporting usage for workspace %d", workspaceID))
		}
	}
}
