import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { DashboardMetricConfig } from '@graph/schemas'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import React from 'react'

import styles from './Metric.module.css'

interface Props {
	configuration: DashboardMetricConfig
	value: number
	name: string
}

const SimpleMetric = ({ configuration, value, name }: Props) => {
	const valueScore = getMetricValueScore(value, configuration)

	return (
		<div
			className={clsx(styles.simpleMetric, styles.metric, {
				[styles.goodScore]: valueScore === MetricValueScore.Good,
				[styles.needsImprovementScore]:
					valueScore === MetricValueScore.NeedsImprovement,
				[styles.poorScore]: valueScore === MetricValueScore.Poor,
			})}
		>
			<span className={styles.name}>{name}</span>
		</div>
	)
}

export const DetailedMetric = ({ configuration, value, name }: Props) => {
	const valueScore = getMetricValueScore(value, configuration)

	return (
		<div
			className={clsx(styles.metric, styles.detailedMetric, {
				[styles.goodScore]: valueScore === MetricValueScore.Good,
				[styles.needsImprovementScore]:
					valueScore === MetricValueScore.NeedsImprovement,
				[styles.poorScore]: valueScore === MetricValueScore.Poor,
			})}
		>
			<span className={styles.name}>
				{name}{' '}
				<InfoTooltip
					className={styles.infoTooltip}
					title={getInfoTooltipText(configuration, value)}
					align={{ offset: [-13, 0] }}
					placement="topLeft"
				/>
			</span>
			<ScoreVisualization value={value} configuration={configuration} />
		</div>
	)
}

export default SimpleMetric

enum MetricValueScore {
	Good,
	NeedsImprovement,
	Poor,
}

function getMetricValueScore(
	value: number,
	{
		max_good_value,
		max_needs_improvement_value,
	}: Pick<
		DashboardMetricConfig,
		'max_good_value' | 'max_needs_improvement_value'
	>,
): MetricValueScore {
	if (max_good_value && value <= max_good_value) {
		return MetricValueScore.Good
	}
	if (max_needs_improvement_value && value <= max_needs_improvement_value) {
		return MetricValueScore.NeedsImprovement
	}

	return MetricValueScore.Poor
}

function getInfoTooltipText(
	configuration: DashboardMetricConfig,
	value: number,
): React.ReactNode {
	const valueScore = getMetricValueScore(value, configuration)

	let message = ''
	switch (valueScore) {
		case MetricValueScore.Poor:
			message = `Looks like you're not doing so hot for ${configuration.name} on this session.`
			break
		case MetricValueScore.NeedsImprovement:
			message = `You're scoring okay for ${configuration.name} on this session. You can do better though!`
			break
		case MetricValueScore.Good:
			message = `You're scoring AMAZINGLY for ${configuration.name} on this session!`
			break
	}

	return (
		<div
			// This is to prevent the stream element from collapsing from clicking on a link.
			onClick={(e) => {
				e.stopPropagation()
			}}
		>
			{message}{' '}
			<a
				href={configuration.help_article || ''}
				target="_blank"
				rel="noreferrer"
			>
				Learn more about optimizing {configuration.name}.
			</a>
		</div>
	)
}

interface ScoreVisualizationProps {
	value: number
	configuration: DashboardMetricConfig
}

const ScoreVisualization = ({
	configuration,
	value,
}: ScoreVisualizationProps) => {
	const valueScore = getMetricValueScore(value, configuration)
	const scorePosition = getScorePosition(configuration, value)
	let gapSpacing = 0

	switch (valueScore) {
		case MetricValueScore.NeedsImprovement:
			gapSpacing = 2
			break
		case MetricValueScore.Poor:
			gapSpacing = 2 * 2
			break
	}

	return (
		<div className={styles.scoreVisualization}>
			<motion.div
				className={styles.scoreIndicator}
				animate={{
					left: `calc(${
						scorePosition * 100
					}% - calc(var(--size) / 2) + ${gapSpacing}px)`,
				}}
				transition={{
					type: 'spring',
				}}
			>
				<span
					className={clsx(styles.value, {
						[styles.mirror]: valueScore === MetricValueScore.Poor,
					})}
				>
					{value.toFixed(2)}
					<span className={styles.units}>{configuration.units}</span>
				</span>
			</motion.div>
			<div
				className={clsx(styles.good, {
					[styles.active]: valueScore === MetricValueScore.Good,
				})}
			></div>
			<div
				className={clsx(styles.needsImprovement, {
					[styles.active]:
						valueScore === MetricValueScore.NeedsImprovement,
				})}
			></div>
			<div
				className={clsx(styles.poor, {
					[styles.active]: valueScore === MetricValueScore.Poor,
				})}
			></div>
		</div>
	)
}

const getScorePosition = (
	configuration: DashboardMetricConfig,
	value: number,
) => {
	const valueScore = getMetricValueScore(value, configuration)
	let offset = 0
	let min = 0
	let max = 0
	const OFFSET_AMOUNT = 0.33

	switch (valueScore) {
		case MetricValueScore.Good:
			offset = 0
			min = 0
			max = configuration.max_good_value || 1
			break
		case MetricValueScore.NeedsImprovement:
			offset = OFFSET_AMOUNT
			min = configuration.max_good_value || 1
			max = configuration.max_needs_improvement_value || 5
			break
		case MetricValueScore.Poor:
			offset = OFFSET_AMOUNT * 2
			min = configuration.max_needs_improvement_value || 10
			max = Infinity
			break
	}

	// There's no upper value for a poor value so we generate a random value.
	if (max === Infinity) {
		return offset + Math.random() * OFFSET_AMOUNT
	}

	const range = max - min
	const percent = (value - min) / range
	const relativePercent = OFFSET_AMOUNT * percent

	return offset + relativePercent
}
