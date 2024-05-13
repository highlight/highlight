'use client'
import { useEffect } from 'react'
import { rudderInitialize } from '../scripts/rudder-initialize'
import { setAttributionData } from '../utils/attribution'

export default function Analytics() {
	useEffect(() => {
		const initialize = async () => {
			await rudderInitialize()
			window.rudderanalytics?.page()

			setAttributionData()
		}

		initialize()
	}, [])
	return null
}
