import { PlanType } from '@graph/schemas'

export const onlyAllowPaidTier = (workspaceTier?: string) => {
	return workspaceTier && workspaceTier !== PlanType.Free
}
