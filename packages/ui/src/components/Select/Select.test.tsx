import { userEvent } from '@storybook/test'
import { act, render, screen, waitFor } from '@testing-library/react'

import { Select } from './Select'

describe('Select', () => {
	it('renders a select correctly', async () => {
		render(
			<Select defaultValue="jay">
				<Select.Option value="jay">Jay</Select.Option>
				<Select.Option value="vadim">Vadim</Select.Option>
				<Select.Option value="zane">Zane</Select.Option>
				<Select.Option value="spenny">Spenny</Select.Option>
			</Select>,
		)

		const combobox = screen.getByRole('combobox')
		await waitFor(() => combobox.textContent === 'Jay')

		act(() => {
			userEvent.click(combobox)
		})

		const options = await screen.findAllByRole('option')
		expect(options.map((o) => o.textContent)).toEqual([
			'Jay',
			'Vadim',
			'Zane',
			'Spenny',
		])
	})
})
