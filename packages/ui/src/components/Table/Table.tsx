import React from 'react'

import * as styles from './styles.css'
import { Box } from '../Box/Box'

import { Body } from './Body/Body'
import { Cell } from './Cell/Cell'
import { Header } from './Header/Header'
import { Row } from './Row/Row'

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

const Table: React.FC<Props> & {
	Body: React.FC<any>
	Cell: React.FC<any>
	Head: React.FC<any>
	Header: React.FC<any>
	Row: React.FC<any>
} = TableComponent as any

Table.Body = Body
Table.Cell = Cell
Table.Header = Header
Table.Row = Row

export { Table }
