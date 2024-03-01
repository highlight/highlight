import { render, screen } from '@testing-library/react'

import { Column } from './Column'

describe('Column', () => {
	it('exists', async () => {
		render(
			<Column.Container>
				<Column>Testing</Column>
			</Column.Container>,
		)

		await screen.findByText('Testing')
	})
})
