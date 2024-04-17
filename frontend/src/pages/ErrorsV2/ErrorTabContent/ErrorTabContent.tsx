import { GetErrorGroupQuery } from '@graph/operations'
import {
	Box,
	IconSolidTerminal,
	IconSolidTrendingUp,
	Tabs,
} from '@highlight-run/ui/components'
import { ErrorInstance } from '@pages/ErrorsV2/ErrorInstance/ErrorInstance'
import ErrorMetrics from '@pages/ErrorsV2/ErrorMetrics/ErrorMetrics'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { ErrorInstances } from '@/pages/ErrorsV2/ErrorInstances/ErrorInstances'

enum ErrorTabs {
	Instances = 'instances',
	Metrics = 'metrics',
}

type Props = React.PropsWithChildren & {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorTabContent: React.FC<Props> = ({ errorGroup }) => {
	const navigate = useNavigate()
	const { project_id, error_secure_id, error_object_id, error_tab_key } =
		useParams<{
			project_id: string
			error_secure_id: string
			error_object_id?: string
			error_tab_key?: ErrorTabs
		}>()

	useHotkeys(
		'm',
		() => {
			if (error_tab_key === 'metrics') {
				return
			}

			navigate({
				pathname: `/${project_id}/errors/${error_secure_id}/metrics`,
				search: location.search,
			})
		},
		[project_id, error_secure_id, error_tab_key],
	)

	useHotkeys(
		'i',
		() => {
			if (error_tab_key === 'instances') {
				return
			}

			navigate({
				pathname: `/${project_id}/errors/${error_secure_id}/instances`,
				search: location.search,
			})
		},
		[project_id, error_secure_id, error_tab_key],
	)

	// /:project_id/errors/:error_group_secure_id -> load latest instance
	// /:project_id/errors/:error_group_secure_id/instances -> load instances list view
	// /:project_id/errors/:error_group_secure_id/instances/:error_object_id -> load instance
	const showAllInstances =
		error_tab_key === 'instances' && error_object_id === undefined

	return (
		<Box mt="44">
			<Tabs<ErrorTabs>
				selectedId={error_tab_key}
				onChange={(id) => {
					let pathname = `/${project_id}/errors/${error_secure_id}/${id}`
					if (id === ErrorTabs.Instances) {
						// we want instances to load the latest instance, not the list view
						pathname = `/${project_id}/errors/${error_secure_id}`
					}

					navigate({
						pathname,
						search: location.search,
					})
				}}
			>
				<Tabs.List>
					<Tabs.Tab
						id={ErrorTabs.Instances}
						icon={<IconSolidTerminal />}
						badgeText="i"
					>
						Instances
					</Tabs.Tab>
					<Tabs.Tab
						icon={<IconSolidTrendingUp />}
						badgeText="m"
						id={ErrorTabs.Metrics}
					>
						Metrics
					</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel id={ErrorTabs.Instances}>
					<Box px="6">
						{showAllInstances ? (
							<ErrorInstances errorGroup={errorGroup} />
						) : (
							<ErrorInstance errorGroup={errorGroup} />
						)}
					</Box>
				</Tabs.Panel>
				<Tabs.Panel id={ErrorTabs.Metrics}>
					<ErrorMetrics errorGroup={errorGroup} />
				</Tabs.Panel>
			</Tabs>
		</Box>
	)
}

export default ErrorTabContent
