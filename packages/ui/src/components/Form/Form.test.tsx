import React from 'react'
import { render, renderHook, screen } from '@testing-library/react'

import { Form, useFormState } from './Form'

describe('Form', () => {
	it('exists', async () => {
		const { result } = renderHook(() =>
			useFormState({
				defaultValues: {
					Search: '',
				},
			}),
		)
		const formComponent = (
			<Form state={result.current}>
				<Form.Input name="Search" placeholder="Testing" size="xSmall" />
			</Form>
		)

		render(formComponent)

		await screen.findByPlaceholderText('Testing')
	})
})
