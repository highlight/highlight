import { render, screen } from '@testing-library/react'

import { Button } from './Button'

describe('Button', () => {
	it('exists', async () => {
		render(<Button>Testing</Button>)

		await screen.findByText('Testing')
	})
})
