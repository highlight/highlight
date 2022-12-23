import React from 'react'
import { render, screen } from '@testing-library/react'

import { Form } from './Form'

describe('Form', () => {
	it('exists', async () => {
		render(
			<Form>
				<Form.Input
					id="Testing"
					name="Search"
					placeholder="Testing"
					size="xSmall"
				/>
			</Form>,
		)

		await screen.findByPlaceholderText('Testing')
	})
})
