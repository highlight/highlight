package pricing

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	backend "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	e "github.com/pkg/errors"
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

// Returns the Highlight ProductType and Tier for the Stripe Price
func GetProductMetadata(price *stripe.Price) (*ProductType, *backend.PlanType) {
	// If the price id corresponds to a tier using the old conversion,
	// return it for backward compatibility
	oldTier := FromPriceID(price.ID)
	if oldTier != backend.PlanTypeFree {
		base := ProductTypeBase
		return &base, &oldTier
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

	return productTypePtr, tierPtr
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
