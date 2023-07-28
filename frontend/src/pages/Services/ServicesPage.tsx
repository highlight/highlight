import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import { Text } from '@highlight-run/ui'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { Link } from 'react-router-dom'

import { ServicesTable } from './ServicesTable'

export const ServicesPage = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const {
		settings: { isIntegrated },
	} = useGitHubIntegration()

	return (
		<LeadAlignLayout maxWidth={1200}>
			{!isIntegrated && (
				<Link to={`/${project_id}/integrations`}>
					<Text size="small" weight="medium">
						Integrate GitHub into Highlight
					</Text>
				</Link>
			)}
			<ServicesTable />
		</LeadAlignLayout>
	)
}
