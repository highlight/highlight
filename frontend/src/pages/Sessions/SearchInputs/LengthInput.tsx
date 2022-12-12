import 'antd/dist/antd.css'

import { Slider } from 'antd'
import { debounce } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { useToggle } from 'react-use'

import Button from '../../../components/Button/Button/Button'
import Input from '../../../components/Input/Input'
import { useSearchContext } from '../SearchContext/SearchContext'
import styles from './LengthInput.module.scss'

export const LengthInput = () => {
	const { searchParams, setSearchParams } = useSearchContext()
	const [localMin, setLocalMin] = useState(
		searchParams.length_range?.min ? searchParams.length_range?.min : 0,
	)
	const [localMax, setLocalMax] = useState(
		searchParams.length_range?.max ? searchParams.length_range?.max : 0,
	)
	const [showAdvanced, toggleShowAdvanced] = useToggle(false)

	const updateSearchParams = () => {
		setSearchParams((params) => {
			return {
				...params,
				length_range: {
					min: Math.min(localMin, localMax),
					max: Math.max(localMin, localMax),
				},
			}
		})
	}

	const marks = {
		0: '0',
		60: '60+',
	}

	useEffect(() => {
		setLocalMax(searchParams.length_range?.max ?? 0)
		setLocalMin(searchParams.length_range?.min ?? 60)
	}, [searchParams.length_range])

	return (
		<div className={styles.sessionLengthInput}>
			<div className={styles.headerContainer}>
				<span className={styles.sessionLengthInputLabel}>
					Length {!showAdvanced ? '(minutes)' : '(seconds)'}
				</span>
				<Button
					trackingId="showAdvancedLengthInput"
					type="text"
					size="small"
					onClick={() => {
						toggleShowAdvanced()
					}}
				>
					Advanced
				</Button>
			</div>
			{showAdvanced ? (
				<AdvancedLengthInput />
			) : (
				<Slider
					range
					className={styles.slider}
					tooltipPlacement="bottom"
					disabled={false}
					min={0}
					max={60}
					marks={marks}
					value={[localMin, localMax]}
					onChange={([min, max]) => {
						setLocalMin(min)
						setLocalMax(max)
					}}
					onAfterChange={updateSearchParams}
				/>
			)}
		</div>
	)
}

const AdvancedLengthInput = () => {
	const { searchParams, setSearchParams } = useSearchContext()

	const onStartingDurationChangeHandler = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		setSearchParams((existingSearchParams) => ({
			...existingSearchParams,
			length_range: {
				min: (parseInt(e.target.value, 10) ?? 0) / 60,
				max: existingSearchParams.length_range?.max ?? 1000,
			},
		}))
	}

	const onEndingDurationChangeHandler = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		setSearchParams((existingSearchParams) => ({
			...existingSearchParams,
			length_range: {
				min: existingSearchParams.length_range?.min ?? 0,
				max: (parseInt(e.target.value, 10) ?? 0) / 60,
			},
		}))
	}

	const debouncedStartingDurationChangeHandler = useMemo(
		() => debounce(onStartingDurationChangeHandler, 200),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	const debouncedEndingDurationChangeHandler = useMemo(
		() => debounce(onEndingDurationChangeHandler, 200),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	let min: number | undefined
	let max: number | undefined
	if (searchParams?.length_range?.min) {
		min = searchParams.length_range.min * 60
	}
	if (searchParams?.length_range?.max) {
		max = searchParams.length_range.max * 60
	}

	return (
		<div className={styles.advancedLengthInput}>
			<div className={styles.group}>
				<Input
					type="number"
					placeholder="Min"
					defaultValue={min}
					onChange={(e) => {
						e.persist()
						debouncedStartingDurationChangeHandler(e)
					}}
				/>
			</div>
			<div className={styles.group}>
				<Input
					type="number"
					placeholder="Max"
					defaultValue={max}
					onChange={(e) => {
						e.persist()
						debouncedEndingDurationChangeHandler(e)
					}}
				/>
			</div>
		</div>
	)
}
