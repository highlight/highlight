import {
	CLICKUP_INTEGRATION,
	HEIGHT_INTEGRATION,
	Integration,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import React from 'react'

export interface ContainerSelectionProps {
	setSelectionId: (id: string) => void
}

export type IssueTrackerIntegration = Integration & {
	containerLabel: string
	issueLabel: string
	containerSelection: (opts: ContainerSelectionProps) => React.ReactNode
}

const ISSUE_TRACKER_INTEGRATIONS: IssueTrackerIntegration[] = [
	LINEAR_INTEGRATION,
	CLICKUP_INTEGRATION,
	HEIGHT_INTEGRATION,
]

export default ISSUE_TRACKER_INTEGRATIONS
