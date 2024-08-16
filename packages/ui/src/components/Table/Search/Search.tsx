import { useComboboxStore } from '@ariakit/react'
import React from 'react'

import { vars } from '../../../css/vars'
import { Box } from '../../Box/Box'
import { Combobox } from '../../Combobox/Combobox'
import { IconSolidSearch } from '../../icons'
import * as styles from './styles.css'

export type Props = {
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	placeholder?: string
}

export const Search: React.FC<Props> = ({ placeholder, handleChange }) => {
	const comboboxStore = useComboboxStore()

	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="flex-start"
			cssClass={styles.search}
			px="8"
			gap="8"
		>
			<IconSolidSearch color={vars.theme.static.content.default} />
			<Combobox
				store={comboboxStore}
				name="search"
				placeholder={placeholder ?? 'Search...'}
				className={styles.combobox}
				onChange={handleChange}
			/>
		</Box>
	)
}
