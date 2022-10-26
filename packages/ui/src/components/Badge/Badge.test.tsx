import React from 'react'
import { render, screen } from '@testing-library/react'

import { Badge } from './Badge'

describe('Bage', () => {
	it('exists', async () => {
		render(<Badge>Testing</Badge>)

		await screen.findByText('Testing')
	})
})
