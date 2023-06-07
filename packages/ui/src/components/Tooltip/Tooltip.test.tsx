import { render, screen } from '@testing-library/react'

import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
	it('exists', async () => {
		render(<Tooltip trigger={<>Trigger</>}>Testing</Tooltip>)

		await screen.findByText('Testing')
	})
})
