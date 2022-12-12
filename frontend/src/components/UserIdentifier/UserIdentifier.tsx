import Tooltip from '@components/Tooltip/Tooltip'
import SvgCopyIcon from '@icons/CopyIcon'
import { message } from 'antd'
import classNames from 'classnames'
import React from 'react'

import Button from '../Button/Button/Button'
import styles from './UserIdentifier.module.scss'

interface Props {
	displayValue: string
	className?: string
}

const UserIdentifier = React.memo(({ displayValue, className }: Props) => {
	return (
		<div className={classNames(styles.identifierContainer, className)}>
			<span className={styles.identifier}>{displayValue}</span>
			<Tooltip
				title="Copy id to clipboard"
				mouseEnterDelay={0}
				align={{ offset: [0, 3] }}
			>
				<Button
					className={styles.identifierActionButton}
					trackingId="UserIdentiferSearch"
					iconButton
					type="text"
					onClick={() => {
						navigator.clipboard.writeText(displayValue)
						message.success(
							`Copied identifier ${displayValue} to clipboard!`,
						)
					}}
				>
					<SvgCopyIcon />
				</Button>
			</Tooltip>
		</div>
	)
})

export default UserIdentifier
