import { render, screen } from '@testing-library/react'

import { OldTabs } from './OldTabs'

describe('OldTabs', () => {
	it('exists', async () => {
		render(
			<OldTabs
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
