import ReactSlider from 'react-slider'

import styles from './Slider.module.css'

export const Slider = ({
	values,
	onChange,
	min,
	max,
	precision,
	step,
	orientation,
}: {
	values: number[]
	onChange: (values: number[], idx: number) => void
	min?: number
	max?: number
	precision?: number
	step?: number
	orientation?: 'horizontal' | 'vertical'
}) => {
	min = min || Math.min(...values)
	max = max || Math.max(...values)
	return (
		<ReactSlider
			className={
				orientation === 'vertical'
					? styles.verticalSlider
					: styles.horizontalSlider
			}
			thumbClassName={styles.sliderThumb}
			trackClassName={styles.sliderTrack}
			max={max}
			min={min}
			value={values}
			onChange={(value: number[], idx: number) => {
				const v = Array.isArray(value) ? value : [value]
				onChange(v, idx)
			}}
			renderThumb={(props: any, state) => (
				<div {...props}>
					{state.valueNow.toFixed(
						precision === undefined ? 1 : precision,
					)}
				</div>
			)}
			pearling
			invert={orientation === 'vertical'}
			minDistance={0.1}
			step={step || 0.1}
			orientation={orientation || 'horizontal'}
		/>
	)
}
