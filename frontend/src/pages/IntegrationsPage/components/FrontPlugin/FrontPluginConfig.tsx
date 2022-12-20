import Sparkles2Icon from '@icons/Sparkles2Icon'
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration'
import React from 'react'

import styles from './FrontPluginConfig.module.scss'

const FrontPluginConfig: React.FC<IntegrationConfigProps> = ({}) => {
	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect Highlight with Front to enhance your customer
				conversations with their recorded sessions from your app.
			</p>
			<footer>
				<a
					className={styles.modalBtn}
					target="_blank"
					rel="noreferrer"
					href="https://front.com/integrations/highlight"
				>
					<span className={styles.modalBtnText}>
						<Sparkles2Icon className={styles.modalBtnIcon} />
						<span>Connect Highlight with Front</span>
					</span>
				</a>
			</footer>
		</>
	)
}

export default FrontPluginConfig
