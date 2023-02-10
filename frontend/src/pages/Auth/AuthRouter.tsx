import { useAuthContext } from '@authentication/AuthContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { Box } from '@highlight-run/ui'
import { MultiFactor } from '@pages/Auth/MultiFactor'
import { ResetPassword } from '@pages/Auth/ResetPassword'
import { SignIn } from '@pages/Auth/SignIn'
import { SignUp } from '@pages/Auth/SignUp'
import { Landing } from '@pages/Landing/Landing'
import analytics from '@util/analytics'
import { showIntercom } from '@util/window'
import firebase from 'firebase/app'
import { H } from 'highlight.run'
import { omit } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import * as styles from './AuthRouter.css'

export const AuthRouter: React.FC = () => {
	const { isAuthLoading, admin } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()

	const [resolver, setResolver] =
		useState<firebase.auth.MultiFactorResolver>()

	useEffect(() => {
		if (admin) {
			const { email, id, name } = admin
			const identifyMetadata: {
				id: string
				name: string
				avatar?: string
				email?: string
			} = {
				id,
				name,
				email,
			}

			if (admin.photo_url) {
				identifyMetadata.avatar = admin.photo_url
			}

			H.identify(email, identifyMetadata)

			// `id` is a reserved keyword in rudderstack and it's recommended to use a
			// static property for the user ID rather than something that could change
			// over time, like an email address.
			analytics.identify(admin.id, omit(identifyMetadata, ['id']))
			showIntercom({ admin, hideMessage: true })
		}
	}, [admin])

	useEffect(() => {
		if (isAuthLoading) {
			setLoadingState(AppLoadingState.LOADING)
		}
	}, [isAuthLoading, setLoadingState])

	if (isAuthLoading) {
		return null
	}

	return (
		<Landing>
			<Box cssClass={styles.container}>
				<Switch>
					<Route path="/sign_in">
						<SignIn setResolver={setResolver} />
					</Route>
					<Route path="/sign_up">
						<SignUp />
					</Route>
					<Route path="/multi_factor">
						<MultiFactor resolver={resolver} />
					</Route>
					<Route path="/reset_password">
						<ResetPassword />
					</Route>
					<Redirect from="/" to="/sign_in" />
				</Switch>
			</Box>
		</Landing>
	)
}
