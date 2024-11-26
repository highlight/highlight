import { render, screen } from '@testing-library/react'

import { Modal } from './Modal'

describe('Modal', () => {
	it('exists', async () => {
		render(<Modal>Testing</Modal>)

		await screen.findByText('Testing')
	})
})
