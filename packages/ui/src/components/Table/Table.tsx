import clsx from 'clsx'
import React from 'react'

import { Box, BoxProps } from '../Box/Box'
import { Body } from './Body/Body'
import { Cell } from './Cell/Cell'
import { Discoverable } from './Discoverable/Discoverable'
import { FullRow } from './FullRow/FullRow'
import { Head } from './Head/Head'
import { Header } from './Header/Header'
import { Row } from './Row/Row'
import { Search } from './Search/Search'
import * as styles from './styles.css'

type Props = {
	children: React.ReactNode
	className?: string
	height?: BoxProps['height']
	noBorder?: boolean
}

const TableComponent: React.FC<Props> = ({
	children,
	className,
	height,
	noBorder,
}) => {
	return (
		<Box
			cssClass={clsx(styles.table, className, {
				[styles.noBorder]: noBorder,
			})}
			height={height}
			width="full"
		>
			{children}
		</Box>
	)
}

type TableWithComponents = React.FC<Props> & {
	Body: typeof Body
	Cell: typeof Cell
	Discoverable: typeof Discoverable
	FullRow: typeof FullRow
	Head: typeof Head
	Header: typeof Header
	Row: typeof Row
	Search: typeof Search
}

const Table = TableComponent as TableWithComponents

Table.Body = Body
Table.Cell = Cell
Table.Discoverable = Discoverable
Table.FullRow = FullRow
Table.Head = Head
Table.Header = Header
Table.Row = Row
Table.Search = Search

export { Table }
