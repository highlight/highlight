---
to: frontend/src/<%= name %>/<%= componentName %>.tsx
---

import React from 'react'

import styles from './<%= componentName %>.module.scss'

type Props = React.PropsWithChildren & {}

const <%= componentName %>: React.FC<Props> = (props) => {
	return (
		<div className={styles.<%= h.changeCase.camel(componentName) %>}>Hello from <%= componentName %>!</div>
	)
}

export default <%= componentName %>
