import Button from '@components/Button/Button/Button'
import { toast } from '@components/Toaster'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils'
import { CodeBlock } from '@/pages/Connect/CodeBlock'
import React, { useEffect } from 'react'
import { coy as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism'

import styles from './ZapierIntegrationConfig.module.css'
import ProjectSelection, {
	useIntergationProjectConfig,
} from '../common/ProjectSelection'
import { Box, Stack } from '@highlight-run/ui/components'

const ZapierIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action, isV2 }) => {
	const { selectedProject, options, setSelectedProject } =
		useIntergationProjectConfig()
	const {
		generatedJwtToken,
		removeZapierIntegrationFromProject,
		isZapierIntegratedWithProject,
	} = useZapierIntegration(selectedProject.value)

	useEffect(() => {
		if (isZapierIntegratedWithProject) {
			setIntegrationEnabled(true)
			setModalOpen(false)
			toast.success('Zapier integration enabled')
		}
	}, [isZapierIntegratedWithProject, setIntegrationEnabled, setModalOpen])

	if (action === IntegrationAction.Disconnect) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting Zapier from Highlight will cause your Zaps to
					stop working.
				</p>
				<footer>
					<Button
						trackingId="IntegrationDisconnectCancel-Slack"
						className={styles.modalBtn}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-Slack"
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModalOpen(false)
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
		<Box>
			<Box
				cssClass={`${isV2 ? 'flex justify-between items-center' : ''}`}
			>
				<Stack cssClass="max-w-[650px]">
					<p className={styles.modalSubTitle}>
						{!isV2
							? 'Connect Highlight with Zapier to use alerts as triggers for your Zaps.'
							: 'Configure Zaiper Intergation'}
					</p>
					<p className={styles.modalSubTitle}>
						In order to connect, you'll need to create a Zap in
						Zapier and when prompted, enter the access token from
						the textbox below.
					</p>
					<CodeBlock
						style={lightTheme}
						showLineNumbers={false}
						text={generatedJwtToken || ' '}
						language="text"
						numberOfLines={2}
					/>
				</Stack>

				{!isV2 && (
					<ProjectSelection
						options={options}
						selectedProject={selectedProject}
						setSelectedProject={setSelectedProject}
					/>
				)}
				<footer className={`${isV2 ? 'self-start' : ''}`}>
					{!isV2 && (
						<Button
							trackingId="IntegrationConfigurationCancel-Zapier"
							className={styles.modalBtn}
							onClick={() => {
								setModalOpen(false)
								setIntegrationEnabled(false)
							}}
						>
							Cancel
						</Button>
					)}
					<Button
						trackingId="IntegrationConfigurationSave-Zapier"
						className={styles.modalBtn}
						type="primary"
						target="_blank"
						href="https://zapier.com/app/zaps" // TODO: change to Highlight Zap URL
					>
						<Sparkles2Icon className={styles.modalBtnIcon} /> Create
						a Zap
					</Button>
				</footer>
			</Box>
			{isV2 && (
				<ProjectSelection
					options={options}
					selectedProject={selectedProject}
					setSelectedProject={setSelectedProject}
				/>
			)}
		</Box>
	)
}

export default ZapierIntegrationConfig
