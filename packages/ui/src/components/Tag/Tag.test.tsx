import { render, screen } from '@testing-library/react'

import { Tag } from './Tag'

describe('Tag', () => {
	it('exists', async () => {
		render(<Tag>Testing</Tag>)

		await screen.findByText('Testing')
	})
})
