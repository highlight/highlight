import Head from 'next/head'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { useRouter } from 'next/router'
import type { CourseVideo } from './types'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export const OTEL_COURSE_LOCAL_STORAGE_KEY = 'otelCourseAuthorized'

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
}: {
	courseVideos: CourseVideo[]
}) {
	const router = useRouter()

	useEffect(() => {
		const script = document.createElement('script')
		script.src = '//js.hsforms.net/forms/embed/v2.js'
		script.async = true
		script.onload = () => {
			// @ts-ignore
			if (window.hbspt) {
				// @ts-ignore
				window.hbspt.forms.create({
					portalId: '20473940',
					formId: 'deb777ef-173a-4fb4-8491-245491ca13ed',
					target: '#hubspot-form-container',
					inlineMessage:
						"You're signed up! You will be redirected shortly.",
					onFormSubmit: () => {
						if (window.dataLayer) {
							window.dataLayer.push({ event: 'course_submit' })
						}
						localStorage.setItem(
							OTEL_COURSE_LOCAL_STORAGE_KEY,
							'true',
						)
					},
				})
			}
		}
		document.body.appendChild(script)

		return () => {
			document.body.removeChild(script)
		}
	}, [router])

	return (
		<div className="bg-[#0d0225] min-h-screen text-gray-900 otel-course">
			<Head>
				<title>Master OpenTelemetry: Free Course | Highlight.io</title>
				<meta
					name="description"
					content="Elevate your observability skills with our comprehensive, free OpenTelemetry course. Learn from experts and transform your system's performance."
				/>
			</Head>

			{/* Link to each video */}
			<div className="flex flex-col gap-4">
				{courseVideos.map((video) => (
					<Link href={`/otel-course/${video.slug}`}>
						{video.title}
					</Link>
				))}
			</div>
		</div>
	)
}
