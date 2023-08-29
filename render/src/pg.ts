import pkg from 'pg'

const { Client } = pkg

export type SessionInterval = {
	start_time: number
	end_time: number
	duration: number
	active: boolean
}

export async function getSessionIntervals(project: number, session: number) {
	const client = new Client({
		host: process.env.PSQL_HOST,
		port: Number(process.env.PSQL_PORT),
		database: process.env.PSQL_DB,
		user: process.env.PSQL_USER,
		password: process.env.PSQL_PASSWORD,
	})
	await client.connect()

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

	return res.rows as SessionInterval[]
}
