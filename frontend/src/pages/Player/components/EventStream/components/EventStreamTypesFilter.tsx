import Button from '@components/Button/Button/Button'
import CheckboxList from '@components/CheckboxList/CheckboxList'
import Popover from '@components/Popover/Popover'
import { colors } from '@highlight-run/ui/src/css/colors'
import SvgFilterIcon from '@icons/FilterIcon'
import { useEventTypeFilters } from '@pages/Player/components/EventStream/hooks/useEventTypeFilters'
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils'
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { getTimelineEventDisplayName } from '@pages/Player/utils/utils'
import React from 'react'

import styles from './EventStreamTypesFilter.module.scss'

export const EventStreamTypesFilter = () => {
	const {
		setShowClick,
		setShowFocus,
		setShowIdentify,
		setShowNavigate,
		setShowReload,
		setShowSegment,
		setShowTrack,
		setShowViewport,
		setShowReferrer,
		showClick,
		showFocus,
		showIdentify,
		showNavigate,
		showReferrer,
		showReload,
		showSegment,
		showTrack,
		showViewport,
		showWebVitals,
		setShowWebVitals,
		setShowTabHidden,
		showTabHidden,
	} = useEventTypeFilters()
	const activeFiltersCount = [
		showClick,
		showFocus,
		showIdentify,
		showNavigate,
		showReferrer,
		showReload,
		showSegment,
		showTrack,
		showViewport,
		showWebVitals,
		setShowWebVitals,
	].reduce((acc, curr) => {
		return curr ? acc + 1 : acc
	}, 0)

	return (
		<Popover
			trigger={['click']}
			content={
				<section className={styles.popover}>
					<CheckboxList
						checkboxOptions={[
							{
								checked: showIdentify,
								onChange: (e) => {
									setShowIdentify(e.target.checked)
								},
								label: <Label label="Identify" />,
								key: 'Identify',
							},
							{
								checked: showTrack,
								onChange: (e) => {
									setShowTrack(e.target.checked)
								},
								label: <Label label="Track" />,
								key: 'Track',
							},
							{
								checked: showViewport,
								onChange: (e) => {
									setShowViewport(e.target.checked)
								},
								label: <Label label="Viewport" />,
								key: 'Viewport',
							},
							{
								checked: showReferrer,
								onChange: (e) => {
									setShowReferrer(e.target.checked)
								},
								label: <Label label="Referrer" />,
								key: 'Referrer',
							},
							{
								checked: showWebVitals,
								onChange: (e) => {
									setShowWebVitals(e.target.checked)
								},
								label: <Label label="Web Vitals" />,
								key: 'Web Vitals',
							},
							{
								checked: showSegment,
								onChange: (e) => {
									setShowSegment(e.target.checked)
								},
								label: <Label label="Segment" />,
								key: 'Segment',
							},
							{
								checked: showFocus,
								onChange: (e) => {
									setShowFocus(e.target.checked)
								},
								label: <Label label="Focus" />,
								key: 'Focus',
							},
							{
								checked: showNavigate,
								onChange: (e) => {
									setShowNavigate(e.target.checked)
								},
								label: <Label label="Navigate" />,
								key: 'Navigate',
							},
							{
								checked: showClick,
								onChange: (e) => {
									setShowClick(e.target.checked)
								},
								label: <Label label="Click" />,
								key: 'Click',
							},
							{
								checked: showReload,
								onChange: (e) => {
									setShowReload(e.target.checked)
								},
								label: <Label label="Reload" />,
								key: 'Reload',
							},
							{
								checked: showTabHidden,
								onChange: (e) => {
									setShowTabHidden(e.target.checked)
								},
								label: <Label label="TabHidden" />,
								key: 'Tab State',
							},
						]}
						containerClassName={styles.optionsContainer}
					/>
				</section>
			}
			placement="topLeft"
		>
			<Button
				trackingId="SessionEventStreamSettings"
				small
				className={styles.filtersButton}
				style={{ background: colors.n1 }}
			>
				<SvgFilterIcon />
				Filters ({activeFiltersCount})
			</Button>
		</Popover>
	)
}

interface LabelProps {
	label: typeof EventsForTimeline[number]
}
const Label = ({ label }: LabelProps) => {
	return (
		<div className={styles.label}>
			<div
				style={{ background: `var(${getAnnotationColor(label)}` }}
				className={styles.checkboxLabelIndicator}
			/>
			{getTimelineEventDisplayName(label)}
		</div>
	)
}
