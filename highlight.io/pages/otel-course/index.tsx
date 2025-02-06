'use client'

import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Typography } from '../../components/common/Typography/Typography'
import { LOCAL_STORAGE_KEY } from './signup'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'

export type CourseVideo = {
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

const useYouTubePlayer = (
	videoId: string | undefined,
	onProgress: (progress: number) => void,
) => {
	const [player, setPlayer] = useState<YT.Player | null>(null)
	const [isAPIReady, setIsAPIReady] = useState(false)
	const clearProgressInterval = useRef<() => void>()

	// Load the YouTube API
	useEffect(() => {
		// Save the existing callback if any
		const existingCallback = window.onYouTubeIframeAPIReady

		const tag = document.createElement('script')
		tag.src = 'https://www.youtube.com/iframe_api'
		tag.async = true
		document.body.appendChild(tag)

		// Set up our callback
		window.onYouTubeIframeAPIReady = () => {
			setIsAPIReady(true)
			// Call the existing callback if there was one
			existingCallback?.()
		}

		return () => {
			if (player) {
				player.destroy()
				setPlayer(null)
			}
			document.body.removeChild(tag)
		}
	}, []) // Only run once on mount

	const startProgressTracking = useCallback(() => {
		const progressInterval = setInterval(() => {
			if (player?.getCurrentTime && player?.getDuration) {
				const currentTime = player.getCurrentTime()
				const duration = player.getDuration()
				const progress = Math.round((currentTime / duration) * 100)
				onProgress(progress)
			}
		}, 5000)

		return () => clearInterval(progressInterval)
	}, [onProgress])

	const onPlayerStateChange = useCallback(
		(event: YT.OnStateChangeEvent) => {
			if (event.data === window.YT.PlayerState.ENDED) {
				onProgress(100)
			} else if (event.data === window.YT.PlayerState.PLAYING) {
				clearProgressInterval.current = startProgressTracking()
			} else if (event.data === window.YT.PlayerState.PAUSED) {
				clearProgressInterval.current?.()
			}
		},
		[onProgress, startProgressTracking],
	)

	// Initialize player and handle video changes
	useEffect(() => {
		if (!isAPIReady || typeof window === 'undefined') return

		const setupPlayer = () => {
			if (!player) {
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
		}

		// Small delay to ensure DOM is ready
		const timeoutId = setTimeout(setupPlayer, 0)

		return () => {
			clearTimeout(timeoutId)
		}
	}, [isAPIReady])

	const loadVideo = useCallback(
		(videoId: string) => {
			if (player?.loadVideoById) {
				player.loadVideoById({ videoId })
			}
		},
		[player],
	)

	useEffect(() => {
		if (videoId) {
			loadVideo(videoId)
		}
	}, [videoId])

	return { player, loadVideo }
}

const useVideoProgress = (courseVideos: CourseVideo[]) => {
	const [videoProgressData, setVideoProgressData] = useState<
		CourseVideoProgress[]
	>([])

	useEffect(() => {
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
		localStorage.setItem(
			PROGRESS_STORAGE_KEY,
			JSON.stringify(videoProgressData),
		)
	}, [videoProgressData])

	const updateProgress = useCallback((videoId: string, progress: number) => {
		setVideoProgressData((prevData) =>
			prevData.map((video) =>
				video.videoId === videoId
					? { ...video, progress, started: true }
					: video,
			),
		)
	}, [])

	const findProgress = useCallback(
		(videoId: string | undefined) => {
			return (
				videoProgressData.find((vp) => vp.videoId === videoId) ?? {
					videoId,
					progress: 0,
					started: false,
				}
			)
		},
		[videoProgressData],
	)

	return { updateProgress, findProgress }
}

const useSignupToast = () => {
	const [showToast, setShowToast] = useState(false)
	const router = useRouter()

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

	return showToast
}

const useAuthorization = () => {
	const [isAuthorized, setIsAuthorized] = useState(false)
	const router = useRouter()

	useEffect(() => {
		const authorized = localStorage.getItem(LOCAL_STORAGE_KEY) === 'true'
		setIsAuthorized(true) // Currently always authorized as per commented code
		// if (!authorized && typeof window !== 'undefined') {
		//     router.push('/otel-course/signup')
		// } else {
		//     setIsAuthorized(true)
		// }
	}, [router])

	return isAuthorized
}

export default function OTelCourse({
	courseVideos,
	slug,
}: {
	courseVideos: CourseVideo[]
	slug?: string
}) {
	const currentVideoId =
		courseVideos.find((v) => v.slug === slug)?.id ?? courseVideos[0].id!

	const router = useRouter()
	useEffect(() => {
		if (!slug) {
			router.push(`/otel-course/${courseVideos[0].slug}`)
		}
	}, [slug, courseVideos, router])

	const showToast = useSignupToast()
	const isAuthorized = useAuthorization()

	const { updateProgress, findProgress } = useVideoProgress(courseVideos)

	const { loadVideo } = useYouTubePlayer(
		currentVideoId,
		(progress: number) => {
			if (currentVideoId) {
				updateProgress(currentVideoId, progress)
			}
		},
	)

	useEffect(() => {
		if (currentVideoId) {
			loadVideo(currentVideoId)
		}
	}, [currentVideoId, loadVideo])

	const currentLesson = useMemo(() => {
		return courseVideos.find((video) => video.slug === slug)
	}, [slug])

	if (!isAuthorized) {
		return null
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
					{currentVideoId
						? `${courseVideos.find((v) => v.id === currentVideoId)?.title} | OpenTelemetry Course`
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
							const progress = findProgress(video.id)
							const isActive = slug === video.slug

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
					<div className="p-8 max-w-[1600px] mx-auto w-full">
						<div className="relative w-full pb-[56.25%]">
							<div className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden">
								<div
									id="youtube-player"
									className="w-full h-full"
								></div>

								{/* IF video unavailable, show a message */}
								{currentVideoId === 'undefined' && (
									<div className="absolute inset-0 flex items-center justify-center bg-dark-background">
										<div className="text-center text-white">
											<Typography
												type="copy2"
												className="text-2xl mb-4"
											>
												Video unavailable
											</Typography>
										</div>
									</div>
								)}
							</div>
						</div>

						<div>
							<h1>{currentLesson?.title}</h1>
							<div className="prose prose-sm max-w-none text-black">
								<ReactMarkdown
									components={{
										iframe: ({ node, ...props }) => (
											<iframe {...props} />
										),
									}}
									rehypePlugins={[rehypeRaw as any]}
								>
									{currentLesson?.description ?? ''}
								</ReactMarkdown>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
