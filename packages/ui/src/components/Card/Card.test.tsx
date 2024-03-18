import { render, screen } from '@testing-library/react'

import { Card } from './Card'

describe('Card', () => {
	it('exists', async () => {
		render(<Card>Testing</Card>)

		await screen.findByText('Testing')
	})
})
