import Button from '@components/Button/Button/Button'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration'
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils'
import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock'
import { message } from 'antd'
import React, { useEffect } from 'react'

import styles from './ZapierIntegrationConfig.module.scss'

const ZapierIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModelOpen, setIntegrationEnabled, integrationEnabled }) => {
	const {
		generatedJwtToken,
		removeZapierIntegrationFromProject,
		isZapierIntegratedWithProject,
	} = useZapierIntegration({ repoll: !integrationEnabled })

	useEffect(() => {
		if (isZapierIntegratedWithProject && !integrationEnabled) {
			setIntegrationEnabled(true)
			setModelOpen(false)
			message.success('Zapier integration enabled')
		}
	}, [
		isZapierIntegratedWithProject,
		setIntegrationEnabled,
		setModelOpen,
		integrationEnabled,
	])

	if (integrationEnabled) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting Zapier from Highlight will cause your Zaps to
					stop working.
				</p>
				<footer>
					<Button
						trackingId={`IntegrationDisconnectCancel-Slack`}
						className={styles.modalBtn}
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId={`IntegrationDisconnectSave-Slack`}
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(false)
							removeZapierIntegrationFromProject()
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disconnect Zapier
					</Button>
				</footer>
			</>
		)
	}

	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect Highlight with Zapier to use alerts as triggers for your
				Zaps.
			</p>
			<p className={styles.modalSubTitle}>
				In order to connect, you'll need to create a Zap in Zapier and
				when prompted, enter the access token from the textbox below.
			</p>
			<CodeBlock
				showLineNumbers={false}
				text={generatedJwtToken || ' '}
				language="text"
				numberOfLines={2}
			/>
			<footer>
				<Button
					trackingId={`IntegrationConfigurationCancel-Zapier`}
					className={styles.modalBtn}
					onClick={() => {
						setModelOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId={`IntegrationConfigurationSave-Zapier`}
					className={styles.modalBtn}
					type="primary"
					target="_blank"
					href="https://zapier.com/app/zaps" // TODO: change to Highlight Zap URL
				>
					<Sparkles2Icon className={styles.modalBtnIcon} /> Create a
					Zap
				</Button>
			</footer>
		</>
	)
}

export default ZapierIntegrationConfig
