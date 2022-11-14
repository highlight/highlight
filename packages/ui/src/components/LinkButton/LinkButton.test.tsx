import React from 'react'
import { render, screen } from '@testing-library/react'

import { LinkButton } from './LinkButton'

describe('LinkButton', () => {
	it('exists', async () => {
		render(<LinkButton>Testing</LinkButton>)

		await screen.findByText('Testing')
	})
})
