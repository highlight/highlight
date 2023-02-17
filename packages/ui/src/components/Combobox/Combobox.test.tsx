import React from 'react'
import { render, screen } from '@testing-library/react'

import { Combobox } from './Combobox'

describe('Combobox', () => {
	it('exists', async () => {
		render(<Combobox>Testing</Combobox>)

		await screen.findByText('Testing')
	})
})
