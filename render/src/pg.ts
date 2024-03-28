import pkg from 'pg'

const { Client } = pkg

export type SessionInterval = {
	start_time: number
	end_time: number
	duration: number
	active: boolean
}

export type SessionChunk = {
	chunk_index: number
	timestamp: string
}

async function getClient() {
	const client = new Client({
		host: process.env.PSQL_HOST,
		port: Number(process.env.PSQL_PORT),
		database: process.env.PSQL_DB,
		user: process.env.PSQL_USER,
		password: process.env.PSQL_PASSWORD,
		connectionTimeoutMillis: 5000,
	})
	await client.connect()
	return client
}

export async function getSessionIntervals(_: number, session: number) {
	const client = await getClient()
	const res = await client.query(
		`SELECT start_time,
					end_time,
					duration::int,
					active
			 FROM session_intervals si
					  INNER JOIN sessions s on si.session_secure_id = s.secure_id
			 WHERE s.id = $1`,
		[session],
	)
	await client.end()
	return res.rows.map((r) => ({
		...r,
		start_time: r.start_time.getTime(),
		end_time: r.end_time.getTime(),
	})) as SessionInterval[]
}

export async function getSessionSecureID(session: number) {
	const client = await getClient()
	const res = await client.query<{ secure_id: string }>(
		`SELECT secure_id
			 FROM sessions
			 WHERE id = $1
			 LIMIT 1`,
		[session],
	)
	await client.end()
	const secureID = res.rows[0]?.secure_id
	if (!secureID) {
		throw new Error(`no session secure id found for id ${session}`)
	}
	return secureID
}

export async function getSessionChunks(session: number) {
	const client = await getClient()
	const res = await client.query<SessionChunk>(
		`SELECT chunk_index, timestamp
			 FROM event_chunks
			 WHERE session_id = $1`,
		[session],
	)
	await client.end()
	return res.rows
}

// used for testing in dev on local highlight stack
export async function getLongestSession() {
	const client = await getClient()
	const res = await client.query<{ project_id: number; id: number }>(
		`SELECT project_id, id
			 FROM sessions
			 WHERE active_length > 1000
			 ORDER BY active_length DESC
			 LIMIT 1`,
		[],
	)
	await client.end()
	return res.rows.pop()
}
