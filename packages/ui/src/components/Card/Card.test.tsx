import { render, screen } from '@testing-library/react'

import { Card } from './Card'

describe('Card', async () => {
	it('exists', () => {
		render(<Card>Testing</Card>)

		screen.findByText('Testing')
	})
})
