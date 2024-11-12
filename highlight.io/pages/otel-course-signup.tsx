'use client'

import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import '../styles/otel-course.scss'

const COURSE_URL = '/otel-course'
export const LOCAL_STORAGE_KEY = 'otelCourseAuthorized'

export default function OTelCourseSignup() {
	const router = useRouter()
	const [hasSubmittedForm, setHasSubmittedForm] = useState<boolean>(false)

	useEffect(() => {
		const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY)
		setHasSubmittedForm(!!storedValue)
	}, [])

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
						localStorage.setItem(LOCAL_STORAGE_KEY, 'true')
						router.push(COURSE_URL + '?signedup=true')
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

			{/* Hero Section */}
			<section className="text-white py-16 md:py-28">
				<div className="container mx-auto px-4 md:w-[775px] 2xl:w-[900px]">
					<h1 className="text-3xl md:text-5xl text-center font-poppins">
						Unlock the Power of OpenTelemetry:{' '}
						<span className="text-[rgb(235,255,94)]">
							From Novice to Expert in One Course
						</span>
					</h1>
					<p className="text-base md:text-xl font-medium text-center my-16 w-3/4 mx-auto">
						Master the industry-leading observability framework in
						our free, comprehensive course
					</p>
					<div className="flex justify-center">
						<a
							href={hasSubmittedForm ? COURSE_URL : '#signup'}
							className="bg-[#72e4fc] hover:bg-[#23b6e2] border border-[#72e4fc] text-[#0d0225] font-bold py-3 px-8 rounded-md text-lg transition duration-300 w-[300px] text-center"
						>
							{hasSubmittedForm ? 'View course' : 'Get started'}
						</a>
					</div>
					{hasSubmittedForm && (
						<p className="text-center text-white mb-8 text-lg italic">
							You&apos;re signed up! Enjoy the course!
						</p>
					)}
				</div>
			</section>

			{!hasSubmittedForm && (
				<>
					{/* Course Benefits */}
					<section className="py-16 bg-white text-gray-900">
						<div className="container mx-auto px-4 md:max-w-3xl">
							<h2 className="text-3xl font-bold text-center mb-12 text-[#0d0225]">
								What You&apos;ll Learn
							</h2>
							<div className="grid md:grid-cols-3 gap-8">
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
											'Explore real-world case studies and best practices for implementing OpenTelemetry',
									},
									{
										title: 'Advanced Topics',
										description:
											'Dive into advanced topics such as distributed tracing and service mesh',
									},
									{
										title: 'Project-Based Learning',
										description:
											'Solidify knowledge with a real-world project putting what you learn into practice',
									},
								].map((item, index) => (
									<div
										key={index}
										className="bg-gray-100 p-6 rounded-lg"
									>
										<h3 className="text-xl font-semibold mb-2 mt-0 text-[#0d0225]">
											{item.title}
										</h3>
										<p className="text-gray-600 mb-0">
											{item.description}
										</p>
									</div>
								))}
							</div>
						</div>
					</section>

					{/* Sign Up Form */}
					<section
						id="signup"
						className="py-16 bg-gray-100 text-gray-900"
					>
						<div className="container mx-auto px-4">
							<div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
								<div className="md:flex">
									<div className="md:w-1/2 p-8">
										<h2 className="text-3xl font-bold mb-4 text-[#0d0225]">
											Enroll for FREE
										</h2>
										<p className="text-gray-600 mb-6">
											Get instant access to expert-led
											content, practical exercises, and
											real-world examples.
										</p>
										<div id="hubspot-form-container"></div>
									</div>
									<div className="md:w-1/2 bg-[#0d0225] text-white p-8 flex">
										<div>
											<h3 className="text-3xl font-bold mb-4">
												What You&apos;ll Get
											</h3>
											<ul className="list-disc list-inside space-y-2">
												<li>
													9-part expert video course
												</li>
												<li>Free updates forever</li>
												<li>
													Tracing, metrics & logging
													deep dives
												</li>
												<li>
													Collector configuration &
													best practices
												</li>
												<li>Real-world case studies</li>
												<li>
													Performance optimization
													guides
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Video Preview */}
					<section className="py-16 bg-white text-gray-900">
						<div className="container mx-auto px-4">
							<h2 className="text-3xl font-bold text-center mb-8 text-[#0d0225]">
								Free Course Preview
							</h2>
							<p className="text-xl md:text-2xl text-center mb-16 text-gray-600">
								Get a sneak peek at the content you&apos;ll
								learn in our course
							</p>
							<div className="flex justify-center">
								<iframe
									width="716"
									height="403"
									src="https://www.youtube.com/embed/ASgosEzG4Pw"
									title="YouTube video player"
									frameBorder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									className="rounded-lg shadow-lg"
								></iframe>
							</div>
						</div>
					</section>

					{/* Testimonial */}
					<section className="py-16 bg-gray-100 text-gray-900">
						<div className="container mx-auto px-4">
							<div className="max-w-3xl mx-auto text-center">
								<svg
									className="w-12 h-12 text-gray-400 mb-4 mx-auto"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
								</svg>
								<p className="text-xl italic mb-4 text-gray-800">
									&quot;I have learned a ton from the team
									behind this course. These people know
									observability and have a knack for
									explaining it in a way that&apos;s easy to
									understand. I guarantee you&apos;ll learn a
									lot!&quot;
								</p>
								<p className="font-semibold text-gray-800">
									Abraham Soto, Director at Blue Cross of
									Idaho
								</p>
							</div>
						</div>
					</section>

					{/* Call to Action */}
					<section className="bg-[#0d0225] text-white pt-20 pb-16">
						<div className="container mx-auto px-4 text-center">
							<h2 className="text-3xl font-bold mb-4">
								Ready to Master OpenTelemetry?
							</h2>
							<p className="text-xl mb-8">
								Enroll now and take your first step towards
								becoming an observability expert!
							</p>
							<a
								href={hasSubmittedForm ? COURSE_URL : '#signup'}
								className="bg-[#72e4fc] hover:bg-[#23b6e2] border border-[#72e4fc] text-[#0d0225] font-bold py-3 px-8 rounded-md text-lg transition duration-300"
							>
								Get started
							</a>
						</div>

						{/* Footer Note */}
						<div className="text-center text-sm text-white mt-32">
							<p>
								💜 Brought to you for free as a labor of love by
								the team at{' '}
								<a
									href="https://highlight.io"
									className="text-white font-semibold hover:underline"
								>
									Highlight.io
								</a>{' '}
								💜
							</p>
						</div>
					</section>
				</>
			)}
		</div>
	)
}
