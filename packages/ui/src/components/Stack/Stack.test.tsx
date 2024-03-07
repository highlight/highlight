import { render, screen } from '@testing-library/react'

import { Stack } from './Stack'

describe('Stack', () => {
	it('exists', async () => {
		render(<Stack>Testing</Stack>)

		await screen.findByText('Testing')
	})
})
