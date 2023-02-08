import React from 'react'

import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg'
import styles from './index.module.scss'

interface GoToButtonComponentProps {
	label?: string
	small?: boolean
}

type GoToButtonProps = GoToButtonComponentProps &
	React.HTMLAttributes<HTMLButtonElement>

const GoToButton = ({ label = 'Goto', small, ...props }: GoToButtonProps) => {
	return (
		<button
			{...props}
			className={clsx(styles.goToButton, {
				[props.className!]: true,
				[styles.smallIconContainer]: small,
			})}
		>
			{!small && `${label} `}
			<ReferrerIcon
				className={clsx(styles.icon, {
					[styles.small]: small,
				})}
			/>
		</button>
	)
}

export default GoToButton
