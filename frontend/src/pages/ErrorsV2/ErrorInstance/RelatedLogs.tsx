import { IconSolidLogs, Tag } from '@highlight-run/ui/components'
import moment from 'moment'
import { createSearchParams } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { Link } from '@/components/Link'
import { DEFAULT_OPERATOR } from '@/components/Search/SearchForm/utils'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import { ReservedLogKey } from '@/graph/generated/schemas'
import analytics from '@/util/analytics'

const getLogsLink = (data: GetErrorInstanceQuery | undefined): string => {
	const errorObject = data?.error_instance?.error_object

	if (!errorObject) {
		return ''
	}

	let query = ''
	if (errorObject.session?.secure_id) {
		query += `${ReservedLogKey.SecureSessionId}${DEFAULT_OPERATOR}"${errorObject.session?.secure_id}"`
	}
	if (errorObject.trace_id) {
		query += `${query ? ' ' : ''}${
			ReservedLogKey.TraceId
		}${DEFAULT_OPERATOR}"${errorObject.trace_id}"`
	}

	const logCursor = errorObject.log_cursor
	const params = createSearchParams({
		query,
		start_date: moment(errorObject.timestamp)
			.add(-5, 'minutes')
			.toISOString(),
		end_date: moment(errorObject.timestamp).add(5, 'minutes').toISOString(),
	})
	if (logCursor) {
		return `/${errorObject.project_id}/logs/${logCursor}?${params}`
	} else {
		return `/${errorObject.project_id}/logs?${params}`
	}
}

type Props = {
	data: GetErrorInstanceQuery | undefined
}

export const RelatedLogs = ({ data }: Props) => {
	const { isLoggedIn } = useAuthContext()

	const logsLink = getLogsLink(data)

	return (
		<Link
			to={logsLink}
			onClick={() => analytics.track('error_related-logs_click')}
		>
			<Tag
				kind="secondary"
				emphasis="high"
				size="medium"
				shape="basic"
				disabled={!isLoggedIn || logsLink === ''}
				iconLeft={<IconSolidLogs size={11} />}
			>
				Related logs
			</Tag>
		</Link>
	)
}
