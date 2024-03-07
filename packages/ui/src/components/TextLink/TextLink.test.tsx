import { render, screen } from '@testing-library/react'

import { TextLink } from './TextLink'

describe('Link', () => {
	it('exists', async () => {
		render(<TextLink href="https://testing.com">Testing</TextLink>)

		await screen.findByText('Testing')
	})
})
