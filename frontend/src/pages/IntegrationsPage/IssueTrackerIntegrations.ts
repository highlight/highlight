import { IconProps } from '@highlight-run/ui'
import {
	CLICKUP_INTEGRATION,
	GITHUB_INTEGRATION,
	HEIGHT_INTEGRATION,
	Integration,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import React from 'react'

export interface ContainerSelectionProps {
	setSelectionId: (id: string) => void
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
]

export default ISSUE_TRACKER_INTEGRATIONS
