---
to: packages/ui/src/<%= name %>.tsx
---

import React from 'react'

interface Props {
	variant: 'primary' | 'secondary'
}

const <%= name %>: React.FC<React.PropsWithChildren<Props>> = ({ variant }) => {
	return (
		<div>Hello from {variant} <%= name %>!</div>
	)
}

export default <%= name %>
