import React from 'react'

import Tooltip from '../../../components/Tooltip/Tooltip'
import { ReactComponent as CheckIcon } from '../../../static/verify-check-icon.svg'
import ActivityIcon from '../../Player/SessionLevelBar/ActivityIcon/ActivityIcon'
import styles from './IntegrationDetector.module.scss'

export const IntegrationDetector = ({
	integrated,
	verbose,
}: {
	integrated: boolean
	verbose: boolean
}) => {
	return (
		<div className={styles.detector}>
			<Tooltip
				title={
					integrated
						? 'Highlight is installed!'
						: 'Waiting for Highlight to be installed.'
				}
			>
				<div className={styles.detectorWrapper}>
					<div className={styles.loaderWrapper}>
						{integrated ? (
							<CheckIcon className={styles.checkIcon} />
						) : (
							<ActivityIcon
								isActive={integrated}
								className="blob"
							/>
						)}
					</div>
				</div>
			</Tooltip>
			{verbose ? (
				<p className={styles.verificationText}>
					{integrated
						? 'Installation Verified.'
						: 'Waiting for Verification.'}
				</p>
			) : (
				<></>
			)}
		</div>
	)
}
