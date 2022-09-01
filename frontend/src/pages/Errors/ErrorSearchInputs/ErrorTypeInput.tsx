import { useAuthContext } from '@authentication/AuthContext'
import React from 'react'

import Select from '../../../components/Select/Select'
import { useErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext'
import styles from './ErrorStateInput.module.scss'

const ErrorType = ['Backend', 'console.error', 'window.onerror', 'custom']

const ErrorTypeOptions = ErrorType.map((val: string) => ({
	displayValue: `${val}`,
	value: val,
	id: val,
}))

const ErrorTypeInput = () => {
	const { searchParams, setSearchParams } = useErrorSearchContext()

	const { isHighlightAdmin } = useAuthContext()

	const options: {
		displayValue: string
		value: string
		id: string
	}[] = [
		{ displayValue: 'All', value: 'ALL', id: 'ALL' },
		...ErrorTypeOptions.filter((val) => {
			if (val.value === 'Backend') {
				return isHighlightAdmin
			}
			return true
		}),
	]

	return (
		<div>
			<Select
				className={styles.select}
				options={options}
				value={searchParams.type || 'ALL'}
				onChange={(newType) => {
					setSearchParams((previousSearchParams) => ({
						...previousSearchParams,
						type: newType === 'ALL' ? undefined : newType,
					}))
				}}
			/>
		</div>
	)
}

export default ErrorTypeInput
