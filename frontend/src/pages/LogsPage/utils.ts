import { FORMAT } from '@pages/LogsPage/constants'
import moment from 'moment'

export const formatDate = (date: Date) => {
	return moment(date).format('M/D/YY h:mm:s A')
}

export const isSignificantDateRange = (startDate: Date, endDate: Date) => {
	return moment(startDate).format(FORMAT) !== moment(endDate).format(FORMAT)
}
