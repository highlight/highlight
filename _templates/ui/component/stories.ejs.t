---
to: packages/ui/src/components/<%= name %>/<%= name %>.stories.tsx
---

import { Meta } from '@storybook/react'

import { <%= name %> } from './<%= name %>'

export default {
	title: 'Components/<%= name %>',
	component: <%= name %>,
} as Meta<typeof <%= name %>>

export const Basic = () => <<%= name %>>Hello! 👋</<%= name %>>
