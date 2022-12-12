import { ErrorGroup, ErrorObject, Maybe } from '@graph/schemas'
import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard'
import { getErrorBody } from '@util/errors/errorUtils'
import React from 'react'

interface Props {
	errorGroup?: Maybe<Pick<ErrorGroup, 'event'>>
	errorObject?: ErrorObject
}

const ErrorBody = ({ errorGroup, errorObject }: Props) => {
	const event = errorObject?.event ?? errorGroup?.event
	const body = getErrorBody(event)
	return <JsonOrTextCard jsonOrText={body} title="Body" />
}

export default ErrorBody
