import { render, screen } from '@testing-library/react'

import { Box } from './Box'

describe('Box', async () => {
	it('exists', () => {
		render(<Box>Testing</Box>)

		screen.findByText('Testing')
	})
})
