import * as heatmap from 'heatmap.js'
import moment from 'moment'
import React, { useEffect, useRef } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useGetTracesLazyQuery } from '@/graph/generated/hooks'
import { SortDirection } from '@/graph/generated/schemas'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'

export const PlayerHeatmapCanvas: React.FC = () => {
	const canvasRef = useRef<HTMLDivElement>(null)
	const { projectId } = useNumericProjectId()
	const { currentUrl, replayer } = useReplayerContext()
	const heatmapInstance = useRef<ReturnType<typeof heatmap.create>>()
	const url = currentUrl?.split('?')[0].split('/')[4]
	const { height, width } = replayer?.wrapper.getBoundingClientRect() ?? {
		height: 0,
		width: 0,
	}
	debugger

	const [tracesQuery] = useGetTracesLazyQuery({
		onCompleted: (data) => {
			const heatmapData = data.traces.edges.map((trace) => {
				return {
					x:
						Number(trace.node.traceAttributes?.event.relativeX) *
						width,
					y:
						Number(trace.node.traceAttributes?.event.relativeY) *
						height,
				}
			})

			heatmapInstance.current?.setData({
				max: 5,
				min: 0,
				data: heatmapData,
			})
		},
	})

	useEffect(() => {
		tracesQuery({
			variables: {
				project_id: projectId!,
				direction: SortDirection.Desc,
				params: {
					query: `event.url="*${url}*" event.type=(click OR mousemove) event.relativeX EXISTS`,
					date_range: {
						start_date: moment()
							.subtract(7, 'days')
							.format(TIME_FORMAT),
						end_date: moment().format(TIME_FORMAT),
					},
				},
			},
		})

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!heatmapInstance.current && canvasRef.current) {
			heatmapInstance.current = heatmap.create({
				backgroundColor: 'rgba(0, 0, 0, 0.1)',
				container: canvasRef.current,
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (!url) {
		return null
	}

	return (
		<div
			ref={canvasRef}
			id="heatmap-canvas"
			style={{
				height,
				width,
				// transform: `scale(${scale})`,
				transformOrigin: 'top left',
			}}
		/>
	)
}
