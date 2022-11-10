import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Column, Columns } from './Columns'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'

export default {
	title: 'Components/Columns',
	component: Columns,
} as ComponentMeta<typeof Columns>

const Content: React.FC<React.PropsWithChildren> = ({ children }) => (
	<Box background="neutral100" p="12">
		<Text align="center">{children}</Text>
	</Box>
)

export const Basic = () => (
	<Columns gap="8">
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="1">
			<Content>1</Content>
		</Column>
		<Column span="2">
			<Content>2</Content>
		</Column>
		<Column span="2">
			<Content>2</Content>
		</Column>
		<Column span="2">
			<Content>2</Content>
		</Column>
		<Column span="2">
			<Content>2</Content>
		</Column>
		<Column span="2">
			<Content>2</Content>
		</Column>
		<Column span="2">
			<Content>2</Content>
		</Column>
		<Column span="3">
			<Content>3</Content>
		</Column>
		<Column span="3">
			<Content>3</Content>
		</Column>
		<Column span="3">
			<Content>3</Content>
		</Column>
		<Column span="3">
			<Content>3</Content>
		</Column>
		<Column span="4">
			<Content>4</Content>
		</Column>
		<Column span="4">
			<Content>4</Content>
		</Column>
		<Column span="4">
			<Content>4</Content>
		</Column>
		<Column span="6">
			<Content>6</Content>
		</Column>
		<Column span="6">
			<Content>6</Content>
		</Column>
	</Columns>
)

export const Responsive = () => (
	<Columns gap="8">
		<Column span={{ mobile: '12', tablet: '6', desktop: '3' }}>
			<Content>mobile: 12, tablet: 6, desktop: 3</Content>
		</Column>
		<Column span={{ mobile: '12', tablet: '6', desktop: '3' }}>
			<Content>mobile: 12, tablet: 6, desktop: 3</Content>
		</Column>
		<Column span="6">
			<Content>static: 6</Content>
		</Column>
	</Columns>
)
