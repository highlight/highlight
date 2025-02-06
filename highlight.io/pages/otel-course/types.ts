export type CourseVideo = {
	id: string | undefined
	title: string
	description: string
	order: number
	slug: string
}

export type CourseVideoProgress = {
	videoId: string
	progress: number
	started: boolean
}
