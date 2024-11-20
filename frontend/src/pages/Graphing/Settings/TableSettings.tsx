import { TagSwitchGroup } from '@highlight-run/ui/components'
import React from 'react'

import { TABLE_NULL_HANDLING, TableNullHandling } from '../components/Table'
import { LabeledRow } from '../LabeledRow'
import * as style from './styles.css'

type Props = {
	nullHandling: TableNullHandling
	setNullHandling: (option: TableNullHandling) => void
	disabled?: boolean
}

export const TableSettings: React.FC<Props> = ({
	nullHandling,
	setNullHandling,
	disabled,
}) => (
	<LabeledRow
		label="Nulls"
		name="tableNullHandling"
		tooltip="Determines how null / empty values are handled."
	>
		<TagSwitchGroup
			options={TABLE_NULL_HANDLING}
			defaultValue={nullHandling}
			onChange={(o: string | number) => {
				setNullHandling(o as TableNullHandling)
			}}
			cssClass={style.tagSwitch}
			disabled={disabled}
		/>
	</LabeledRow>
)
