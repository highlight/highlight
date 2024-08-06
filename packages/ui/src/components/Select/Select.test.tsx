import { render, screen, within } from '@testing-library/react'

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
		await within(combobox).findByText('Jay')
	})
})
