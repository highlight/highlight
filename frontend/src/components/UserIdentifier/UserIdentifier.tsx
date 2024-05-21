import { toast } from '@components/Toaster'
import Tooltip from '@components/Tooltip/Tooltip'
import SvgCopyIcon from '@icons/CopyIcon'
import clsx from 'clsx'
import React from 'react'

import Button from '../Button/Button/Button'
import styles from './UserIdentifier.module.css'

interface Props {
	displayValue: string
	className?: string
}

const UserIdentifier = React.memo(({ displayValue, className }: Props) => {
	return (
		<div className={clsx(styles.identifierContainer, className)}>
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
						toast.success(
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
