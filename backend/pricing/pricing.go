package pricing

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/highlight-run/highlight/backend/email"
	"github.com/highlight-run/highlight/backend/model"
	backend "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
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
)

type SubscriptionInterval string

const (
	SubscriptionIntervalMonthly SubscriptionInterval = "MONTHLY"
	SubscriptionIntervalAnnual  SubscriptionInterval = "ANNUAL"
)

func GetWorkspaceMembersMeter(DB *gorm.DB, workspaceID int) int64 {
	return DB.Model(&model.Workspace{Model: model.Model{ID: workspaceID}}).Association("Admins").Count()
}

func GetWorkspaceSessionsMeter(DB *gorm.DB, workspaceID int) (int64, error) {
	var meter int64
	if err := DB.Raw(`
			SELECT COALESCE(SUM(count), 0) as currentPeriodSessionCount
			FROM daily_session_counts_view
			WHERE project_id in (SELECT id FROM projects WHERE workspace_id=? AND free_tier = false)
			AND date >= (
				SELECT COALESCE(next_invoice_date - interval '1 month', billing_period_start, date_trunc('month', now(), 'UTC'))
				FROM workspaces
				WHERE id=?)
			AND date < (
				SELECT COALESCE(next_invoice_date, billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=?)`, workspaceID, workspaceID, workspaceID).
		Scan(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
}

func GetWorkspaceErrorsMeter(DB *gorm.DB, workspaceID int) (int64, error) {
	var meter int64
	if err := DB.Raw(`
			SELECT COALESCE(SUM(count), 0) as currentPeriodErrorsCount
			FROM daily_error_counts
			WHERE project_id in (SELECT id FROM projects WHERE workspace_id=? AND free_tier = false)
			AND date >= (
				SELECT COALESCE(next_invoice_date - interval '1 month', billing_period_start, date_trunc('month', now(), 'UTC'))
				FROM workspaces
				WHERE id=?)
			AND date < (
				SELECT COALESCE(next_invoice_date, billing_period_end, date_trunc('month', now(), 'UTC') + interval '1 month')
				FROM workspaces
				WHERE id=?)`, workspaceID, workspaceID, workspaceID).
		Scan(&meter).Error; err != nil {
		return 0, e.Wrap(err, "error querying for session meter")
	}
	return meter, nil
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
func GetLookupKey(productType ProductType, productTier backend.PlanType, interval SubscriptionInterval, unlimitedMembers bool, retentionPeriod backend.RetentionPeriod) (result string) {
	result = fmt.Sprintf("%s|%s|%s", string(productType), string(productTier), string(interval))
	if unlimitedMembers {
		result += "|UNLIMITED_MEMBERS"
	}
	if retentionPeriod != backend.RetentionPeriodThreeMonths {
		result += "|" + string(retentionPeriod)
	}
	return
}

func GetOverageKey(productType ProductType, retentionPeriod backend.RetentionPeriod) string {
	if retentionPeriod == backend.RetentionPeriodThreeMonths {
		return string(productType)
	} else {
		return string(productType) + "|" + string(retentionPeriod)
	}
}

// Returns the Highlight ProductType, Tier, and Interval for the Stripe Price
func GetProductMetadata(price *stripe.Price) (*ProductType, *backend.PlanType, bool, SubscriptionInterval, backend.RetentionPeriod) {
	interval := SubscriptionIntervalMonthly
	if price.Recurring != nil && price.Recurring.Interval == stripe.PriceRecurringIntervalYear {
		interval = SubscriptionIntervalAnnual
	}

	// If the price id corresponds to a tier using the old conversion,
	// return it for backward compatibility
	oldTier := FromPriceID(price.ID)
	if oldTier != backend.PlanTypeFree {
		base := ProductTypeBase
		return &base, &oldTier, false, interval, ""
	}

	var productTypePtr *ProductType
	var tierPtr *backend.PlanType
	retentionPeriod := backend.RetentionPeriodSixMonths

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
func GetStripePrices(stripeClient *client.API, productTier backend.PlanType, interval SubscriptionInterval, unlimitedMembers bool, retentionPeriod backend.RetentionPeriod) (map[ProductType]*stripe.Price, error) {
	baseLookupKey := GetLookupKey(ProductTypeBase, productTier, interval, unlimitedMembers, retentionPeriod)

	sessionsLookupKey := GetOverageKey(ProductTypeSessions, retentionPeriod)
	membersLookupKey := string(ProductTypeMembers)
	errorsLookupKey := GetOverageKey(ProductTypeErrors, retentionPeriod)

	priceListParams := stripe.PriceListParams{}
	priceListParams.LookupKeys = []*string{&baseLookupKey, &sessionsLookupKey, &membersLookupKey, &errorsLookupKey}
	prices := stripeClient.Prices.List(&priceListParams).PriceList().Data

	// Validate that we received exactly 1 response for each lookup key
	if len(prices) != 4 {
		return nil, e.Errorf("expected 4 prices, received %d", len(prices))
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
		}
	}

	if len(priceMap) != 4 {
		return nil, e.New("one or more prices was not found")
	}

	return priceMap, nil
}

func ReportUsageForWorkspace(ctx context.Context, DB *gorm.DB, stripeClient *client.API, mailClient *sendgrid.Client, workspaceID int) error {
	return reportUsage(ctx, DB, stripeClient, mailClient, workspaceID, nil)
}

func reportUsage(ctx context.Context, DB *gorm.DB, stripeClient *client.API, mailClient *sendgrid.Client, workspaceID int, productType *ProductType) error {
	var workspace model.Workspace
	if err := DB.Model(&workspace).Where("id = ?", workspaceID).First(&workspace).Error; err != nil {
		return e.Wrap(err, "error querying workspace")
	}

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

	retentionPeriod := backend.RetentionPeriodSixMonths
	if workspace.RetentionPeriod != nil {
		retentionPeriod = *workspace.RetentionPeriod
	}
	prices, err := GetStripePrices(stripeClient, *productTier, interval, workspace.UnlimitedMembers, retentionPeriod)
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
	sessionsMeter, err := GetWorkspaceSessionsMeter(DB, workspace.ID)
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
	errorsMeter, err := GetWorkspaceErrorsMeter(DB, workspace.ID)
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

func ReportAllUsage(ctx context.Context, DB *gorm.DB, stripeClient *client.API, mailClient *sendgrid.Client) {
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
		if err := reportUsage(ctx, DB, stripeClient, mailClient, workspaceID, nil); err != nil {
			log.WithContext(ctx).Error(e.Wrapf(err, "error reporting usage for workspace %d", workspaceID))
		}
	}
}
