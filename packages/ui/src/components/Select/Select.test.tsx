import { userEvent } from '@storybook/test'
import { act, render, screen, waitFor } from '@testing-library/react'
import { useState, type ReactNode } from 'react'
import { vi } from 'vitest'

import { Select, type SelectOption } from './Select'

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

	it('keeps renderOption selectable and updates the selected value', async () => {
		const handleValueChange = vi.fn()

		render(
			<TestSelect
				handleValueChange={handleValueChange}
				renderOption={(option) => (
					<span>{option.name.toUpperCase()}</span>
				)}
			/>,
		)

		await userEvent.click(screen.getByRole('combobox'))

		await userEvent.click(await screen.findByText('JAY'))

		expect(handleValueChange).toHaveBeenCalledWith({
			name: 'Jay',
			value: 'jay',
		})
		expect(screen.getByRole('combobox')).toHaveTextContent('Jay')
	})

	it('renders notFoundContent without exposing it as an option', async () => {
		const handleValueChange = vi.fn()

		render(
			<TestSelect
				handleValueChange={handleValueChange}
				notFoundContent={<span>No repos found</span>}
			/>,
		)

		await userEvent.click(screen.getByRole('combobox'))

		await userEvent.type(screen.getByPlaceholderText('Search...'), 'zzz')

		expect(screen.getByText('No repos found')).toBeInTheDocument()
		expect(
			screen.queryByRole('option', {
				name: 'No repos found',
			}),
		).not.toBeInTheDocument()

		await userEvent.click(screen.getByText('No repos found'))
		expect(handleValueChange).not.toHaveBeenCalled()
	})
})

const OPTIONS = [
	{ name: 'Jay', value: 'jay' },
	{ name: 'Vadim', value: 'vadim' },
]

const TestSelect = ({
	handleValueChange,
	notFoundContent,
	renderOption,
}: {
	handleValueChange: (value: unknown) => void
	notFoundContent?: ReactNode
	renderOption?: (option: SelectOption, searchValue: string) => ReactNode
}) => {
	const [value, setValue] = useState<{
		name: string
		value: string
	} | null>(null)

	return (
		<Select
			filterable
			options={OPTIONS}
			placeholder="Pick one"
			value={value ?? undefined}
			onValueChange={(next) => {
				setValue(next as { name: string; value: string })
				handleValueChange(next)
			}}
			notFoundContent={notFoundContent}
			renderOption={renderOption}
		/>
	)
}
