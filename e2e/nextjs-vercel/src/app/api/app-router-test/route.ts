// app/api/app-router-test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const GET = async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const sql = z.enum(['true', 'false']).parse(searchParams.get('sql'))
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))
	let result: { rows: { message: string }[] } = { rows: [{ message: '' }] }

	await fetch('https://pri.highlight.io/test')

	console.info('Here: /api/app-router-test/route.ts 💘💘💘', { sql, success })

	if (success === 'true') {
		return new Response(
			JSON.stringify({
				message: 'Success: /api/app-router-test',
				postgres: result.rows[0].message,
			}),
		)
	} else {
		console.log('Error: /api/app-router-test (App Router)')
		throw new Error('Error: /api/app-router-test (App Router)')
	}
}

export const POST = async function POST(request: Request) {
	const headers = Object.fromEntries(request.headers.entries())

	return NextResponse.json({
		body: { headers },
	})
}

export const runtime = 'nodejs'
