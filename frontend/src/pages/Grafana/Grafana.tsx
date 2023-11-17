import moment from 'moment'
import { registerMicroApps, start } from 'qiankun'
import React, { ReactNode } from 'react'

import { Box } from '@/../../packages/ui/src'

export interface RawTimeRange {
	from: moment.Moment | string
	to: moment.Moment | string
}

export interface TimeRange {
	from: moment.Moment
	to: moment.Moment
	raw: RawTimeRange
}

export interface HighlightDashboardProps {
	FNDashboard: boolean
	fnGlobalTimeRange: TimeRange | null

	name: string
	uid: string
	slug: string
	version: number
	mode: 'dark' | 'light'
	queryParams: any
	fnError?: ReactNode
	pageTitle?: string
	controlsContainer: string | null
	isLoading: (isLoading: boolean) => void
	setErrors: (errors?: { [K: number | string]: string }) => void
	hiddenVariables: readonly string[]
	container?: HTMLElement | null
}

export const Grafana = () => {
	const rootRef = React.useRef<HTMLDivElement | null>(null)
	registerMicroApps([
		{
			name: 'grafana-portal', // app name registered
			entry: 'https://localhost:3005/public/microfrontends/fn_dashboard',
			container: '#grafana-portal',
			activeRule: '/1/grafana',
			props: {
				FNDashboard: true,
				fnGlobalTimeRange: null,
				name: 'highlight',
				uid: 'dc221bdb-f781-4f7b-971b-4b9863750d8d',
				slug: 'highlight',
				queryParams: { orgId: '1' },
				version: 1,
				mode: 'dark',
				controlsContainer: '#grafanaControls',
				container: rootRef?.current,
				isLoading: (loading) => console.log('vadim', { loading }),
			} as HighlightDashboardProps,
		},
	])

	start({})

	return (
		<Box width="full" height="full">
			<div
				ref={rootRef}
				id="grafana-portal"
				style={{ width: 900, height: 300 }}
			/>
			<div id="grafanaControls" style={{ width: 900, height: 300 }} />
		</Box>
	)
}
