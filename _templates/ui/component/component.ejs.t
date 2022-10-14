---
to: packages/ui/src/components/<%= name %>/<%= name %>.tsx
---

import React from 'react'

interface Props extends React.PropsWithChildren {}

const <%= name %>: React.FC<Props> = ({ children }) => {
	return (
		<div>{children}</div>
	)
}

export default <%= name %>
