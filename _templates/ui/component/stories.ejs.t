---
to: packages/ui/src/components/<%= name %>/<%= name %>.stories.mdx
---

import { Canvas, Meta, Story } from '@storybook/addon-docs';

import <%= name %> from './<%= name %>';

<Meta
	title="Components/<%= name %>"
	component={<%= name %>}
/>

# <%= name %>

<Canvas>
	<Story name="default">
		<<%= name %> />
	</Story>
</Canvas>
