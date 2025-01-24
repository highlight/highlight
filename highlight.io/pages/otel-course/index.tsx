'use client'

import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Typography } from '../../components/common/Typography/Typography'
import { LOCAL_STORAGE_KEY } from './signup'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

type CourseVideo = {
	id: string | undefined
	title: string
	description: string
}

type CourseVideoProgress = {
	videoId: string
	progress: number
	started: boolean
}

const PROGRESS_STORAGE_KEY = 'otel_course_progress'

const COURSE_VIDEOS: CourseVideo[] = [
	{
		id: '_FGwkiR_XFM',
		title: 'Introduction to Observability and OpenTelemetry',
		description:
			'Overview of Observability and the importance of monitoring. Introduces OpenTelemetry as a unified standard for distributed tracing, metrics, and logging.',
	},
	{
		id: 'biloVamYVVA',
		title: 'Architecture and Components of OpenTelemetry',
		description: `Covers OpenTelemetry's core components and architecture, including the SDK, API, and the role of the OpenTelemetry Collector in the observability pipeline.`,
	},
	{
		id: 'G9yadsMgzu0',
		title: 'Setting up the Collector',
		description:
			'Learn how to set up the OpenTelemetry Collector to receive and process telemetry data from your applications.',
	},
	{
		id: 'G9yadsMgzuasd0',
		title: 'OpenTelemetry Logging',
		description: `
Learn about structured logging and how to integrate logging with OpenTelemetry, collecting and exporting logs to various backend systems for analysis.

<iframe src="https://codesandbox.io/embed/g2k8zm?view=editor+%2B+preview&module=%2Fsrc%2Findex.mjs&hidenavigation=1&expanddevtools=1"
style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
title="opentelemetry-logs-console-exporter"
allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

Another paragraph.
			`,
	},
	{
		id: undefined,
		title: 'OpenTelemetry Tracing',
		description:
			'Introduction to distributed tracing with OpenTelemetry. Learn how to instrument applications for tracing across different languages, and how to export trace data to observability platforms.',
	},
	{
		id: undefined,
		title: 'OpenTelemetry Metrics',
		description:
			'Focuses on metrics collection and exporting, explaining different types of metrics (counters, gauges, histograms) and how to use OpenTelemetry to monitor application performance.',
	},
	{
		id: undefined,
		title: 'OpenTelemetry Collector and Processors',
		description:
			'A deep dive into the OpenTelemetry Collector, its setup, and how to configure processors and exporters to tailor data pipelines for different observability needs.',
	},
	{
		id: undefined,
		title: 'OpenTelemetry in Real-world Scenarios',
		description:
			'Explore practical examples of OpenTelemetry in action within microservices, cloud environments (AWS, Google Cloud, Azure), and Kubernetes, showcasing real-world use cases.',
	},
	{
		id: undefined,
		title: 'Best Practices and Performance Considerations',
		description:
			'Guidelines for performance optimization when using OpenTelemetry, avoiding overhead, and securing data collection pipelines to maintain privacy and compliance.',
	},
	{
		id: undefined,
		title: 'Advanced Topics and the Future of OpenTelemetry',
		description:
			'Explore advanced custom instrumentation, monitoring for AI/ML applications, and the future trends of OpenTelemetry in observability and beyond.',
	},
]

export default function OTelCourse() {
	const [isAuthorized, setIsAuthorized] = useState(false)
	const [currentVideo, setCurrentVideo] = useState<CourseVideo['id']>()
	const [videoProgressData, setVideoProgressData] = useState<
		CourseVideoProgress[]
	>([])
	const router = useRouter()
	const [player, setPlayer] = useState<YT.Player | null>(null)

	const [showToast, setShowToast] = useState(false)

	useEffect(() => {
		// Check if user is authorized (e.g., by checking a cookie or local storage)
		const checkAuthorization = () => {
			// This is a placeholder. Replace with your actual authorization check
			const authorized =
				localStorage.getItem(LOCAL_STORAGE_KEY) === 'true'

			// if (!authorized && typeof window !== 'undefined') {
			// 	router.push('/otel-course/signup')
			// } else {
			setIsAuthorized(true)
			// }
		}

		checkAuthorization()
	}, [router])

	useEffect(() => {
		// Save progress data to localStorage whenever it changes
		localStorage.setItem(
			PROGRESS_STORAGE_KEY,
			JSON.stringify(videoProgressData),
		)
	}, [videoProgressData])

	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://www.youtube.com/iframe_api'
		script.async = true

		document.body.appendChild(script)

		return () => {
			document.body.removeChild(script)
		}
	}, [])

	useEffect(() => {
		// Initialize videoProgressData from localStorage or default values
		const storedProgress =
			typeof window !== 'undefined'
				? localStorage.getItem(PROGRESS_STORAGE_KEY)
				: null
		const storedProgressJson = storedProgress
			? JSON.parse(storedProgress)
			: null

		setVideoProgressData(
			storedProgressJson && storedProgressJson.length > 0
				? storedProgressJson
				: COURSE_VIDEOS.map((video) => ({
						videoId: video.id,
						progress: 0,
						started: false,
					})),
		)
	}, [])

	useEffect(() => {
		const signedup = new URLSearchParams(window.location.search).get(
			'signedup',
		)

		if (signedup) {
			setShowToast(true)
			const timer = setTimeout(() => {
				setShowToast(false)
				history.replaceState({}, '', window.location.pathname)
			}, 4000)

			return () => clearTimeout(timer)
		} else {
			setShowToast(false)
		}
	}, [router])

	useEffect(() => {
		console.log(
			COURSE_VIDEOS.find((video) => video.id === currentVideo)
				?.description ?? '',
		)
	}, [currentVideo])

	const initializePlayer = (videoId: string | undefined) => {
		if (!videoId) return

		const newPlayer = new window.YT.Player('youtube-player', {
			width: '100%',
			videoId,
			playerVars: {
				autoplay: 1,
				rel: 0,
			},
			events: {
				onStateChange: onPlayerStateChange,
			},
		})

		setPlayer(newPlayer)
	}

	const clearProgressInterval = useRef<() => void>()
	const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
		if (event.data === window.YT.PlayerState.ENDED) {
			updateVideoProgress(currentVideo!, 100)
		} else if (event.data === window.YT.PlayerState.PLAYING) {
			clearProgressInterval.current = startProgressTracking()
		} else if (event.data === window.YT.PlayerState.PAUSED) {
			clearProgressInterval.current?.()
		}
	}

	const startProgressTracking = () => {
		const progressInterval = setInterval(() => {
			// Use a callback to get the latest player state
			setPlayer((currentPlayer) => {
				if (
					currentPlayer &&
					currentPlayer.getCurrentTime &&
					currentPlayer.getDuration
				) {
					const currentTime = currentPlayer.getCurrentTime()
					const duration = currentPlayer.getDuration()
					const progress = Math.round((currentTime / duration) * 100)

					setCurrentVideo((prevCurrentVideo) => {
						updateVideoProgress(prevCurrentVideo!, progress)
						return prevCurrentVideo
					})
				}
				return currentPlayer // Return the current player to not change the state
			})
		}, 5000)

		return () => clearInterval(progressInterval as any)
	}

	const loadVideo = (videoId: string | undefined) => {
		if (!videoId) return

		if (player && player.loadVideoById) {
			player.loadVideoById(videoId)
			setCurrentVideo(videoId)
		}
	}

	const handleVideoClick = (videoId: string | undefined) => {
		if (!player) {
			initializePlayer(videoId)
			setCurrentVideo(videoId)
		} else {
			loadVideo(videoId)
		}
	}

	const updateVideoProgress = (videoId: string, progress: number) => {
		setVideoProgressData((prevVideoProgressData) =>
			prevVideoProgressData.map((video) =>
				video.videoId === videoId
					? { ...video, progress, started: true }
					: video,
			),
		)
	}

	if (!isAuthorized) {
		return null
	}

	const findVideoProgress = (videoId: string | undefined) => {
		return (
			videoProgressData.find((vp) => vp.videoId === videoId) ?? {
				videoId,
				progress: 0,
				started: false,
			}
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 otel-course">
			{showToast && (
				<div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 flex items-center space-x-2 z-50">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span>Successfully signed up!</span>
				</div>
			)}

			<Head>
				<title>OpenTelemetry Course | Highlight.io</title>
				<meta
					name="description"
					content="Learn OpenTelemetry from the experts"
				/>
			</Head>

			<div className="flex h-screen">
				{/* Sidebar */}
				<div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
					<div className="p-6">
						<Typography
							type="copy2"
							className="font-bold text-xl text-gray-800 mb-4"
						>
							Course Content
						</Typography>
					</div>
					<nav className="px-4 space-y-1">
						{COURSE_VIDEOS.map((video, videoIndex) => {
							const progress = findVideoProgress(video.id)
							return (
								<button
									key={`video-${videoIndex}`}
									className={`w-full text-left px-3 py-3 rounded-lg transition-colors relative overflow-hidden ${
										currentVideo &&
										currentVideo === video.id
											? 'bg-blue-50 text-blue-700'
											: 'hover:bg-gray-50'
									}`}
									onClick={() => handleVideoClick(video.id)}
									style={{
										background: progress.started
											? `linear-gradient(to right, rgba(219, 234, 254, 0.75) ${progress.progress}%, transparent ${progress.progress}%)`
											: undefined,
									}}
								>
									<div className="flex items-start gap-3 flex-col">
										<div className="flex-1">
											<Typography
												type="copy3"
												className="font-medium text-gray-900"
											>
												{video.title}
											</Typography>
										</div>
										{!video.id && (
											<span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded shrink-0">
												Coming Soon
											</span>
										)}
									</div>
								</button>
							)
						})}
					</nav>
				</div>

				{/* Main Content */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-8">
						{/* Video Player */}
						<div
							className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden mb-8 relative"
							style={{ paddingBottom: '56.25%' }}
						>
							<div
								id="youtube-player"
								className="w-full h-full absolute top-0 left-0"
							></div>
							{!currentVideo && (
								<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
									<div className="text-center text-white flex flex-col items-center justify-center">
										<Typography
											type="copy2"
											className="mb-4"
										>
											Select a video to start learning
										</Typography>
										<button
											className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
											onClick={() => {
												if (COURSE_VIDEOS[0].id) {
													handleVideoClick(
														COURSE_VIDEOS[0].id,
													)
												}
											}}
										>
											Start First Video
										</button>
									</div>
								</div>
							)}
						</div>

						{/* Video Content */}
						{currentVideo && (
							<div className="flex flex-col gap-4">
								<Typography
									type="copy2"
									className="text-2xl font-bold text-gray-900 mb-2"
								>
									{
										COURSE_VIDEOS.find(
											(video) =>
												video.id === currentVideo,
										)?.title
									}
								</Typography>
								<div className="prose prose-sm max-w-none text-black">
									<ReactMarkdown
										components={{
											iframe: ({ node, ...props }) => (
												<iframe {...props} />
											),
										}}
										// Required for iframes to render
										rehypePlugins={[rehypeRaw as any]}
									>
										{COURSE_VIDEOS.find(
											(video) =>
												video.id === currentVideo,
										)?.description ?? ''}
									</ReactMarkdown>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
