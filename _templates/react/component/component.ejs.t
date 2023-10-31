---
to: frontend/src/<%= name %>.tsx
---

import { Box, Text } from '@highlight-run/ui'

import * as styles from './<%= componentName %>.css'

type Props = React.PropsWithChildren & {}

export const <%= componentName %>: React.FC<Props> = ({ children }) => {
	return (
		<Box cssClass={styles.container}>
			<Text>Hello from <%= componentName %>!</Text>
			{children}
		</Box>
	)
}

