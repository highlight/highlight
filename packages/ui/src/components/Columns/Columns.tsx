import clsx from 'clsx'
import React from 'react'
import { Box, Props as BoxProps } from '../Box/Box'
import { sprinkles } from '../../css/sprinkles.css'
import { negativeMargin } from './utils'

import * as styles from './styles.css'

const ColumnsContext = React.createContext<{ gap: BoxProps['padding'] }>({
	gap: '8',
})

type ColumnsProps = React.PropsWithChildren & {
	gap: BoxProps['gap']
}

type ColumnsComponent = React.FC<ColumnsProps> & {
	Column: typeof Column
}

export const Columns: ColumnsComponent = ({ children, gap }: ColumnsProps) => {
	return (
		<ColumnsContext.Provider value={{ gap }}>
			<Box cssClass={clsx(styles.columns, negativeMargin(gap))}>
				{children}
			</Box>
		</ColumnsContext.Provider>
	)
}

type ColumnProps = React.PropsWithChildren & {
	span: styles.ColumnSprinkles['flex']
}

export const Column: React.FC<ColumnProps> = ({ children, span }) => {
	const { gap } = React.useContext(ColumnsContext)

	return (
		<Box
			cssClass={clsx(
				styles.column,
				styles.columnSprinkles({ flex: span }),
				sprinkles({ pl: gap, pt: gap }),
			)}
		>
			{children}
		</Box>
	)
}

Columns.Column = Column
