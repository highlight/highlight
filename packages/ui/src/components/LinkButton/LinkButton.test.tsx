import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import { LinkButton } from './LinkButton'

describe('LinkButton', () => {
	it('exists', async () => {
		render(
			<BrowserRouter>
				<LinkButton href="">Testing</LinkButton>
			</BrowserRouter>,
		)

		await screen.findByText('Testing')
	})
})
