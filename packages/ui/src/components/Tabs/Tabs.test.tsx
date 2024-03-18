import { render, screen } from '@testing-library/react'

import { Tabs } from './Tabs'

describe('Tabs', () => {
	it('exists', async () => {
		render(
			<Tabs
				pages={{ foo: { page: <div>Test</div> } }}
				tab="foo"
				setTab={(t) => {
					console.log('tab', t)
				}}
			/>,
		)
		await screen.findByText('Test')
	})
})
