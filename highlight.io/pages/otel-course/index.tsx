import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import { CourseVideo } from '../../otel-course/types'
import { Typography } from '../../components/common/Typography/Typography'
import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import { HiCheckCircle, HiPlay } from 'react-icons/hi'

export const getFileOrder = (filename: string) => {
	const match = filename.match(/^(\d+)-/)
	return match ? parseInt(match[1], 10) : 0
}

export async function getStaticProps() {
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
				description: data.description.trim(),
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
}: {
	courseVideos: CourseVideo[]
}) {
	return (
		<div className="min-h-screen bg-white">
			<Head>
				<title>Master OpenTelemetry: Free Course by Highlight.io</title>
				<meta
					name="description"
					content="Master the industry-leading observability framework in our free, comprehensive course. From novice to expert with practical, hands-on learning."
				/>
			</Head>

			{/* Hero Section */}
			<div className="bg-gradient-to-b from-[#0d0225] to-[#1a0f3c] text-white py-24">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-10">
							Unlock the Power of OpenTelemetry
						</h1>
						<Typography
							type="copy2"
							className="text-gray-300 max-w-2xl mx-auto mb-8"
						>
							Master the industry-leading observability framework
							in our free, comprehensive course. Perfect for
							developers looking to go from novice to expert with
							practical, hands-on learning.
						</Typography>
						<div className="flex justify-center mt-12">
							<PrimaryButton
								href={`/otel-course/${courseVideos[0]?.slug}`}
							>
								<div className="flex items-center gap-2">
									<HiPlay className="w-5 h-5" />
									<span>Get Started</span>
								</div>
							</PrimaryButton>
						</div>
					</div>
				</div>
			</div>

			{/* What You'll Get Section */}
			<div className="py-20 bg-gray-50">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Typography
							type="copy2"
							emphasis
							className="text-blue-600 mb-2"
						>
							What You&apos;ll Get
						</Typography>
						<h2 className="text-3xl font-bold mb-4 text-gray-800">
							Everything You Need to Master OpenTelemetry
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								title: 'OpenTelemetry Fundamentals',
								description:
									'Grasp the core concepts and architecture of OpenTelemetry',
							},
							{
								title: 'Instrumentation Techniques',
								description:
									'Learn how to effectively instrument your applications',
							},
							{
								title: 'Data Analysis & Visualization',
								description:
									'Master the art of analyzing and visualizing telemetry data',
							},
							{
								title: 'Real-World Case Studies',
								description:
									'Explore real-world case studies and best practices for implementation',
							},
							{
								title: 'Advanced Topics',
								description:
									'Dive into advanced topics such as distributed tracing and service mesh',
							},
							{
								title: 'Project-Based Learning',
								description:
									'Solidify knowledge with real-world projects and exercises',
							},
						].map((feature, index) => (
							<div
								key={index}
								className="bg-white p-6 rounded-xl shadow-sm flex flex-col"
							>
								<div className="flex items-center gap-3 mb-3">
									<div className="w-5 h-5 text-blue-500">
										<HiCheckCircle className="w-full h-full" />
									</div>
									<Typography
										type="copy2"
										emphasis
										className="text-black"
									>
										{feature.title}
									</Typography>
								</div>
								<Typography
									type="copy3"
									className="text-gray-600"
								>
									{feature.description}
								</Typography>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Course Content */}
			<div className="py-20">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<Typography
							type="copy2"
							emphasis
							className="text-blue-600 mb-2"
						>
							Free Course Preview
						</Typography>
						<h2 className="text-3xl font-bold mb-4 text-gray-800">
							Get a Sneak Peek at What You&apos;ll Learn
						</h2>
						<Typography
							type="copy3"
							className="text-gray-600 max-w-2xl mx-auto"
						>
							Our expert video course covers everything from
							basics to advanced topics, with free updates forever
						</Typography>
					</div>

					<div className="space-y-4">
						{courseVideos.map((video, index) => (
							<Link
								href={`/otel-course/${video.slug}`}
								key={index}
								className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors"
							>
								<div className="flex items-start gap-4">
									<div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
										<span className="text-blue-600 font-semibold">
											{index + 1}
										</span>
									</div>
									<div>
										<Typography
											type="copy2"
											emphasis
											className="text-gray-900 mb-1"
										>
											{video.title}
										</Typography>
										<Typography
											type="copy3"
											className="text-gray-600 line-clamp-2"
										>
											{video.description}
										</Typography>
									</div>
									{!video.id && (
										<span className="ml-auto px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
											Coming Soon
										</span>
									)}
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-[#0d0225] text-white py-20">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<Typography
						type="copy2"
						emphasis
						className="text-blue-400 mb-4"
					>
						Ready to Master OpenTelemetry?
					</Typography>
					<h2 className="text-3xl sm:text-4xl font-bold mb-6">
						Take Your First Step Towards Becoming an Observability
						Expert
					</h2>
					<Typography
						type="copy2"
						className="text-gray-300 mb-8 max-w-2xl mx-auto"
					>
						Get started for free and become an observability
						superhero by the end of the course.
					</Typography>
					<div className="flex justify-center max-w-sm mx-auto my-12">
						<PrimaryButton
							href={`/otel-course/${courseVideos[0]?.slug}`}
							className="flex items-center gap-2"
						>
							<HiPlay className="w-5 h-5" />
							<span>Enroll Now - It&apos;s Free!</span>
						</PrimaryButton>
					</div>
					<Typography type="copy4" className="text-gray-400 mt-8">
						💜 Brought to you for free as a labor of love by the
						team at{' '}
						<Link href="https://highlight.io">Highlight.io</Link> 💜
					</Typography>
				</div>
			</div>
		</div>
	)
}
