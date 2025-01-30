import React from 'react'
import OTelCourse from './index'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { GetStaticProps, GetStaticPaths } from 'next'

// Define getStaticProps directly here
export const getStaticProps: GetStaticProps = async ({ params }) => {
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
				order: parseInt(filename.split('-')[0], 10),
				slug: data.slug,
			}
		}),
	)

	// Sort by order from filename
	courseVideos.sort((a, b) => a.order - b.order)

	return {
		props: {
			courseVideos,
			initialLessonId: params?.lessonId || null,
		},
	}
}

export const getStaticPaths: GetStaticPaths = async () => {
	const contentDirectory = path.join(
		process.cwd(),
		'pages/otel-course/content',
	)
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

// The page component
export default function LessonPage({
	initialLessonId,
	courseVideos,
}: {
	initialLessonId: string
	courseVideos: any[]
}) {
	return (
		<OTelCourse
			initialLessonId={initialLessonId}
			courseVideos={courseVideos}
		/>
	)
}
