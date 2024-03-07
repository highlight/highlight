import { render, screen } from '@testing-library/react'

import { Box } from './Box'

describe('Box', () => {
	it('exists', async () => {
		render(<Box>Testing</Box>)

		await screen.findByText('Testing')
	})
})
