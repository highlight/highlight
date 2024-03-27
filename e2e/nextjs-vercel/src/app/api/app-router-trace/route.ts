// app/api/app-router-trace/route.ts
import { NextRequest } from 'next/server'

export const GET = async function GET(request: NextRequest) {
	return new Promise<Response>(async (resolve) => {
		await fetch('https://pri.highlight.io/test')

		console.info('Here: /pages/api/app-router-trace/route.ts ⏰⏰⏰')

		resolve(new Response('Success: /api/app-router-trace'))
	})
}

export const runtime = 'nodejs'
