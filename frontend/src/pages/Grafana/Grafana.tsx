import { registerMicroApps, start } from 'qiankun'
import React from 'react'

export interface HighlightDashboardProps {
	name: string
	uid: string
	slug: string
	version: number
	mode: 'dark' | 'light'
	// queryParams: ParsedQuery<string>
	// fnError?: ReactNode
	pageTitle?: string
	controlsContainer: string | null
	isLoading: (isLoading: boolean) => void
	setErrors: (errors?: { [K: number | string]: string }) => void
	hiddenVariables: readonly string[]
	container?: HTMLElement | null
}

export const Grafana = () => {
	registerMicroApps([
		{
			name: 'grafanaRoot', // app name registered
			entry: 'https://localhost:3005/public/microfrontends/fn_dashboard/',
			container: '#grafanaRoot',
			activeRule: '/1/grafana',
			props: {
				name: 'd',
				uid: 'dc221bdb-f781-4f7b-971b-4b9863750d8d',
				slug: 'highlight',
				version: 1,
				mode: 'dark',
			} as HighlightDashboardProps,
		},
	])

	start({})

	return <div id="grafanaRoot" style={{ width: 100, height: 100 }} />
}
