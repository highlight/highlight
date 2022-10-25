import React from 'react'
import { render, screen } from '@testing-library/react'

import { Heading } from './Heading'

describe('Heading', () => {
	it('exists', async () => {
		render(<Heading>Testing</Heading>)

		await screen.findByText('Testing')
	})
})
