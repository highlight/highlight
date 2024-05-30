import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { Box, Text } from '@highlight-run/ui/components'
import { AuthBody, AuthHeader } from '@pages/Auth/Layout'
import { Landing } from '@pages/Landing/Landing'
import { auth } from '@util/auth'
import React, { useEffect } from 'react'
import { StringParam, useQueryParams } from 'use-query-params'

import * as styles from './AuthRouter.css'

export const Firebase: React.FC = () => {
	const { setLoadingState } = useAppLoadingContext()

	const [params] = useQueryParams({
		mode: StringParam,
		oobCode: StringParam,
		continueUrl: StringParam,
	})

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	useEffect(() => {
		;(async () => {
			if (
				params.mode === 'resetPassword' ||
				params.mode === 'recoverEmail' ||
				params.mode === 'verifyEmail'
			) {
				await auth.applyActionCode(params.oobCode!, params.continueUrl!)
			}
		})()
	}, [params.continueUrl, params.mode, params.oobCode])

	return (
		<Landing>
			<Box cssClass={styles.container}>
				<AuthHeader>
					<Text color="moderate">Authorizing...</Text>
				</AuthHeader>
				<AuthBody>
					<Text align="center" break="word">
						TODO(vkorolik)
					</Text>
				</AuthBody>
			</Box>
		</Landing>
	)
}
