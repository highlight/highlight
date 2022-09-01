import Button from '@components/Button/Button/Button'
import CloseIcon from '@icons/CloseIcon'
import React from 'react'

import styles from './CloseButton.module.scss'

type Props = {
	trackingId: string
	icon?: React.ReactNode
	onClick?: () => void
}

const CloseButton = ({ trackingId, icon = <CloseIcon />, onClick }: Props) => {
	return (
		<Button
			trackingId={trackingId}
			className={styles.closeButton}
			onClick={onClick}
		>
			{icon}
		</Button>
	)
}

export default CloseButton
