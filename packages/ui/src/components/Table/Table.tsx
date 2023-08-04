import React from 'react'

import * as styles from './styles.css'
import { Box } from '../Box/Box'

import { Body, Props as BodyProps } from './Body/Body'
import { Cell, Props as CellProps } from './Cell/Cell'
import {
	Discoverable,
	Props as DiscoverableProps,
} from './Discoverable/Discoverable'
import { Head, Props as HeadProps } from './Head/Head'
import { Header, Props as HeaderProps } from './Header/Header'
import { Row, Props as RowProps } from './Row/Row'

type Props = {
	children: React.ReactNode
	loading?: boolean
	error?: string
}

const TableComponent: React.FC<Props> = ({ children, loading, error }) => {
	return (
		<Box className={styles.container}>
			{loading && 'Loading...'}
			{!!error && error}
			{!loading && !error && children}
		</Box>
	)
}

type TableWithComponents = React.FC<Props> & {
	Body: React.FC<BodyProps>
	Cell: React.FC<CellProps>
	Discoverable: React.FC<DiscoverableProps>
	Head: React.FC<HeadProps>
	Header: React.FC<HeaderProps>
	Row: React.FC<RowProps>
}

const Table = TableComponent as TableWithComponents

Table.Body = Body
Table.Cell = Cell
Table.Discoverable = Discoverable
Table.Head = Head
Table.Header = Header
Table.Row = Row

export { Table }
