import React from 'react'
import { render, screen } from '@testing-library/react'

import { Columns } from './Columns'

describe('Columns', () => {
	it('exists', async () => {
		render(<Columns>Testing</Columns>)

		await screen.findByText('Testing')
	})
})
