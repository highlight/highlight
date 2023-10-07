import React from 'react'
import { ComponentMeta } from '@storybook/react-vite'

import { Dialog } from './Dialog'

export default {
	title: 'Components/Dialog',
	component: Dialog,
} as ComponentMeta<typeof Dialog>

export const Basic = () => {
	const store = Dialog.useStore({ defaultOpen: true })
	return (
		<Dialog store={store}>
			<div>Hello!! 👋</div>
		</Dialog>
	)
}
