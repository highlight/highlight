import React from 'react'
import { render, screen } from '@testing-library/react'

import { MenuButton } from '@components'

describe('DropdownButton', () => {
	it('exists', async () => {
		render(
			<MenuButton
				options={['Hello!']}
				onChange={(v) => {
					console.log(v)
				}}
			/>,
		)

		await screen.findByText('Testing')
	})
})
