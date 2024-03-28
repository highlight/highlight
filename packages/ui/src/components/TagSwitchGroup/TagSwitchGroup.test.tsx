import { userEvent } from '@storybook/test'
import { render, screen } from '@testing-library/react'
import { useState } from 'react'

import { Form } from '../Form/Form'
import { TagSwitchGroup } from './TagSwitchGroup'

describe('TagSwitchGroup', async () => {
	it('exists', async () => {
		render(<TagSwitchForm />)

		expect(screen.getByRole('form')).toHaveFormValues({
			tags: ['1', '2', '3'],
		})

		expect(screen.getByTestId('selected-option').innerText).toBe(
			'Selected option: 2',
		)

		await userEvent.click(screen.getByText('3'))
		expect(screen.getByTestId('selected-option').innerText).toBe(
			'Selected option: 3',
		)
	})
})

const OPTIONS = [1, 2, 3]
const TagSwitchForm = () => {
	const [selectedOption, setSelectedOption] = useState<string | number>(
		OPTIONS[1],
	)

	return (
		<Form>
			<TagSwitchGroup
				options={OPTIONS}
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
