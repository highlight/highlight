export type CourseVideo = {
	id: string
	title: string
	description: string
	order: number
	slug: string
	free: boolean
}

export type CourseVideoProgress = {
	videoId: string
	progress: number
	started: boolean
}
