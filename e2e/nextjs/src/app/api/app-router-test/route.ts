// app/api/app-router-test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config'
import { Client } from 'pg'
import { statfsSync } from 'node:fs'

export const GET = withAppRouterHighlight(async function GET(
	request: NextRequest,
) {
	const pgClient = new Client({
		user: 'postgres',
		database: 'postgres',
		port: 5432,
		host: 'localhost',
	})
	await pgClient.connect()

	const result = await pgClient.query('SELECT $1::text as message', [
		'Hello world!',
	])
	await pgClient.end()

	for (let i = 0; i < 3; i++) {
		try {
			statfsSync(`/tmp/${i}`)
		} catch (e) {
			console.error(e)
		}
	}

	const { searchParams } = new URL(request.url)
	const success = z.enum(['true', 'false']).parse(searchParams.get('success'))

	console.info('Here: /api/app-router-test/route.ts 💘💘💘', { success })

	if (success === 'true') {
		return new Response(
			JSON.stringify({
				message: 'Success: /api/app-router-test',
				postgres: result.rows[0].message,
			}),
		)
	} else {
		throw new Error('Error: /api/app-router-test (App Router)')
	}
})

export const POST = withAppRouterHighlight(async function POST(
	request: Request,
) {
	const headers = Object.fromEntries(request.headers.entries())

	return NextResponse.json({
		body: { headers },
	})
})

export const runtime = 'nodejs'
