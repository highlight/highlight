import pkg from 'pg'

const { Client } = pkg

export type SessionInterval = {
	start_time: number
	end_time: number
	duration: number
	active: boolean
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
