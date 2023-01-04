import Tabs from '@components/Tabs/Tabs'
import { GetErrorGroupQuery } from '@graph/operations'
import { IconSolidTrendingUp, IconSolidTerminal } from '@highlight-run/ui'
import ErrorInstance from '@pages/ErrorsV2/ErrorInstance/ErrorInstance'
import ErrorMetrics from '@pages/ErrorsV2/ErrorMetrics/ErrorMetrics'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { Switch } from 'react-router-dom'
import { useHistory } from 'react-router-dom'

import styles from './ErrorTabContent.module.scss'

type Props = React.PropsWithChildren & {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorTabContent: React.FC<Props> = ({ errorGroup }) => {
	const history = useHistory()
	const {
		project_id,
		error_secure_id,
		error_tab_key = 'instances',
	} = useParams<{
		project_id: string
		error_secure_id: string
		error_tab_key?: 'instances' | 'metrics'
	}>()

	return (
		<Switch>
			<Tabs
				animated={false}
				id="errorTabs"
				className={styles.tabs}
				noHeaderPadding
				noPadding
				unsetOverflowY
				activeKeyOverride={error_tab_key}
				onChange={(activeKey) =>
					history.push(
						`/${project_id}/errors/${error_secure_id}/${activeKey}`,
					)
				}
				tabs={[
					{
						key: 'instances',
						title: (
							<TabTitle
								icon={<IconSolidTerminal size={14} />}
								label="Instances"
							/>
						),
						panelContent: <ErrorInstance errorGroup={errorGroup} />,
					},
					{
						key: 'metrics',
						title: (
							<TabTitle
								icon={<IconSolidTrendingUp />}
								label="Metrics"
							/>
						),
						panelContent: <ErrorMetrics errorGroup={errorGroup} />,
					},
				]}
			/>
		</Switch>
	)
}

type TabTitleProps = {
	icon: React.ReactNode
	label: string
}

const TabTitle: React.FC<TabTitleProps> = ({ icon, label }) => {
	return (
		<span className={styles.titleContainer}>
			<div className={styles.iconContainer}>{icon}</div>
			{label}
		</span>
	)
}

export default ErrorTabContent
