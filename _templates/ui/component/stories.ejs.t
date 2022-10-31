---
to: packages/ui/src/components/<%= name %>/<%= name %>.stories.tsx
---

import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { <%= name %> } from './<%= name %>'

export default {
	title: 'Components/<%= name %>',
	component: <%= name %>,
} as ComponentMeta<typeof <%= name %>>

export const Basic = () => <<%= name %>>Hello! 👋</<%= name %>>
