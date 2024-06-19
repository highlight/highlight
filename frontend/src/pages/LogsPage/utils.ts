import moment from 'moment'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { DEFAULT_OPERATOR } from '@/components/Search/SearchForm/utils'
import { ReservedLogKey, Session } from '@/graph/generated/schemas'

export const formatDate = (date: Date) => {
	return moment(date).format('M/D/YY h:mm:ss A')
}

export const isSignificantDateRange = (startDate: Date, endDate: Date) => {
	return (
		moment(startDate).format(TIME_FORMAT) !==
		moment(endDate).format(TIME_FORMAT)
	)
}

export const buildSessionParams = ({
	session,
	query,
}: {
	session: Session | undefined
	query: string
}) => {
	let searchQuery = query

	if (session?.secure_id) {
		searchQuery += ` ${ReservedLogKey.SecureSessionId}${DEFAULT_OPERATOR}${session.secure_id}`
	}

	return {
		query: searchQuery.trim(),
		date_range: {
			start_date: moment(session?.created_at),
			end_date: moment(session?.created_at).add(4, 'hours'),
		},
	}
}
