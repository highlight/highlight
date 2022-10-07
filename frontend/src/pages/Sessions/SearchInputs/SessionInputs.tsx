import { useParams } from '@util/react-router/useParams'
import { Checkbox } from 'antd'
import React from 'react'

import { useSearchContext } from '../SearchContext/SearchContext'
import { LIVE_SEGMENT_ID } from '../SearchSidebar/SegmentPicker/SegmentPicker'
import inputStyles from './InputStyles.module.scss'

export const ViewedSessionsSwitch = () => {
	const { searchParams, setSearchParams } = useSearchContext()

	return (
		<Checkbox
			checked={searchParams.hide_viewed}
			onChange={(e) => {
				setSearchParams((params) => ({
					...params,
					hide_viewed: e.target.checked,
				}))
			}}
			className={
				searchParams.hide_viewed ? '' : inputStyles.checkboxUnselected
			}
		>
			Hide viewed sessions
		</Checkbox>
	)
}

export const LiveSessionsSwitch = () => {
	const { searchParams, setSearchParams } = useSearchContext()
	const { segment_id } = useParams<{
		segment_id: string
	}>()

	const isOnLiveSegment = segment_id === LIVE_SEGMENT_ID

	return (
		<Checkbox
			disabled={isOnLiveSegment}
			checked={isOnLiveSegment ? true : !!searchParams.show_live_sessions}
			onChange={(e) => {
				setSearchParams((params) => ({
					...params,
					show_live_sessions: e.target.checked,
				}))
			}}
			className={
				searchParams.show_live_sessions
					? ''
					: inputStyles.checkboxUnselected
			}
		>
			Show live sessions
		</Checkbox>
	)
}
