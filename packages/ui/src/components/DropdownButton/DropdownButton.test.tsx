import React from 'react'
import { render, screen } from '@testing-library/react'

import { DropdownButton } from '@components'

describe('DropdownButton', () => {
	it('exists', async () => {
		render(
			<DropdownButton
				options={['Hello!']}
				onChange={(v) => {
					console.log(v)
				}}
			/>,
		)

		await screen.findByText('Testing')
	})
})
