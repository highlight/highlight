import React from 'react'
import type { Meta } from '@storybook/react'

import { Table } from './Table'

import { IconSolidCubeTransparent } from '../icons'

export default {
	title: 'Components/Table',
	component: Table,
} as Meta<typeof Table>

type DefaultData = {
	name: string
	age: number
	language: string
}

export const Default = () => {
	const columns = [
		{
			name: 'Name',
			width: 'auto',
			dataFormat: {
				icon: <IconSolidCubeTransparent size={12} />,
			},
			renderData: (data: DefaultData) => data.name,
		},
		{
			name: 'Age',
			width: '100px',
			renderData: (data: DefaultData) => data.age,
		},
		{
			name: 'Favorite Language',
			width: '150px',
			renderData: (data: DefaultData) => (
				<Table.Discoverable>{data.language}</Table.Discoverable>
			),
		},
	]

	const data: DefaultData[] = [
		{
			name: 'John',
			age: 20,
			language: 'JavaScript',
		},
		{
			name: 'Jane',
			age: 21,
			language: 'Python',
		},
		{
			name: 'Joe',
			age: 22,
			language: 'Go',
		},
	]

	const gridColumns = columns.map((column) => column.width)

	return (
		<Table>
			<Table.Head>
				<Table.Row gridColumns={gridColumns}>
					{columns.map((column) => (
						<Table.Header key={column.name}>
							{column.name}
						</Table.Header>
					))}
				</Table.Row>
			</Table.Head>
			<Table.Body>
				{data.map((row: DefaultData) => (
					<Table.Row gridColumns={gridColumns} key={row.name}>
						{columns.map((column) => (
							<Table.Cell
								key={column.name}
								icon={column.dataFormat?.icon}
							>
								{column.renderData(row)}
							</Table.Cell>
						))}
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	)
}
