import { IconProps } from '@highlight-run/ui/components'
import {
	CLICKUP_INTEGRATION,
	GITHUB_INTEGRATION,
	HEIGHT_INTEGRATION,
	Integration,
	JIRA_INTEGRATION,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import React from 'react'

export interface ContainerSelectionProps {
	setSelectionId: (id: string) => void
	setIssueTypeId?: (id: string) => void
	disabled: boolean
}

export type IssueTrackerIntegration = Integration & {
	containerLabel: string
	issueLabel: string
	containerSelection: (opts: ContainerSelectionProps) => React.ReactNode
	Icon: React.FC<IconProps>
}

const ISSUE_TRACKER_INTEGRATIONS: IssueTrackerIntegration[] = [
	LINEAR_INTEGRATION,
	CLICKUP_INTEGRATION,
	HEIGHT_INTEGRATION,
	GITHUB_INTEGRATION,
	JIRA_INTEGRATION,
]

export default ISSUE_TRACKER_INTEGRATIONS
