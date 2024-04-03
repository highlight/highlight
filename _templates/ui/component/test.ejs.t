---
to: packages/ui/src/components/<%= name %>/<%= name %>.test.tsx
---

import { render, screen } from '@testing-library/react'

import { <%= name %> } from './<%= name %>'

describe('<%= name %>', () => {
	it('exists', async () => {
		render(<<%= name %>>Testing</<%= name %>>)

		await screen.findByText('Testing')
	})
})
