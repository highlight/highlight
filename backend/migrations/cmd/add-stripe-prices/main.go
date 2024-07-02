package main

import (
	"context"
	"fmt"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/price"
	"math"
)

var (
	stripeApiKey            = env.Config.StripeApiKey
	stripeSessionsProductId = env.Config.StripeSessionsProductID
	stripeErrorsProductId   = env.Config.StripeErrorsProductID
)

var sessionsIntervals = []lo.Tuple2[*int64, float64]{
	{A: pointy.Int64(14_999), B: 2.},
	{A: pointy.Int64(49_999), B: 1.5},
	{A: pointy.Int64(149_999), B: 1.2},
	{A: pointy.Int64(499_999), B: .65},
	{A: pointy.Int64(999_999), B: .35},
	{A: nil, B: .25},
}

var errorsIntervals = []lo.Tuple2[*int64, float64]{
	{A: pointy.Int64(49_999), B: 0.2},
	{A: pointy.Int64(99_999), B: 0.05},
	{A: pointy.Int64(199_999), B: 0.025},
	{A: pointy.Int64(499_999), B: 0.02},
	{A: pointy.Int64(4_999_999), B: 0.01},
	{A: nil, B: .005},
}

var retentionMultipliers = []lo.Tuple2[model.RetentionPeriod, float64]{
	{A: model.RetentionPeriodSixMonths, B: 1.5},
	{A: model.RetentionPeriodTwelveMonths, B: 2},
	{A: model.RetentionPeriodTwoYears, B: 2.5},
}

func main() {
	stripe.Key = stripeApiKey

	configs := []lo.Tuple3[string, string, []lo.Tuple2[*int64, float64]]{
		{A: "SESSIONS", B: stripeSessionsProductId, C: sessionsIntervals},
		{A: "ERRORS", B: stripeErrorsProductId, C: errorsIntervals},
	}

	for _, c := range configs {
		productKey := c.A
		productId := c.B
		intervals := c.C

		for _, rm := range retentionMultipliers {
			retention := rm.A
			multiplier := rm.B

			tiers := []*stripe.PriceTierParams{}

			for _, interval := range intervals {
				tiers = append(tiers, &stripe.PriceTierParams{
					UnitAmountDecimal: pointy.Float64(math.Round(interval.B*multiplier*1e4) / 1e4),
					UpTo:              interval.A,
					UpToInf:           pointy.Bool(interval.A == nil),
				})
			}

			params := &stripe.PriceParams{
				Currency:      pointy.String(string(stripe.CurrencyUSD)),
				BillingScheme: pointy.String(string(stripe.PriceBillingSchemeTiered)),
				Tiers:         tiers,
				TiersMode:     pointy.String(string(stripe.PriceTiersModeGraduated)),
				Recurring: &stripe.PriceRecurringParams{
					AggregateUsage: pointy.String(string(stripe.PriceRecurringAggregateUsageLastDuringPeriod)),
					Interval:       pointy.String(string(stripe.PriceRecurringIntervalMonth)),
					UsageType:      pointy.String(string(stripe.PriceRecurringUsageTypeMetered)),
				},
				LookupKey: pointy.String(fmt.Sprintf("%s|%s|Graduated", productKey, retention)),
				Product:   &productId,
			}

			_, err := price.New(params)
			if err != nil {
				logrus.WithContext(context.TODO()).Fatal(err)
			}
		}
	}

}
