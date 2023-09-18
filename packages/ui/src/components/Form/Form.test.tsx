import React from 'react'
import { render, renderHook, screen } from '@testing-library/react'

import { Form, useFormStore } from './Form'

describe('Form', () => {
	it('exists', async () => {
		const { result } = renderHook(() =>
			useFormStore({
				defaultValues: {
					Search: '',
				},
			}),
		)
		const formComponent = (
			<Form store={result.current}>
				<Form.Input name="Search" placeholder="Testing" size="xSmall" />
			</Form>
		)

		render(formComponent)

		await screen.findByPlaceholderText('Testing')
	})
})
