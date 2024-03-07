import LoadingBox from '@components/LoadingBox'
import { GetErrorGroupQuery } from '@graph/operations'
import { Box, Heading } from '@highlight-run/ui/components'
import ErrorTag from '@pages/ErrorsV2/ErrorTag/ErrorTag'
import { getHeaderFromError } from '@pages/ErrorsV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import { useMemo } from 'react'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorTitle = ({ errorGroup }: Props) => {
	const event = errorGroup?.event
	const headerText = useMemo(() => {
		let header = getHeaderFromError(event ?? [])
		if (header && event) {
			const title = getErrorBody(event)
			if (title) {
				header = title
			}
		}
		return header
	}, [event])

	if (!errorGroup) {
		return <LoadingBox />
	}

	return (
		<Box display="flex" flexDirection="column" gap="16" mb="24">
			<Box display="flex" justifyContent="space-between">
				<ErrorTag errorGroup={errorGroup} />
			</Box>

			<Heading level="h2" lines="2">
				{headerText}
			</Heading>
		</Box>
	)
}

export default ErrorTitle
