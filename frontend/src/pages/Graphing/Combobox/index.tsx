import { ComboboxSelect, Text } from '@highlight-run/ui/components'
import React from 'react'

import * as style from './styles.css'

type Props = {
	options: string[]
	selection: string
	setSelection: (selection: string) => void
	setQuery: (query: string) => void
	label: string
}

export const Combobox: React.FC<Props> = ({
	options,
	selection,
	setSelection,
	setQuery,
	label,
}) => {
	return (
		<ComboboxSelect
			label={label}
			value={selection}
			valueRender={<Text cssClass={style.comboboxText}>{selection}</Text>}
			options={options.map((o) => ({
				key: o,
				render: o,
			}))}
			onChange={(val: string) => {
				setSelection(val)
			}}
			onChangeQuery={(val: string) => {
				setQuery(val)
			}}
			cssClass={style.combobox}
			wrapperCssClass={style.comboboxWrapper}
			queryPlaceholder="Filter..."
		/>
	)
}
