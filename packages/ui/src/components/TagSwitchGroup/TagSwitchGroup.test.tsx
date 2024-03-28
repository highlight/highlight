import { userEvent } from '@storybook/test'
import { render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'

import { Form } from '../Form/Form'
import { TagSwitchGroup } from './TagSwitchGroup'

describe('TagSwitchGroup', async () => {
	it('exists', async () => {
		render(<TagSwitchForm />)

		await waitFor(() => {
			expect(screen.getByTestId('selected-option').innerText).toBe(
				'Selected option: 2',
			)
		})

		userEvent.click(screen.getByText('3'))
		await waitFor(() => {
			expect(screen.getByTestId('selected-option').innerText).toBe(
				'Selected option: 3',
			)
		})
	})
})

const options = [1, 2, 3]
const TagSwitchForm = () => {
	const [selectedOption, setSelectedOption] = useState<string | number>(
		options[1],
	)

	return (
		<Form data-testid="tag-form">
			<TagSwitchGroup
				options={options}
				name="tags"
				defaultValue={selectedOption}
				onChange={(value) => setSelectedOption(value)}
			/>

			<div data-testid="selected-option">
				Selected option: {selectedOption}
			</div>
		</Form>
	)
}
