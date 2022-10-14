---
to: packages/ui/src/<%= name %>.tsx
---

import React from 'react'

interface Props {}

const <%= name %>: React.FC<React.PropsWithChildren<Props>> = (props) => {
	return (
		<div>Hello from <%= name %>!</div>
	)
}

export default <%= name %>
