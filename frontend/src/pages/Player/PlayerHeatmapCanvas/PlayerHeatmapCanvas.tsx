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
	const { currentUrl, replayer, scale } = useReplayerContext()
	const heatmapInstance = useRef<ReturnType<typeof heatmap.create>>()
	const url = currentUrl?.split('?')[0].split('/')[4]
	const { height, width } = replayer?.wrapper.getBoundingClientRect() ?? {
		height: 0,
		width: 0,
	}

	const [tracesQuery] = useGetTracesLazyQuery({
		onCompleted: (data) => {
			let max = 0
			const elementClicks = data.traces.edges.reduce((acc, trace) => {
				const xpath = trace.node.traceAttributes?.event.xpath
				if (xpath) {
					acc[xpath] = acc[xpath] ? acc[xpath] + 1 : 1
				}
				if (acc[xpath] > max) {
					max = acc[xpath]
				}
				return acc
			}, {} as { [key: string]: number })

			const iframe = replayer?.wrapper.querySelector('iframe')
			if (!iframe?.contentDocument) {
				return
			}

			const heatmapData = Object.entries(elementClicks)
				.map(([xpath, count]) => {
					const nodes = queryXPath(iframe.contentDocument!, xpath)
					const element = nodes[0] as HTMLElement

					if (!element) {
						return
					}

					const { x, y, width, height } =
						element.getBoundingClientRect()

					debugger
					return {
						x: (x + width / 2) * scale,
						y: (y + height / 2) * scale,
						value: count,
					}
				})
				.filter(Boolean) as unknown as {
				x: number
				y: number
				value: number
			}[]

			heatmapInstance.current?.setData({
				max: 10,
				min: 1,
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
					query: `event.url="*/${url}*" event.type=click event.relativeX EXISTS`,
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
			}}
		/>
	)
}

function queryXPath(doc: Document, xpathExpression: string) {
	const result = doc.evaluate(
		xpathExpression,
		doc,
		null,
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
		null,
	)

	const nodes = []
	for (let i = 0; i < result.snapshotLength; i++) {
		nodes.push(result.snapshotItem(i))
	}

	return nodes
}
