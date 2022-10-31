import React from 'react'
import { render, screen } from '@testing-library/react'

import { IconButton } from './IconButton'

describe('IconButton', () => {
	it('exists', async () => {
		render(<IconButton>Testing</IconButton>)

		await screen.findByText('Testing')
	})
})
