import { Box, Text } from '@highlight-run/ui'
import React from 'react'

import * as styles from './QueryBuilder.css'

type Props = React.PropsWithChildren & {}

export const QueryBuilder: React.FC<Props> = (props) => {
	return (
		<Box cssClass={styles.container}>
			<Text>Hello from QueryBuilder!</Text>
		</Box>
	)
}
