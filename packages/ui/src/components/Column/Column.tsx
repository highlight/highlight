import clsx from 'clsx'
import React from 'react'

import { spaces } from '../../css/spaces'
import { sprinkles } from '../../css/sprinkles.css'
import { Box } from '../Box/Box'
import * as styles from './styles.css'
import { negativeMargin } from './utils'

type Gap = keyof typeof spaces

const ColumnsContext = React.createContext<{ gap: Gap }>({
	gap: '0',
})

type ColumnsProps = React.PropsWithChildren & {
	gap?: Gap
}

const Columns: React.FC<ColumnsProps> = ({ children, gap }) => (
	<ColumnsContext.Provider value={{ gap: gap ?? '0' }}>
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
