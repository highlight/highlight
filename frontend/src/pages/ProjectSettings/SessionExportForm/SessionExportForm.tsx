import { useGetSessionExportsQuery } from '@graph/hooks'

export const SessionExportForm = () => {
	const { data } = useGetSessionExportsQuery()
	if (!data?.session_exports?.length) {
		return null
	}
	return (
		<div>
			{data?.session_exports.map((se) => (
				<div key={se.session_id}>{se.url}</div>
			))}
		</div>
	)
}
