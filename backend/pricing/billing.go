package pricing

import (
	e "github.com/pkg/errors"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/client"
	"github.com/stripe/stripe-go/v78/invoice"
	"github.com/stripe/stripe-go/v78/paymentmethod"
	"github.com/stripe/stripe-go/v78/price"
	"github.com/stripe/stripe-go/v78/product"
	"github.com/stripe/stripe-go/v78/subscription"
)

type Customers interface {
	New(*stripe.CustomerParams) (*stripe.Customer, error)
	Get(string, *stripe.CustomerParams) (*stripe.Customer, error)
}

type Subscriptions interface {
	Update(string, *stripe.SubscriptionParams) (*stripe.Subscription, error)
	List(params *stripe.SubscriptionListParams) *subscription.Iter
}

type BillingPortalSessions interface {
	New(session *stripe.BillingPortalSessionParams) (*stripe.BillingPortalSession, error)
}
type CheckoutSessions interface {
	New(session *stripe.CheckoutSessionParams) (*stripe.CheckoutSession, error)
}
type InvoiceItems interface {
	New(session *stripe.InvoiceItemParams) (*stripe.InvoiceItem, error)
	Update(string, *stripe.InvoiceItemParams) (*stripe.InvoiceItem, error)
}
type Invoices interface {
	Get(string, *stripe.InvoiceParams) (*stripe.Invoice, error)
	List(*stripe.InvoiceListParams) *invoice.Iter
	Upcoming(*stripe.InvoiceUpcomingParams) (*stripe.Invoice, error)
	UpcomingLines(*stripe.InvoiceUpcomingLinesParams) *invoice.LineItemIter
}
type PaymentMethods interface {
	List(params *stripe.PaymentMethodListParams) *paymentmethod.Iter
}
type Products interface {
	List(params *stripe.ProductListParams) *product.Iter
}
type Prices interface {
	Get(string, *stripe.PriceParams) (*stripe.Price, error)
	List(*stripe.PriceListParams) *price.Iter
}
type SubscriptionItems interface {
	New(*stripe.SubscriptionItemParams) (*stripe.SubscriptionItem, error)
}
type UsageRecords interface {
	New(*stripe.UsageRecordParams) (*stripe.UsageRecord, error)
}

type Client struct {
	BillingPortalSessions BillingPortalSessions
	CheckoutSessions      CheckoutSessions
	Customers             Customers
	Invoices              Invoices
	InvoiceItems          InvoiceItems
	PaymentMethods        PaymentMethods
	Prices                Prices
	Products              Products
	Subscriptions         Subscriptions
	SubscriptionItems     SubscriptionItems
	UsageRecords          UsageRecords
}

func New(client *client.API) *Client {
	return &Client{
		BillingPortalSessions: client.BillingPortalSessions,
		CheckoutSessions:      client.CheckoutSessions,
		Customers:             client.Customers,
		Invoices:              client.Invoices,
		InvoiceItems:          client.InvoiceItems,
		PaymentMethods:        client.PaymentMethods,
		Prices:                client.Prices,
		Products:              client.Products,
		Subscriptions:         client.Subscriptions,
		SubscriptionItems:     client.SubscriptionItems,
		UsageRecords:          client.UsageRecords,
	}
}

var noopError = e.New("noop billing client")

type noopBillingPortalSessions struct{}

func (*noopBillingPortalSessions) New(*stripe.BillingPortalSessionParams) (*stripe.BillingPortalSession, error) {
	return nil, noopError
}

type noopCheckoutSessions struct{}

func (*noopCheckoutSessions) New(*stripe.CheckoutSessionParams) (*stripe.CheckoutSession, error) {
	return nil, noopError
}

type noopCustomers struct{}

func (*noopCustomers) New(*stripe.CustomerParams) (*stripe.Customer, error) {
	return nil, noopError
}

func (*noopCustomers) Get(string, *stripe.CustomerParams) (*stripe.Customer, error) {
	return nil, noopError
}

type noopInvoices struct{}

func (*noopInvoices) Get(string, *stripe.InvoiceParams) (*stripe.Invoice, error) {
	return nil, noopError
}

func (*noopInvoices) List(*stripe.InvoiceListParams) *invoice.Iter {
	return &invoice.Iter{}
}

func (*noopInvoices) Upcoming(*stripe.InvoiceUpcomingParams) (*stripe.Invoice, error) {
	return nil, noopError
}

func (*noopInvoices) UpcomingLines(*stripe.InvoiceUpcomingLinesParams) *invoice.LineItemIter {
	return &invoice.LineItemIter{}
}

type noopInvoiceItems struct{}

func (*noopInvoiceItems) New(*stripe.InvoiceItemParams) (*stripe.InvoiceItem, error) {
	return nil, noopError
}

func (*noopInvoiceItems) Update(string, *stripe.InvoiceItemParams) (*stripe.InvoiceItem, error) {
	return nil, noopError
}

type noopPaymentMethods struct{}

func (*noopPaymentMethods) List(*stripe.PaymentMethodListParams) *paymentmethod.Iter {
	return &paymentmethod.Iter{}
}

type noopPrices struct{}

func (*noopPrices) Get(string, *stripe.PriceParams) (*stripe.Price, error) {
	return nil, noopError
}

func (*noopPrices) List(*stripe.PriceListParams) *price.Iter {
	return &price.Iter{}
}

type noopProducts struct{}

func (*noopProducts) List(*stripe.ProductListParams) *product.Iter {
	return &product.Iter{}
}

type noopSubscriptions struct{}

func (*noopSubscriptions) Update(string, *stripe.SubscriptionParams) (*stripe.Subscription, error) {
	return nil, noopError
}

func (*noopSubscriptions) List(*stripe.SubscriptionListParams) *subscription.Iter {
	return &subscription.Iter{}
}

type noopSubscriptionItems struct{}

func (*noopSubscriptionItems) New(*stripe.SubscriptionItemParams) (*stripe.SubscriptionItem, error) {
	return nil, noopError
}

type noopUsageRecords struct{}

func (*noopUsageRecords) New(*stripe.UsageRecordParams) (*stripe.UsageRecord, error) {
	return nil, noopError
}

func NewNoopClient() *Client {
	return &Client{
		BillingPortalSessions: &noopBillingPortalSessions{},
		CheckoutSessions:      &noopCheckoutSessions{},
		Customers:             &noopCustomers{},
		Invoices:              &noopInvoices{},
		InvoiceItems:          &noopInvoiceItems{},
		PaymentMethods:        &noopPaymentMethods{},
		Prices:                &noopPrices{},
		Products:              &noopProducts{},
		Subscriptions:         &noopSubscriptions{},
		SubscriptionItems:     &noopSubscriptionItems{},
		UsageRecords:          &noopUsageRecords{},
	}
}
