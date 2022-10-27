import React from 'react'
import { render, screen } from '@testing-library/react'

import { Divider } from './Divider'

describe('Divider', () => {
	it('exists', async () => {
		render(<Divider>Testing</Divider>)

		await screen.findByText('Testing')
	})
})
