import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Column } from './Column'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'

export default {
	title: 'Components/Column',
	component: Column,
} as ComponentMeta<typeof Column>

const Content: React.FC<React.PropsWithChildren> = ({ children }) => (
	<Box background="neutral100" p="12">
		<Text align="center">{children}</Text>
	</Box>
)

export const Basic = () => (
	<>
		<Column.Container gap="8">
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
		</Column.Container>

		<Box mt="24">
			<Column.Container gap="8">
				<Column>
					<Content>auto</Content>
				</Column>
				<Column>
					<Content>auto</Content>
				</Column>
				<Column>
					<Content>auto</Content>
				</Column>
				<Column>
					<Content>auto</Content>
				</Column>
			</Column.Container>
		</Box>
	</>
)

export const Responsive = () => (
	<Column.Container gap="8">
		<Column span={{ mobile: '12', tablet: '6', desktop: '3' }}>
			<Content>mobile: 12, tablet: 6, desktop: 3</Content>
		</Column>
		<Column span={{ mobile: '12', tablet: '6', desktop: '3' }}>
			<Content>mobile: 12, tablet: 6, desktop: 3</Content>
		</Column>
		<Column span="6">
			<Content>static: 6</Content>
		</Column>
	</Column.Container>
)
