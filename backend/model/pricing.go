package model

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
