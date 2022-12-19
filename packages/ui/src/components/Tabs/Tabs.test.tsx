import React from 'react'
import { render, screen } from '@testing-library/react'

import { Tabs } from './Tabs'

describe('Tabs', () => {
	it('exists', async () => {
		render(<Tabs pages={{ foo: { page: <div>Test</div> } }} />)
		await screen.findByText('Testing')
	})
})
