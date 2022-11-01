import React from 'react'
import { render, screen } from '@testing-library/react'

import { IconButton } from './IconButton'

describe('IconButton', () => {
	it('exists', async () => {
		render(<IconButton icon={<span>Testing</span>} />)

		await screen.findByText('Testing')
	})
})
