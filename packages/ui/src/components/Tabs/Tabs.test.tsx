import { userEvent } from '@storybook/test'
import { render, screen, waitFor } from '@testing-library/react'

import { Tabs } from './Tabs'

describe('Tabs', () => {
	it('allows you to switch between tabs', async () => {
		render(
			<Tabs>
				<Tabs.List>
					<Tabs.Tab id="1">Tab 1</Tabs.Tab>
					<Tabs.Tab id="2">Tab 2</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel id="1">Panel 1</Tabs.Panel>
				<Tabs.Panel id="2">Panel 2</Tabs.Panel>
			</Tabs>,
		)

		await waitFor(() => expect(screen.getByText('Panel 1')).toBeVisible())
		expect(screen.getByText('Panel 2')).not.toBeVisible()

		userEvent.click(screen.getByText('Tab 2'))

		await waitFor(() =>
			expect(screen.getByText('Panel 1')).not.toBeVisible(),
		)
		waitFor(() => expect(screen.getByText('Panel 2')).toBeVisible())
	})
})
