import React from 'react'

import { Body, Props as BodyProps } from './Body/Body'
import { Cell, Props as CellProps } from './Cell/Cell'
import {
	Discoverable,
	Props as DiscoverableProps,
} from './Discoverable/Discoverable'
import { FullRow, Props as FullRowProps } from './FullRow/FullRow'
import { Head, Props as HeadProps } from './Head/Head'
import { Header, Props as HeaderProps } from './Header/Header'
import { Row, Props as RowProps } from './Row/Row'

import { Box } from '../Box/Box'

type Props = {
	children: React.ReactNode
	className?: string
}

const TableComponent: React.FC<Props> = ({ children, className }) => {
	return (
		<Box cssClass={className} width="full">
			{children}
		</Box>
	)
}

type TableWithComponents = React.FC<Props> & {
	Body: React.FC<BodyProps>
	Cell: React.FC<CellProps>
	Discoverable: React.FC<DiscoverableProps>
	FullRow: React.FC<FullRowProps>
	Head: React.FC<HeadProps>
	Header: React.FC<HeaderProps>
	Row: React.FC<RowProps>
}

const Table = TableComponent as TableWithComponents

Table.Body = Body
Table.Cell = Cell
Table.Discoverable = Discoverable
Table.FullRow = FullRow
Table.Head = Head
Table.Header = Header
Table.Row = Row

export { Table }
