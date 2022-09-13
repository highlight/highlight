import { PlanType } from '../../../graph/generated/schemas'
import { didUpgradePlan } from './utils'

describe('didUpgradePlan', () => {
	const CASES = [
		[PlanType.Free, PlanType.Basic, true],
		[PlanType.Free, PlanType.Startup, true],
		[PlanType.Free, PlanType.Enterprise, true],
		[PlanType.Basic, PlanType.Free, false],
		[PlanType.Basic, PlanType.Startup, true],
		[PlanType.Basic, PlanType.Enterprise, true],
		[PlanType.Startup, PlanType.Basic, false],
		[PlanType.Startup, PlanType.Free, false],
		[PlanType.Startup, PlanType.Enterprise, true],
		[PlanType.Enterprise, PlanType.Basic, false],
		[PlanType.Enterprise, PlanType.Startup, false],
		[PlanType.Enterprise, PlanType.Free, false],
	]

	it.each(CASES)(
		'should handle upgrading from %s to %s',
		(previousPlan, newPlan, expected) => {
			const result = didUpgradePlan(
				previousPlan as PlanType,
				newPlan as PlanType,
			)

			expect(result).toBe(expected as Boolean)
		},
	)
})
