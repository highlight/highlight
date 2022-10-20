---
to: packages/ui/src/components/<%= name %>/<%= name %>.tsx
---

import React from 'react'

import * as styles from './styles.css'

interface Props extends React.PropsWithChildren {}

export const <%= name %>: React.FC<Props> = ({ children }) => {
	return (
		<div>{children}</div>
	)
}
