import {
	Box,
	ButtonIcon,
	Form,
	IconSolidXCircle,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import * as heatmap from 'heatmap.js'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { BooleanParam, useQueryParam } from 'use-query-params'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useGetTracesLazyQuery } from '@/graph/generated/hooks'
import { SortDirection } from '@/graph/generated/schemas'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'
import LoadingBox from '@/components/LoadingBox'

type HeatmapData = {
	x: number
	y: number
	value: number
}[]

export const PlayerHeatmapCanvas: React.FC = () => {
	const { projectId } = useNumericProjectId()
	const [showHeatmap, setShowHeatmap] = useQueryParam('heatmap', BooleanParam)
	const { currentUrl, replayer, viewport } = useReplayerContext()
	const snapshotIframeRef = useRef<HTMLIFrameElement>(null)
	const backgroundRef = useRef<HTMLDivElement>(null)
	const [heatmapData, setHeatmapData] = useState<HeatmapData>([])
	const [loading, setLoading] = useState(false)
	const [url, setUrl] = useState<string>(currentUrl ?? '')

	const [tracesQuery] = useGetTracesLazyQuery()

	useEffect(() => {
		// TODO: Make more generic
		setUrl(`/` + currentUrl?.split('?')[0].split('/')[4] ?? '')
	}, [currentUrl])

	useEffect(() => {
		if (!url || !showHeatmap) {
			return
		}

		setLoading(true)

		tracesQuery({
			variables: {
				project_id: projectId!,
				direction: SortDirection.Desc,
				params: {
					query: `event.url="*${url}*" event.type=click event.relativeX EXISTS`,
					date_range: {
						start_date: moment()
							.subtract(7, 'days')
							.format(TIME_FORMAT),
						end_date: moment().format(TIME_FORMAT),
					},
				},
			},
			onCompleted: (data) => {
				setHeatmapData([])

				let max = 0
				const elementClicks = data.traces.edges.reduce((acc, trace) => {
					const event = trace.node.traceAttributes?.event
					const hash = eventHash(event)

					if (hash) {
						acc[hash] = acc[hash]
							? { ...acc[hash], count: acc[hash].count + 1 }
							: { event, count: 1 }

						if (acc[hash].count > max) {
							max = acc[hash].count
						}
					}

					return acc
				}, {} as { [key: string]: { event: Event; count: number } })

				const iframe = replayer?.wrapper.querySelector('iframe')
				if (!iframe?.contentDocument) {
					return
				}

				const html = iframe.contentDocument.documentElement.outerHTML
				const snapshotIframe = snapshotIframeRef.current
				if (snapshotIframe?.contentDocument) {
					snapshotIframe.contentDocument.open()
					snapshotIframe.contentDocument.write(html)
					snapshotIframe.contentDocument.close()
				}

				const newHeatmapData = Object.entries(elementClicks)
					.map(([event, eventData]) => {
						const [xpath, innerText] = event.split('::')
						const element = queryXPath(
							snapshotIframe!.contentDocument!,
							xpath,
							innerText,
						) as HTMLElement

						if (!element) {
							return
						}

						const { x, y, width, height } =
							element.getBoundingClientRect()

						return {
							x: x + width / 2,
							y: y + height / 2,
							value: eventData.count,
						}
					})
					.filter(Boolean) as unknown as HeatmapData

				setHeatmapData(newHeatmapData)
				setLoading(false)
			},
		})

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showHeatmap, url])

	if (!showHeatmap) {
		return null
	}

	const viewportWidth = viewport?.width ?? 0
	const viewportHeight = viewport?.height ?? 0
	const { width } = backgroundRef.current?.getBoundingClientRect() ?? {
		height: 0,
		width: 0,
	}
	const canvasWidth = width - 48
	const scale = canvasWidth / viewportWidth

	return (
		<Box
			backgroundColor="white"
			ref={backgroundRef}
			position="absolute"
			px="24"
			pb="24"
			style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
		>
			<ButtonIcon
				icon={<IconSolidXCircle />}
				onClick={() => setShowHeatmap(undefined)}
				emphasis="low"
				kind="secondary"
				style={{
					position: 'absolute',
					top: 10,
					right: 24,
				}}
			/>

			<Stack py="10" gap="8" direction="row" alignItems="center">
				<Text>Showing heatmap for</Text>
				<Form>
					<Form.Input
						name="url"
						defaultValue={url}
						onBlur={(e) => setUrl(e.target.value)}
					/>
				</Form>
			</Stack>

			<Box position="relative" height="full" width="full">
				{loading ? (
					<LoadingBox />
				) : (
					<Heatmap
						data={heatmapData}
						height={viewportHeight}
						width={viewportWidth}
						scale={scale}
					/>
				)}
				<iframe
					ref={snapshotIframeRef}
					style={{
						display: 'block',
						position: 'absolute',
						height: viewportHeight,
						width: viewportWidth,
						transform: `scale(${scale})`,
						transformOrigin: 'top left',
					}}
				/>
			</Box>
		</Box>
	)
}

const Heatmap: React.FC<{
	data: HeatmapData
	height: number
	width: number
	scale: number
}> = ({ data, height, width, scale }) => {
	const canvasRef = useRef<HTMLDivElement>(null)
	const heatmapInstance = useRef<heatmap.Heatmap<string, string, string>>()

	useEffect(() => {
		if (!heatmapInstance.current && canvasRef.current) {
			heatmapInstance.current = heatmap.create({
				backgroundColor: 'rgba(0, 0, 0, 0.05)',
				container: canvasRef.current,
				gradient: {
					0: 'rgba(45.5%, 30.6%, 83.1%, 0)',
					1: '#744ed4',
				},
			})

			heatmapInstance.current.setData({
				max: 10,
				min: 1,
				data,
			})

			canvasRef.current.style.position = 'absolute'
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvasRef.current])

	return (
		<div
			ref={canvasRef}
			id="heatmap-canvas"
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				height,
				width,
				transform: `scale(${scale})`,
				transformOrigin: 'top left',
			}}
		/>
	)
}

function queryXPath(doc: Document, xpathExpression: string, innerText: string) {
	const result = doc.evaluate(
		xpathExpression,
		doc,
		null,
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
		null,
	)

	for (let i = 0; i < result.snapshotLength; i++) {
		const node = result.snapshotItem(i) as HTMLElement
		if (node && String(node.innerText) === String(innerText)) {
			return node
		}
	}

	return result.snapshotItem(0)
}

type Event = {
	xpath: string
	tag: string
	text?: string
	id?: string
}

function eventHash(event: Event) {
	if (!event.xpath) {
		return
	}

	return `${event.xpath}::${event.text ?? ''}`
}
