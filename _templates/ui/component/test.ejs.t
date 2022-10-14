---
to: packages/ui/src/<%= name %>/<%= name %>.test.tsx
---

import { render, screen } from '@testing-library/react'

import <%= name %> from './<%= name %>'

describe('<%= name %>', async () => {
	it('exists', () => {
		render(<<%= name %>>Testing</<%= name %>>)

		screen.findByText('Testing')
	})
})
