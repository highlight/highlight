import { render, screen } from '@testing-library/react'

import { Menu } from './Menu'

describe('Menu', () => {
	it('exists', async () => {
		render(<Menu>Testing</Menu>)

		await screen.findByText('Testing')
	})
})
