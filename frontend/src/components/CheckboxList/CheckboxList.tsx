import Checkbox, { CheckboxChangeEvent } from 'antd/es/checkbox'
import clsx from 'clsx'
import React, { useState } from 'react'

import styles from './CheckboxList.module.scss'

interface Props {
	checkboxOptions: CheckboxOption[]
	containerClassName?: string
	onSelectAll?: () => void
	onSelectOne?: (key: string) => void
}

interface CheckboxOption {
	label: string | React.ReactNode
	onChange: (e: CheckboxChangeEvent) => void
	checked: boolean
	key: string
}

const CheckboxList = ({
	checkboxOptions,
	containerClassName,
	onSelectAll,
	onSelectOne,
}: Props) => {
	const [hoverOnCheckbox, setHoverOnCheckbox] = useState(false)

	const numberOfCheckedOptions = checkboxOptions.reduce((acc, curr) => {
		return curr.checked ? acc + 1 : acc
	}, 0)

	const toggleAllOrOnly = (option: CheckboxOption) => {
		if (option.checked) {
			if (numberOfCheckedOptions > 1) {
				if (onSelectOne) {
					onSelectOne(option.key)
				} else {
					checkboxOptions.forEach((o) => {
						if (o.key === option.key) {
							o.onChange({
								target: { checked: true },
							} as CheckboxChangeEvent)
						} else {
							o.onChange({
								target: { checked: false },
							} as CheckboxChangeEvent)
						}
					})
				}
			} else {
				// Toggle All.
				if (onSelectAll) {
					onSelectAll()
				} else {
					checkboxOptions.forEach((o) => {
						o.onChange({
							target: { checked: true },
						} as CheckboxChangeEvent)
					})
				}
			}
		} else {
			// Toggle only the selected option on.
			if (onSelectOne) {
				onSelectOne(option.key)
			} else {
				checkboxOptions.forEach((o) => {
					if (o.key === option.key) {
						o.onChange({
							target: {
								checked: true,
							},
						} as CheckboxChangeEvent)
					} else {
						o.onChange({
							target: {
								checked: false,
							},
						} as CheckboxChangeEvent)
					}
				})
			}
		}
	}

	return (
		<div className={clsx(containerClassName)}>
			{checkboxOptions.map((option) => (
				<div key={option.key} className={styles.checkboxOption}>
					<div className={styles.checkboxContainer}>
						<Checkbox
							checked={option.checked}
							onChange={option.onChange}
							onMouseEnter={() => {
								setHoverOnCheckbox(true)
							}}
							onMouseLeave={() => {
								setHoverOnCheckbox(false)
							}}
						/>
					</div>

					<button
						className={styles.button}
						onClick={() => {
							toggleAllOrOnly(option)
						}}
					>
						{option.label}
						<p className={styles.actionLabel}>
							{hoverOnCheckbox
								? 'Toggle'
								: getActionLabel(
										option,
										numberOfCheckedOptions,
								  )}
						</p>
					</button>
				</div>
			))}
		</div>
	)
}

export default CheckboxList

const getActionLabel = (
	option: CheckboxOption,
	numberOfCheckedOptions: number,
) => {
	if (option.checked) {
		if (numberOfCheckedOptions > 1) {
			return 'Only'
		} else {
			return 'All'
		}
	} else {
		return 'Only'
	}
}
