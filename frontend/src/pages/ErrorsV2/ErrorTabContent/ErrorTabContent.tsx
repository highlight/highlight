import Tabs from '@components/Tabs/Tabs'
import { GetErrorGroupQuery } from '@graph/operations'
import {
	Badge,
	Box,
	IconSolidTerminal,
	IconSolidTrendingUp,
	Stack,
} from '@highlight-run/ui/components'
import { ErrorInstance } from '@pages/ErrorsV2/ErrorInstance/ErrorInstance'
import ErrorMetrics from '@pages/ErrorsV2/ErrorMetrics/ErrorMetrics'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { ErrorInstances } from '@/pages/ErrorsV2/ErrorInstances/ErrorInstances'

import styles from './ErrorTabContent.module.css'

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
			error_tab_key?: 'instances' | 'metrics'
		}>()

	useHotkeys(
		'm',
		() => {
			if (error_tab_key === 'metrics') {
				return
			}

			navigate(`/${project_id}/errors/${error_secure_id}/metrics`)
		},
		[project_id, error_secure_id, error_tab_key],
	)

	useHotkeys(
		'i',
		() => {
			if (error_tab_key === 'instances') {
				return
			}

			navigate(`/${project_id}/errors/${error_secure_id}/instances`)
		},
		[project_id, error_secure_id, error_tab_key],
	)

	// /:project_id/errors/:error_group_secure_id -> load latest instance
	// /:project_id/errors/:error_group_secure_id/instances -> load instances list view
	// /:project_id/errors/:error_group_secure_id/instances/:error_object_id -> load instance
	const showAllInstances =
		error_tab_key === 'instances' && error_object_id === undefined

	return (
		<Tabs
			animated={false}
			id="errorTabs"
			className={styles.tabs}
			noHeaderPadding
			noPadding
			unsetOverflowY
			activeKeyOverride={error_tab_key ?? 'instances'}
			onChange={(activeKey) => {
				if (activeKey === 'instances') {
					// we want instances to load the latest instance, not the list view
					navigate(`/${project_id}/errors/${error_secure_id}`)
				} else {
					navigate(
						`/${project_id}/errors/${error_secure_id}/${activeKey}`,
					)
				}
			}}
			tabs={[
				{
					key: 'instances',
					title: (
						<TabTitle
							icon={<IconSolidTerminal size={14} />}
							label="Instances"
							shortcut="i"
						/>
					),
					panelContent: showAllInstances ? (
						<ErrorInstances errorGroup={errorGroup} />
					) : (
						<ErrorInstance errorGroup={errorGroup} />
					),
				},
				{
					key: 'metrics',
					title: (
						<TabTitle
							icon={<IconSolidTrendingUp />}
							label="Metrics"
							shortcut="m"
						/>
					),
					panelContent: <ErrorMetrics errorGroup={errorGroup} />,
				},
			]}
		/>
	)
}

type TabTitleProps = {
	icon: React.ReactNode
	label: string
	shortcut: string
}

const TabTitle: React.FC<TabTitleProps> = ({ icon, label, shortcut }) => {
	return (
		<Box px="6">
			<Stack direction="row" gap="6" align="center">
				{icon}
				{label}
				<Badge variant="gray" size="small" label={shortcut} />
			</Stack>
		</Box>
	)
}

export default ErrorTabContent
