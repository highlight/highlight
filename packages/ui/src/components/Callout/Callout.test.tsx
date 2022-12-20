import React from 'react'
import { render, screen } from '@testing-library/react'

import { Callout } from './Callout'

describe('Callout', () => {
	it('exists', async () => {
		render(<Callout>Testing</Callout>)

		await screen.findByText('Testing')
	})
})
