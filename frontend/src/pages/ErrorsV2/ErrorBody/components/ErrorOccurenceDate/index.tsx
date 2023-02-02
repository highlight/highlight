import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box, Text } from '@highlight-run/ui'
import moment from 'moment'

interface Props {
	errorGroup?: Maybe<Omit<ErrorGroup, 'metadata_log'>>
}

const ErrorOccurenceDate = ({ errorGroup }: Props) => {
	return (
		<Box
			display="flex"
			gap="4"
			alignItems="center"
			flexShrink={0}
			flexWrap="nowrap"
		>
			<Text color="black" size="large" weight="bold">
				{errorGroup?.last_occurrence
					? moment(errorGroup.last_occurrence).fromNow(true)
					: 'just now'}
			</Text>
			<Text color="n11" size="large" weight="bold">
				{' / '}
			</Text>
			<Text color="n11" size="large" weight="bold">
				{errorGroup?.first_occurrence
					? moment(errorGroup.first_occurrence).fromNow(true)
					: 'just now'}
			</Text>
		</Box>
	)
}

export default ErrorOccurenceDate
