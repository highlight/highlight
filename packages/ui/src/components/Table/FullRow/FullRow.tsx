import React from 'react'

import { Cell } from '../Cell/Cell'
import { Row } from '../Row/Row'

export type Props = {
	children: React.ReactNode
}

export const FullRow: React.FC<Props> = ({ children }) => (
	<Row gridColumns={['100%']}>
		<Cell justifyContent="center" my="8">
			{children}
		</Cell>
	</Row>
)
