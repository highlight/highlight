---
to: packages/ui/src/<%= name %>.docs.mdx
---

import { Meta, Story } from '@storybook/addon-docs';

import { <%= name %> } from './<%= name %>';

<Meta
	title="<%= name %>"
	component={<%= name %>}
/>

<Story name="Primary">
  <<%= name %> />
</Story>
