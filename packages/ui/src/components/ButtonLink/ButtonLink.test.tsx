import { render, screen } from '@testing-library/react'

import { ButtonLink } from './ButtonLink'

describe('ButtonLink', () => {
	it('exists', async () => {
		render(<ButtonLink>Testing</ButtonLink>)

		await screen.findByText('Testing')
	})
})
