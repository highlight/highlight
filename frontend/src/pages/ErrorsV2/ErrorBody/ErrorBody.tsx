import { ErrorGroup, Maybe } from '@graph/schemas'
import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard'
import { getErrorBody } from '@util/errors/errorUtils'
import React from 'react'

interface Props {
	errorGroup?: Maybe<Pick<ErrorGroup, 'event'>>
}

const ErrorBody: React.FC<React.PropsWithChildren<Props>> = ({
	errorGroup,
}) => {
	const body = getErrorBody(errorGroup?.event)

	return <JsonOrTextCard jsonOrText={body} title={'Body'} />
}

export default ErrorBody
