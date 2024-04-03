import { render, screen } from '@testing-library/react'

import { Tabs } from './Tabs'

describe('Tabs', () => {
	it('exists', async () => {
		render(<Tabs>Testing</Tabs>)

		await screen.findByText('Testing')
	})
})
