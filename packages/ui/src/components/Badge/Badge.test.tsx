import { render, screen } from '@testing-library/react'

import { Badge } from './Badge'

describe('Badge', () => {
	it('exists', async () => {
		render(<Badge label="Testing" />)

		await screen.findByText('Testing')
	})
})
