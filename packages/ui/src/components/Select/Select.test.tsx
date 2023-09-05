import React from 'react'
import { render, screen } from '@testing-library/react'

import { Select } from './Select'

describe('Select', () => {
	it('exists', async () => {
		render(<Select>Testing</Select>)

		await screen.findByText('Testing')
	})
})
