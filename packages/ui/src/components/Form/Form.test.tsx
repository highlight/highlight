import { render, screen } from '@testing-library/react'

import { Form } from './Form'

describe('Form', () => {
	it('exists', async () => {
		const formComponent = (
			<Form defaultValues={{ Search: '' }}>
				<Form.Input name="Search" placeholder="Testing" size="xSmall" />
			</Form>
		)

		render(formComponent)

		await screen.findByPlaceholderText('Testing')
	})
})
