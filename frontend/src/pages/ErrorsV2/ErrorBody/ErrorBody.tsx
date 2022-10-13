import { ErrorGroup } from '@graph/schemas'
import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard'
import { getErrorBody } from '@util/errors/errorUtils'
import { Maybe } from 'graphql/jsutils/Maybe'
import React from 'react'

import styles from './ErrorBody.module.scss'

interface Props {
	errorGroup?: Maybe<Pick<ErrorGroup, 'event'>>
}

const ErrorBody: React.FC<React.PropsWithChildren<Props>> = ({
	errorGroup,
}) => {
	const body = getErrorBody(errorGroup?.event)

	return (
		<div className={styles.errorBody}>
			<JsonOrTextCard jsonOrText={body} title={'Body'} />
		</div>
	)
}

export default ErrorBody
