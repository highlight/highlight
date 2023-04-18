export async function GET(request: Request) {
	console.info('Here: /api/app-directory-success')

	return new Response('Success: /api/app-directory-success')
}
