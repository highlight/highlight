import { PlanType } from '@graph/schemas'

export const isProjectWithinTrial = (project: any) => {
	if (project?.trial_end_date) {
		return new Date(project.trial_end_date) >= new Date()
	}
	return false
}

export const mustUpgradeForClearbit = (workspaceTier?: string) => {
	return (
		workspaceTier !== PlanType.Startup &&
		workspaceTier !== PlanType.Enterprise
	)
}

export const getPlanChangeEmail = ({
	workspaceID,
	planType,
}: {
	workspaceID?: string | undefined
	planType: PlanType
}) => {
	let href =
		`mailto:sales@highlight.run?subject=Highlight Subscription Update` +
		`&body=I would like to change my subscription to the following plan: ${planType}.`
	if (workspaceID) {
		href = href + ` My workspace ID is ${workspaceID}.`
	}
	return href
}
