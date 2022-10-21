---
to: packages/ui/src/components/<%= name %>/<%= name %>.tsx
---

import React from 'react'
import { Box } from '../Box/Box'

import * as styles from './styles.css'

interface Props extends React.PropsWithChildren, styles.Variants {}

export const <%= name %>: React.FC<Props> = ({ children, ...props }) => {
	return (
		<Box className={styles.variants({ ...props })}>{children}</Box>
	)
}
