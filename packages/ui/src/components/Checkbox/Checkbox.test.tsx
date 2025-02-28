import { render, screen } from '@testing-library/react'

import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
	it('exists', async () => {
		render(<Checkbox>Testing</Checkbox>)

		await screen.findByText('Testing')
	})
})
