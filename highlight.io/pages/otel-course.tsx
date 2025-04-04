'use client'

import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Typography } from '../components/common/Typography/Typography'
import { LOCAL_STORAGE_KEY } from './otel-course-signup'

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
		description:
			'Covers OpenTelemetry’s core components and architecture, including the SDK, API, and the role of the OpenTelemetry Collector in the observability pipeline.',
	},
	{
		id: 'G9yadsMgzu0',
		title: 'Setting up the Collector',
		description:
			'Learn how to set up the OpenTelemetry Collector to receive and process telemetry data from your applications.',
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
		title: 'OpenTelemetry Logging',
		description:
			'Learn about structured logging and how to integrate logging with OpenTelemetry, collecting and exporting logs to various backend systems for analysis.',
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
		title: 'Advanced Topics and Future of OpenTelemetry',
		description:
			'Explore advanced custom instrumentation, monitoring for AI/ML applications, and the future trends of OpenTelemetry in observability and beyond.',
	},
]

export default function OTelCourse() {
	const [isAuthorized, setIsAuthorized] = useState(false)
	const [currentVideo, setCurrentVideo] = useState<string | null>(null)
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

			if (!authorized && typeof window !== 'undefined') {
				router.push('/otel-course-signup')
			} else {
				setIsAuthorized(true)
			}
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

	const initializePlayer = (videoId: string) => {
		const newPlayer = new window.YT.Player('youtube-player', {
			height: 558,
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

	const clearProgressInterval = useRef<() => void>(undefined)
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

	const loadVideo = (videoId: string) => {
		if (player && player.loadVideoById) {
			player.loadVideoById(videoId)
			setCurrentVideo(videoId)
		}
	}

	const handleVideoClick = (videoId: string) => {
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

	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			{showToast && (
				<div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 flex items-center space-x-2">
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

			<div className="text-center mb-8">
				<Typography type="copyHeader" className="mb-6">
					Your Path to Becoming an OpenTelemetry Expert
				</Typography>
			</div>

			<div className="mb-8">
				<div className="aspect-w-16 aspect-h-9 h-[558px] flex items-center justify-center relative">
					<div id="youtube-player" className="w-full h-full"></div>
					{!currentVideo && (
						<div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-black bg-opacity-40">
							<div className="text-center">
								<Typography type="copy2" className="mb-4">
									Select a video to start learning
								</Typography>
								<br />
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
			</div>

			<div className="grid grid-cols-1 gap-8">
				{COURSE_VIDEOS.map((video, index) => {
					const videoProgress = videoProgressData.find(
						(vp) => vp.videoId === video.id,
					) ?? {
						videoId: video.id,
						progress: 0,
						started: false,
					}

					return (
						<div
							key={`${video.id}-${index}`}
							className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-shadow duration-300"
						>
							<div className="relative w-full md:w-1/3">
								<div className="w-full h-48 md:h-full relative">
									{video.id ? (
										<Image
											src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
											alt={video.title}
											fill
											className="object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gray-200">
											<Typography
												type="copy2"
												className="text-gray-500"
											>
												Coming Soon
											</Typography>
										</div>
									)}
									<div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
										<button
											className="bg-red-600 text-white rounded-full p-3 hover:bg-red-700 transition-colors transform hover:scale-110 duration-300"
											onClick={() => {
												if (video.id) {
													handleVideoClick(video.id)
												}
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-8 w-8"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</div>
								</div>
							</div>
							<div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
								<div>
									<Typography
										type="copy2"
										className="font-bold text-xl mb-2 text-gray-800"
									>
										{video.title}
									</Typography>
									<br />
									<Typography
										type="copy3"
										className="text-gray-600 mb-4"
									>
										{video.description}
									</Typography>
								</div>
								<div className="mt-4">
									<div className="w-full bg-gray-200 rounded-full h-2 mb-2">
										<div
											className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
											style={{
												width: `${videoProgress.progress}%`,
											}}
										></div>
									</div>
									<Typography
										type="copy3"
										className={`${
											videoProgress.started
												? 'text-green-600'
												: 'text-gray-500'
										} font-semibold`}
									>
										{videoProgress.started
											? `${videoProgress.progress}% complete`
											: 'Not started'}
									</Typography>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
