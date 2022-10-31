import React from 'react'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'

import * as styles from './styles.css'

type Props = styles.Variants & {
	icon: React.ReactElement<IconProps>
}

export const IconButton: React.FC<Props> = ({ icon, variant }) => {
	return (
		<Box
			as="button"
			display="inline-flex"
			className={styles.variants({ variant })}
		>
			{icon}
		</Box>
	)
}
