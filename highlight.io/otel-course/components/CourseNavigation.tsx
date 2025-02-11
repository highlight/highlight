import Link from 'next/link'
import { Typography } from '../../components/common/Typography/Typography'
import { CourseVideo } from '../types'
import { useVideoProgress } from '../hooks'

interface CourseNavigationProps {
	courseVideos: CourseVideo[]
	currentSlug?: string
	onNavigate?: () => void
}

export default function CourseNavigation({
	courseVideos,
	currentSlug,
	onNavigate,
}: CourseNavigationProps) {
	const { findProgress } = useVideoProgress(courseVideos)

	return (
		<div className="w-full h-full overflow-y-auto">
			<div className="p-6">
				<Link
					href="/otel-course"
					className="block"
					onClick={onNavigate}
				>
					<Typography
						type="copy2"
						className="font-bold text-xl text-gray-800 mb-4"
					>
						Master OpenTelemetry
					</Typography>
				</Link>
			</div>
			<nav className="px-4 space-y-1">
				{courseVideos.map((video, videoIndex) => {
					const progress = findProgress(video.id)
					const isActive = currentSlug === video.slug

					return (
						<Link
							key={`video-${videoIndex}`}
							href={`/otel-course/${video.slug}`}
							onClick={onNavigate}
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
	)
}
