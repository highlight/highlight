package model

type PricingProductType string

const (
	PricingProductTypeBase     PricingProductType = "BASE"
	PricingProductTypeMembers  PricingProductType = "MEMBERS"
	PricingProductTypeSessions PricingProductType = "SESSIONS"
	PricingProductTypeErrors   PricingProductType = "ERRORS"
	PricingProductTypeLogs     PricingProductType = "LOGS"
	PricingProductTypeTraces   PricingProductType = "TRACES"
	PricingProductTypeMetrics  PricingProductType = "METRICS"
)

type PricingSubscriptionInterval string

const (
	PricingSubscriptionIntervalMonthly PricingSubscriptionInterval = "MONTHLY"
	PricingSubscriptionIntervalAnnual  PricingSubscriptionInterval = "ANNUAL"
)
