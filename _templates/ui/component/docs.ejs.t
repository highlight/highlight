---
to: packages/ui/src/<%= name %>.docs.mdx
---

import { Canvas, Meta, Story } from '@storybook/addon-docs';

import <%= name %> from './<%= name %>';


<Meta
	title="<%= name %>"
	component={<%= name %>}
/>

<Canvas>
	<Story name="default">
		<<%= name %> />
	</Story>
</Canvas>
