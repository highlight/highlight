import React from 'react'

import Select from '../../../components/Select/Select'
import { ErrorStateOptions } from '../../Error/ErrorStateSelect/ErrorStateSelect'
import { useErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext'
import styles from './ErrorStateInput.module.scss'

const ErrorStateInput = () => {
	const { searchParams, setSearchParams } = useErrorSearchContext()

	const options: {
		displayValue: string
		value: string
		id: string
	}[] = [
		{ displayValue: 'All', value: 'ALL', id: 'ALL' },
		...ErrorStateOptions,
	]

	return (
		<div>
			<Select
				className={styles.select}
				options={options}
				value={searchParams.state || 'ALL'}
				onChange={(newState) => {
					setSearchParams((previousSearchParams) => ({
						...previousSearchParams,
						state: newState === 'ALL' ? undefined : newState,
					}))
				}}
			/>
		</div>
	)
}

export default ErrorStateInput
