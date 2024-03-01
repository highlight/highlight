import { render, screen } from '@testing-library/react'

import { Popover } from './Popover'

describe('Popover', () => {
	it('exists', async () => {
		render(<Popover>Testing</Popover>)

		await screen.findByText('Testing')
	})
})
