package util

import (
	"os"
)

type PlanType string

const (
	PlanTypeNone       PlanType = "None"
	PlanTypeBasic      PlanType = "Basic"
	PlanTypeStartup    PlanType = "Startup"
	PlanTypeEnterprise PlanType = "Enterprise"
)

func (e PlanType) String() string {
	return string(e)
}

func TypeToQuota(planType PlanType) int {
	switch planType {
	case PlanTypeNone:
		return 1000
	case PlanTypeBasic:
		return 20000
	case PlanTypeStartup:
		return 80000
	case PlanTypeEnterprise:
		return 300000
	default:
		return 1000
	}
}

func FromPriceID(priceID string) PlanType {
	switch priceID {
	case os.Getenv("BASIC_PLAN_PRICE_ID"):
		return PlanTypeBasic
	case os.Getenv("STARTUP_PLAN_PRICE_ID"):
		return PlanTypeStartup
	case os.Getenv("ENTERPRISE_PLAN_PRICE_ID"):
		return PlanTypeEnterprise
	}
	return PlanTypeNone
}

func ToPriceID(plan PlanType) string {
	switch plan {
	case PlanTypeBasic:
		return os.Getenv("BASIC_PLAN_PRICE_ID")
	case PlanTypeStartup:
		return os.Getenv("STARTUP_PLAN_PRICE_ID")
	case PlanTypeEnterprise:
		return os.Getenv("ENTERPRISE_PLAN_PRICE_ID")
	}
	return ""
}
