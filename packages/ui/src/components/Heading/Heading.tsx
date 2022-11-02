import React from 'react'
import { Sprinkles } from '../../css/sprinkles.css'
import { Box } from '../Box/Box'
import { Truncate, Props as TruncateProps } from '../private/Truncate/Truncate'

import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	styles.Variants &
	Pick<Sprinkles, 'my' | 'mt' | 'mb' | 'marginTop' | 'marginBottom'> & {
		as?: styles.Variants['level']
		lines?: TruncateProps['lines']
	}

export const Heading: React.FC<Props> = ({
	as,
	children,
	level = 'h2',
	lines,
	...props
}) => {
	const content = lines ? (
		<Truncate lines={lines}>{children}</Truncate>
	) : (
		children
	)

	return (
		<Box as={as || level} cssClass={styles.variants({ level })} {...props}>
			{content}
		</Box>
	)
}
