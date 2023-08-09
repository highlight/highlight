import { IconSolidLogs, Tag } from '@highlight-run/ui'
import moment from 'moment'
import { createSearchParams } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { Link } from '@/components/Link'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import { ReservedLogKey } from '@/graph/generated/schemas'
import {
	DEFAULT_LOGS_OPERATOR,
	LogsSearchParam,
	stringifyLogsQuery,
} from '@/pages/LogsPage/SearchForm/utils'

const getLogsLink = (data: GetErrorInstanceQuery | undefined): string => {
	const errorObject = data?.error_instance?.error_object

	if (!errorObject) {
		return ''
	}

	const queryParams: LogsSearchParam[] = []
	let offsetStart = 1
	if (errorObject.session?.secure_id) {
		queryParams.push({
			key: ReservedLogKey.SecureSessionId,
			operator: DEFAULT_LOGS_OPERATOR,
			value: errorObject.session?.secure_id,
			offsetStart: offsetStart++,
		})
	}
	if (errorObject.trace_id) {
		queryParams.push({
			key: ReservedLogKey.TraceId,
			operator: DEFAULT_LOGS_OPERATOR,
			value: errorObject.trace_id,
			offsetStart: offsetStart++,
		})
	}
	const query = stringifyLogsQuery(queryParams)
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
		<Link to={logsLink}>
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
