import React from 'react'
import { render, screen } from '@testing-library/react'

import { TagSwitchGroup } from './TagSwitchGroup'

describe('TagSwitchGroup', () => {
	it('exists', async () => {
		render(<TagSwitchGroup>Testing</TagSwitchGroup>)

		await screen.findByText('Testing')
	})
})
