import { render, screen } from '@testing-library/react'

import { Callout } from './Callout'

describe('Callout', () => {
	it('exists', async () => {
		render(<Callout title={'Test'}>Testing</Callout>)

		await screen.findByText('Testing')
	})
})
