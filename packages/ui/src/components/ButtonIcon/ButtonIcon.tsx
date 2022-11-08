import React from 'react'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'

import * as styles from './styles.css'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
	styles.Variants & {
		icon: React.ReactElement<IconProps>
	}

export const ButtonIcon: React.FC<Props> = ({ icon, variant, onClick }) => {
	return (
		<Box
			as="button"
			display="inline-flex"
			className={styles.variants({ variant })}
			onClick={onClick}
		>
			{icon}
		</Box>
	)
}
