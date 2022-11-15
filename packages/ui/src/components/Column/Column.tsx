import clsx from 'clsx'
import React from 'react'
import { Box, BoxProps } from '../Box/Box'
import { sprinkles } from '../../css/sprinkles.css'
import { negativeMargin } from './utils'

import * as styles from './styles.css'

const ColumnsContext = React.createContext<{ gap: BoxProps['padding'] }>({
	gap: '0',
})

type ColumnsProps = React.PropsWithChildren & {
	gap?: BoxProps['gap']
}

const Columns: React.FC<ColumnsProps> = ({ children, gap }) => (
	<ColumnsContext.Provider value={{ gap }}>
		<Box cssClass={clsx(styles.columns, negativeMargin(gap))}>
			{children}
		</Box>
	</ColumnsContext.Provider>
)

type ColumnProps = React.PropsWithChildren & {
	span?: styles.ColumnSprinkles['flex']
}

type ColumnComponent = React.FC<ColumnProps> & {
	Container: typeof Columns
}

export const Column: ColumnComponent = ({
	children,
	span = 'auto',
}: ColumnProps) => {
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

Column.Container = Columns
