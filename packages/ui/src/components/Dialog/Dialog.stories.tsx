import React from 'react'

import { Dialog } from './Dialog'

export default {
	title: 'Components/Dialog',
	component: Dialog,
}

export const Basic = ({
	reflame: { rootRef } = {},
}: {
	reflame: {
		rootRef?: React.Ref<HTMLDivElement>
	}
}) => {
	const store = Dialog.useStore({ defaultOpen: true })
	return (
		<Dialog store={store}>
			{/* rootRef tells Reflame to screenshot this portal'ed element instead of the empty root element */}
			<div ref={rootRef}>Hello! 👋</div>
		</Dialog>
	)
}
