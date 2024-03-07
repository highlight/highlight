import { render, screen } from '@testing-library/react'

import { Truncate } from './Truncate'

describe('Truncate', () => {
	it('exists', async () => {
		render(<Truncate>Testing</Truncate>)

		await screen.findByText('Testing')
	})
})
