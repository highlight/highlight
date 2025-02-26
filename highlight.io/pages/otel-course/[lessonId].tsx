import React, { useState } from 'react'
import { CourseVideo } from '../../otel-course/types'
import rehypeRaw from 'rehype-raw'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import CourseNavigation from '../../otel-course/components/CourseNavigation'
import { Typography } from '../../components/common/Typography/Typography'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { OTEL_COURSE_LOCAL_STORAGE_KEY } from '../../otel-course/hooks'
import { otelCourse } from '../../otel-course/styles.module.scss'

const ClientSidePlayer = dynamic(
	() => import('../../otel-course/components/YouTubePlayer'),
	{
		ssr: false,
	},
)

const HubspotForm = dynamic(
	() => import('../../otel-course/components/HubspotForm'),
	{
		ssr: false,
	},
)

// Define getStaticProps directly here
export const getStaticProps: GetStaticProps = async ({ params }) => {
	const contentDirectory = path.join(process.cwd(), 'otel-course/content')
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
				order: parseInt(filename.split('-')[0], 10),
				slug: data.slug,
				free: data.free,
			}
		}),
	)

	// Sort by order from filename
	courseVideos.sort((a, b) => a.order - b.order)

	return {
		props: {
			courseVideos,
			slug: params?.lessonId || null,
		},
	}
}

export const getStaticPaths: GetStaticPaths = async () => {
	const contentDirectory = path.join(process.cwd(), 'otel-course/content')
	const files = await fs.readdir(contentDirectory)

	// Read each file to get its slug from frontmatter
	const paths = await Promise.all(
		files.map(async (filename) => {
			const filePath = path.join(contentDirectory, filename)
			const fileContents = await fs.readFile(filePath, 'utf8')
			const { data } = matter(fileContents)
			return {
				params: { lessonId: data.slug },
			}
		}),
	)

	return {
		paths,
		fallback: false,
	}
}

export default function LessonPage({
	slug,
	courseVideos,
}: {
	slug: string
	courseVideos: CourseVideo[]
}) {
	const [isRegistered, setIsRegistered] = useState(false)
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)

	const currentLesson = courseVideos.find((video) => video.slug === slug)
	const currentVideoId = currentLesson?.id ?? courseVideos[0].id!
	const isLessonFree = currentLesson?.free ?? false
	const shouldShowVideo = isLessonFree || isRegistered

	const handleRegistrationSuccess = () => {
		setIsRegistered(true)
		// You might want to store this in localStorage/cookies to persist across page loads
		localStorage.setItem(OTEL_COURSE_LOCAL_STORAGE_KEY, 'true')
	}

	React.useEffect(() => {
		const registered = localStorage.getItem(OTEL_COURSE_LOCAL_STORAGE_KEY)
		if (registered) {
			setIsRegistered(true)
		}
	}, [])

	return (
		<div className="min-h-screen bg-gray-50 text-black">
			<Head>
				<title>
					{`${currentLesson?.title} | OpenTelemetry Course`}
				</title>
				<meta
					name="description"
					content={
						currentLesson?.description ??
						'Learn OpenTelemetry from the experts'
					}
				/>
			</Head>

			{/* Mobile Menu Button */}
			<button
				onClick={() => setIsSidebarOpen(!isSidebarOpen)}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
				aria-label="Toggle menu"
			>
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					{isSidebarOpen ? (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					) : (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					)}
				</svg>
			</button>

			<div className={`flex flex-col lg:flex-row h-screen`}>
				{/* Sidebar - hidden on mobile by default */}
				<div
					className={`fixed lg:relative lg:flex w-80 bg-white border-r border-gray-200 h-screen transition-transform duration-300 ease-in-out z-40 ${
						isSidebarOpen
							? 'translate-x-0'
							: '-translate-x-full lg:translate-x-0'
					}`}
				>
					<CourseNavigation
						courseVideos={courseVideos}
						currentSlug={slug}
						onNavigate={() => setIsSidebarOpen(false)}
					/>
				</div>

				{/* Overlay for mobile */}
				{isSidebarOpen && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
						onClick={() => setIsSidebarOpen(false)}
					/>
				)}

				{/* Main Content */}
				<div className="flex-1 overflow-y-auto w-full lg:w-auto pt-16 lg:pt-0">
					<div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
						<div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden">
							<div className="absolute inset-0 bg-gray-900">
								<ClientSidePlayer videoId={currentVideoId} />
								{!shouldShowVideo && (
									<div className="absolute inset-0 flex items-center justify-center bg-dark-background">
										<div className="max-w-lg w-full mx-4">
											<div className="bg-white p-4 pb-0 rounded-lg shadow-lg flex flex-col">
												{currentVideoId ===
												'undefined' ? (
													<>
														<Typography
															type="copy2"
															className="text-xl mb-2 font-bold text-center"
														>
															Coming Soon!
														</Typography>
														<Typography
															type="copy3"
															className="mb-4 text-center"
														>
															Register to stay
															updated when this
															lesson is released.
														</Typography>
													</>
												) : (
													<>
														<Typography
															type="copy2"
															className="text-xl mb-2 font-bold text-center"
														>
															Register to Access
															This Lesson
														</Typography>
														<Typography
															type="copy3"
															className="mb-4 text-center"
														>
															This lesson is part
															of our premium
															content. Please
															register to continue
															watching.
														</Typography>
													</>
												)}

												<HubspotForm
													onSuccess={
														handleRegistrationSuccess
													}
												/>
											</div>
										</div>
									</div>
								)}

								{shouldShowVideo &&
									currentVideoId === 'undefined' && (
										<div className="absolute inset-0 flex items-center justify-center bg-dark-background">
											<div className="text-center text-white flex flex-col items-center">
												<Typography
													type="copy2"
													className="text-2xl lg:text-5xl mb-4 font-bold"
												>
													Coming Soon!
												</Typography>
												<Typography
													type="copy2"
													className="mb-4 text-center"
												>
													Stay tuned for the next
													lesson!
												</Typography>
											</div>
										</div>
									)}
							</div>
						</div>

						<div className={`${otelCourse} mt-6 lg:mt-8`}>
							<h1 className="text-2xl lg:text-3xl font-bold mb-4">
								{currentLesson?.title}
							</h1>
							<div className="prose prose-sm lg:prose-base max-w-none text-black">
								<ReactMarkdown
									components={{
										iframe: ({ node, ...props }) => (
											<iframe
												className="w-full"
												{...props}
											/>
										),
									}}
									rehypePlugins={[
										rehypeRaw as any,
										remarkGfm as any,
									]}
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
