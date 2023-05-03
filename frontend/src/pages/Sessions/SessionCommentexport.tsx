import { Box, Text } from '@highlight-run/ui'
import React from 'react'

import * as styles from './SessionCommentexport.css'

type Props = React.PropsWithChildren & {}

export const SessionCommentexport: React.FC<Props> = ({ children }) => {
	return (
		<Box cssClass={styles.container}>
			<Text>Hello from SessionCommentexport!</Text>
			{children}
		</Box>
	)
}
