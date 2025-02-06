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

			<div className="flex h-screen">
				<CourseNavigation
					courseVideos={courseVideos}
					currentSlug={slug}
				/>

				{/* Main Content */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-8 max-w-[1600px] mx-auto w-full">
						<div className="relative w-full pb-[56.25%]">
							<div className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden">
								<ClientSidePlayer videoId={currentVideoId} />

								{!currentVideoId && (
									<div className="absolute inset-0 flex items-center justify-center bg-dark-background">
										<div className="text-center text-white">
											<Typography
												type="copy2"
												className="text-5xl mb-4 font-bold"
											>
												Coming Soon!
											</Typography>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className={otelCourse}>
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
