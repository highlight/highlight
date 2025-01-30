'use client'

import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Typography } from '../../components/common/Typography/Typography'
import { LOCAL_STORAGE_KEY } from './signup'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'

type CourseVideo = {
	id: string | undefined
	title: string
	description: string
	order: number
	slug: string
}

type CourseVideoProgress = {
	videoId: string
	progress: number
	started: boolean
}

const PROGRESS_STORAGE_KEY = 'otel_course_progress'

declare global {
	interface Window {
		YT: typeof YT
		onYouTubeIframeAPIReady: () => void
	}
}

export const getFileOrder = (filename: string) => {
	const match = filename.match(/^(\d+)-/)
	return match ? parseInt(match[1], 10) : 0
}

export async function getStaticProps() {
	const contentDirectory = path.join(
		process.cwd(),
		'pages/otel-course/content',
	)
	const files = await fs.readdir(contentDirectory)

	const courseVideos = await Promise.all(
		files.map(async (filename) => {
			const filePath = path.join(contentDirectory, filename)
			const fileContents = await fs.readFile(filePath, 'utf8')
			const { data, content } = matter(fileContents)

			return {
				id: data.id,
				title: data.title,
				description: content.trim(),
				order: getFileOrder(filename),
				slug: data.slug,
			}
		}),
	)

	// Sort by order from filename
	courseVideos.sort((a, b) => a.order - b.order)

	return {
		props: {
			courseVideos,
		},
	}
}

export default function OTelCourse({
	courseVideos,
	initialLessonId,
}: {
	courseVideos: CourseVideo[]
	initialLessonId?: string
}) {
	const [isAuthorized, setIsAuthorized] = useState(false)
	const [currentVideo, setCurrentVideo] = useState<CourseVideo['id']>()
	const [currentSlug, setCurrentSlug] = useState<string | undefined>(
		initialLessonId,
	)
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
		// Load YouTube IFrame API
		const tag = document.createElement('script')
		tag.src = 'https://www.youtube.com/iframe_api'
		tag.async = true
		document.body.appendChild(tag)

		return () => {
			document.body.removeChild(tag)
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
				: courseVideos.map((video) => ({
						videoId: video.id,
						progress: 0,
						started: false,
					})),
		)
	}, [courseVideos])

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
			courseVideos.find((video) => video.id === currentVideo)
				?.description ?? '',
		)
	}, [currentVideo, courseVideos])

	// Set initial lesson when route changes
	useEffect(() => {
		if (initialLessonId) {
			setCurrentSlug(initialLessonId)
			const video = courseVideos.find((v) => v.slug === initialLessonId)
			// Only handle video if the lesson has one
			if (video?.id) {
				setCurrentVideo(video.id)
				if (player) {
					loadVideo(video.id)
				} else if (window.YT) {
					initializePlayer(video.id)
				}
			} else {
				setCurrentVideo(undefined)
				if (player) {
					setPlayer(null)
				}
			}
		}
	}, [initialLessonId, courseVideos])

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
		if (!videoId) return

		// Update URL when video changes
		const video = courseVideos.find((v) => v.id === videoId)
		if (video?.id) {
			router.push(`/otel-course/${video.slug}`, undefined, {
				shallow: true,
			})
			setCurrentSlug(video.slug)
			setCurrentVideo(video.id)

			if (!player) {
				initializePlayer(video.id)
			} else {
				loadVideo(video.id)
			}
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

	const getCurrentLesson = () => {
		return courseVideos.find((video) => video.slug === currentSlug)
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
				<title>
					{currentVideo
						? `${courseVideos.find((v) => v.id === currentVideo)?.title} | OpenTelemetry Course`
						: 'OpenTelemetry Course'}{' '}
					| Highlight.io
				</title>
				<meta
					name="description"
					content="Learn OpenTelemetry from the experts"
				/>
			</Head>

			<div className="flex h-screen">
				{/* Sidebar */}
				<div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
					<div className="p-6">
						<Link href="/otel-course" className="block">
							<Typography
								type="copy2"
								className="font-bold text-xl text-gray-800 mb-4"
							>
								Course Content
							</Typography>
						</Link>
					</div>
					<nav className="px-4 space-y-1">
						{courseVideos.map((video, videoIndex) => {
							const progress = findVideoProgress(video.id)
							const isActive = currentSlug === video.slug

							return (
								<Link
									key={`video-${videoIndex}`}
									href={`/otel-course/${video.slug}`}
									className={`block w-full text-left px-3 py-3 rounded-lg transition-colors relative overflow-hidden ${
										isActive
											? 'bg-blue-50 text-blue-700'
											: 'hover:bg-gray-50'
									}`}
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
								</Link>
							)
						})}
					</nav>
				</div>

				{/* Main Content */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-8">
						{/* Video Player - only show for lessons with video IDs */}
						{getCurrentLesson()?.id ? (
							<div
								className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden mb-8 relative"
								style={{ paddingBottom: '56.25%' }}
							>
								<div
									id="youtube-player"
									className="w-full h-full absolute top-0 left-0"
								></div>
							</div>
						) : currentSlug ? (
							<div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden mb-8 relative flex items-center justify-center">
								<div className="text-center text-white">
									<Typography type="copy2" className="mb-4">
										Video coming soon!
									</Typography>
								</div>
							</div>
						) : (
							<div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden mb-8 relative flex items-center justify-center">
								<div className="text-center text-white">
									<Typography type="copy2" className="mb-4">
										Select a lesson to start learning
									</Typography>
									{courseVideos[0]?.id && (
										<button
											className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
											onClick={() =>
												handleVideoClick(
													courseVideos[0].id,
												)
											}
										>
											Start First Video
										</button>
									)}
								</div>
							</div>
						)}

						{/* Lesson Content - show whenever a lesson is selected */}
						{currentSlug && (
							<div className="flex flex-col gap-4">
								<Typography
									type="copy2"
									className="text-2xl font-bold text-gray-900 mb-2"
								>
									{getCurrentLesson()?.title}
								</Typography>
								<div className="prose prose-sm max-w-none text-black">
									<ReactMarkdown
										components={{
											iframe: ({ node, ...props }) => (
												<iframe {...props} />
											),
										}}
										rehypePlugins={[rehypeRaw as any]}
									>
										{getCurrentLesson()?.description ?? ''}
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
