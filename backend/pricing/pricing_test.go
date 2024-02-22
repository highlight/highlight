package pricing

import (
	"fmt"
	"math"
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	backend "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/stretchr/testify/assert"
)

func TestGetLimitAmount(t *testing.T) {
	type Testcase struct {
		planType        backend.PlanType
		productType     model.PricingProductType
		retentionPeriod backend.RetentionPeriod
	}
	tests := map[string]Testcase{
		"test legacy plan": {
			planType:        backend.PlanTypeBasic,
			productType:     model.PricingProductTypeSessions,
			retentionPeriod: backend.RetentionPeriodTwoYears,
		},
		"test legacy plan logs": {
			planType:        backend.PlanTypeBasic,
			productType:     model.PricingProductTypeLogs,
			retentionPeriod: backend.RetentionPeriodThreeMonths,
		},
		"test usage-based plan": {
			planType:        backend.PlanTypeUsageBased,
			productType:     model.PricingProductTypeSessions,
			retentionPeriod: backend.RetentionPeriodThreeMonths,
		},
		"test usage-based plan logs": {
			planType:        backend.PlanTypeUsageBased,
			productType:     model.PricingProductTypeLogs,
			retentionPeriod: backend.RetentionPeriodThreeMonths,
		},
		"test graduated plan": {
			planType:        backend.PlanTypeGraduated,
			productType:     model.PricingProductTypeSessions,
			retentionPeriod: backend.RetentionPeriodThreeMonths,
		},
		"test graduated logs": {
			planType:        backend.PlanTypeGraduated,
			productType:     model.PricingProductTypeLogs,
			retentionPeriod: backend.RetentionPeriodThreeMonths,
		},
	}
	for name, tc := range tests {
		for _, limitCostCents := range []int{int(1.23 * 100), int(1234.56 * 100)} {
			t.Run(fmt.Sprintf("%s-%d", name, limitCostCents), func(t *testing.T) {
				included := IncludedAmount(tc.planType, tc.productType)
				count := GetLimitAmount(&limitCostCents, tc.productType, tc.planType, tc.retentionPeriod)
				rateCents := ProductToBasePriceCents(tc.productType, tc.planType, *count) * RetentionMultiplier(tc.retentionPeriod)
				rateCostCents := math.Round(float64(*count-included) * rateCents)
				// some error expected due to rounding error
				assert.Less(t, int(math.Abs(float64(int(rateCostCents)-limitCostCents))), 5, "limit count vs base price count should be within 5 cents")
			})
		}
	}
}
