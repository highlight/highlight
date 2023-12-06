import { ClickhouseQuery, Session } from '@graph/schemas'

const exportFile = async (name: string, encodedUri: string) => {
	const link = document.createElement('a')
	link.setAttribute('href', encodedUri)
	link.setAttribute('download', name)
	document.body.appendChild(link) // Required for FF

	link.click() // This will download the data file named "my_data.csv".
}

export const generateSessionsReportCSV = async (
	query: ClickhouseQuery,
	sessions: Session[],
) => {
	const rows = [
		['filters', 'num_results'],
		[query.rules.map((rule) => rule.join(':')).join('|'), sessions.length],
		[
			'secure_id',
			'identifier',
			'active_length',
			'user_object',
			'user_properties',
		],
		...sessions.map((session) => [
			session.secure_id,
			session.identifier,
			session.active_length,
			session.user_object,
			session.user_properties,
		]),
	]

	let csvContent = 'data:text/csv;charset=utf-8,'
	rows.forEach(function (rowArray) {
		const row = rowArray.join(',')
		csvContent += row + '\r\n'
	})
	await exportFile('sessions_results.csv', encodeURI(csvContent))
}
