import moment from 'moment'

export const formatDate = (date: Date) => {
	return moment(date).format('M/D/YY h:mm:s A')
}
