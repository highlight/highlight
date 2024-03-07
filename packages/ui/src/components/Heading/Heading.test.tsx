import { render, screen } from '@testing-library/react'

import { Heading } from './Heading'

describe('Heading', () => {
	it('exists', async () => {
		render(<Heading as="h1">Testing</Heading>)

		await screen.findByText('Testing')
	})
})
