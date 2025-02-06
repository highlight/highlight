import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import dynamic from 'next/dynamic'
import CourseNavigation from './components/CourseNavigation'
import type { CourseVideo } from './types'
import { Typography } from '../../components/common/Typography/Typography'
import { otelCourse } from './styles.module.scss'
import { useState } from 'react'

const ClientSidePlayer = dynamic(() => import('./components/YouTubePlayer'), {
	ssr: false,
})

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
	slug,
}: {
	courseVideos: CourseVideo[]
	slug?: string
}) {
	const currentVideoId =
		courseVideos.find((v) => v.slug === slug)?.id ?? courseVideos[0].id!
	const currentLesson = courseVideos.find((video) => video.slug === slug)
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)

	return (
		<div className="min-h-screen bg-gray-50 text-black">
			<Head>
				<title>
					{`${courseVideos.find((v) => v.id === currentVideoId)?.title} | OpenTelemetry Course`}
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

			<div className="flex flex-col lg:flex-row h-screen">
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

								{!currentVideoId && (
									<div className="absolute inset-0 flex items-center justify-center bg-dark-background">
										<div className="text-center text-white">
											<Typography
												type="copy2"
												className="text-2xl lg:text-5xl mb-4 font-bold"
											>
												Coming Soon!
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
