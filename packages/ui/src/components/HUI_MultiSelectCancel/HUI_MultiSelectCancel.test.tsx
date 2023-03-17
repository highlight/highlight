import React from 'react'
import { render, screen } from '@testing-library/react'

import { HUI_MultiSelectCancel } from './HUI_MultiSelectCancel'

describe('HUI_MultiSelectCancel', () => {
	it('exists', async () => {
		render(<HUI_MultiSelectCancel>Testing</HUI_MultiSelectCancel>)

		await screen.findByText('Testing')
	})
})
