---
to: frontend/src/<%= name %>/<%= componentName %>.tsx
---

import React from 'react'

import styles from './<%= componentName %>.module.scss'

interface Props {}

const <%= componentName %>: React.FC<React.PropsWithChildren<Props>> = (props) => {
	return (
		<div className={styles.<%= h.changeCase.camel(componentName) %>}>Hello from <%= componentName %>!</div>
	)
}

export default <%= componentName %>
