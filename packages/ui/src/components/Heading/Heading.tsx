import React from 'react'

import { Sprinkles } from '../../css/sprinkles.css'
import { Box } from '../Box/Box'
import { Props as TruncateProps, Truncate } from '../private/Truncate/Truncate'
import * as styles from './styles.css'

// `as?: styles.Variants['level']` was producing a type error so pulled this out
// to a separate type.
type Levels = 'h1' | 'h2' | 'h3' | 'h4'
type Alignments = 'center'

type Props = React.PropsWithChildren &
	Pick<Sprinkles, 'my' | 'mt' | 'mb' | 'marginTop' | 'marginBottom'> & {
		align?: Alignments
		as?: Levels
		level?: Levels
		lines?: TruncateProps['lines']
	}

export const Heading: React.FC<Props> = ({
	align,
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
		<Box
			as={as || level}
			cssClass={styles.variants({ align, level })}
			{...props}
		>
			{content}
		</Box>
	)
}
