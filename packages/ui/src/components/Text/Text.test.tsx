import { render, screen } from '@testing-library/react'

import { Text } from './Text'

describe('Text', () => {
	it('exists', async () => {
		render(<Text>Testing</Text>)

		await screen.findByText('Testing')
	})
})
