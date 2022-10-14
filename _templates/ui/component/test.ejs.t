---
to: packages/ui/src/<%= name %>.test.tsx
---

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('<%= name %>', async () => {
	it('exists', () => {
		render(<<%= name %>>Testing</<%= name %>>)

		screen.findByText('Hello from <%= name %>')
	})
})
