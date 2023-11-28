import Button from '@components/Button/Button/Button'
import Input from '@components/Input/Input'
import { Slider } from 'antd'
import { debounce } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { useToggle } from 'react-use'

import styles from './LengthInput.module.css'

interface LengthInputProps {
	start: number
	end: number
	max: number
	type: string
	onChange: (start: number, end: number) => void
}

export const LengthInput = ({
	start,
	end,
	type,
	max,
	onChange,
}: LengthInputProps) => {
	const [localMin, setLocalMin] = useState(start)
	const [localMax, setLocalMax] = useState(end)
	const [showAdvanced, toggleShowAdvanced] = useToggle(false)
	const isTime = type !== 'range'

	const updateSearchParams = () => {
		onChange(Math.min(localMin, localMax), Math.max(localMin, localMax))
	}

	const marks: { [key: string]: string } = {
		0: '0',
		[max]: `${max}+`,
	}

	useEffect(() => {
		setLocalMin(start)
		setLocalMax(end)
	}, [start, end])

	return (
		<div className={styles.sessionLengthInput}>
			<div className={styles.headerContainer}>
				<span className={styles.sessionLengthInputLabel}>
					Length{' '}
					{isTime && (!showAdvanced ? '(minutes)' : '(seconds)')}
				</span>
				{isTime && (
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
				)}
			</div>
			{isTime && showAdvanced ? (
				<AdvancedLengthInput
					start={start}
					end={end}
					type={type}
					max={max}
					onChange={(min, max) => {
						setLocalMin(min)
						setLocalMax(max)
					}}
				/>
			) : (
				<Slider
					range
					className={styles.slider}
					tooltipPlacement="bottom"
					getTooltipPopupContainer={() =>
						document.querySelector('.ant-slider-step')!
					}
					disabled={false}
					min={0}
					max={max}
					marks={marks}
					value={[localMin, localMax]}
					onChange={([min, max]) => {
						setLocalMin(min)
						setLocalMax(max)
					}}
				/>
			)}
			<div className={styles.buttonContainer}>
				<Button
					type="primary"
					trackingId="QueryBuilderSetLength"
					className={styles.advancedLengthInput}
					onClick={updateSearchParams}
				>
					Ok
				</Button>
			</div>
		</div>
	)
}

const AdvancedLengthInput = ({ start, end, onChange }: LengthInputProps) => {
	const onStartingDurationChangeHandler = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		onChange((parseInt(e.target.value, 10) ?? 0) / 60, end)
	}

	const onEndingDurationChangeHandler = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		onChange(start, (parseInt(e.target.value, 10) ?? 0) / 60)
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

	return (
		<div className={styles.advancedLengthInput}>
			<div className={styles.group}>
				<Input
					type="number"
					placeholder="Min"
					defaultValue={start * 60}
					onChange={(e: any) => {
						e.persist()
						debouncedStartingDurationChangeHandler(e)
					}}
				/>
			</div>
			<div className={styles.group}>
				<Input
					type="number"
					placeholder="Max"
					defaultValue={end * 60}
					onChange={(e: any) => {
						e.persist()
						debouncedEndingDurationChangeHandler(e)
					}}
				/>
			</div>
		</div>
	)
}
