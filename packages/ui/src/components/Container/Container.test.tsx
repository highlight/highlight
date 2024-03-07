import { render, screen } from '@testing-library/react'

import { Container } from './Container'

describe('Container', () => {
	it('exists', async () => {
		render(<Container>Testing</Container>)

		await screen.findByText('Testing')
	})
})
