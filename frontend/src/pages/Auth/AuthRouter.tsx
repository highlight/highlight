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
import { VerifyEmail } from '@pages/Auth/VerifyEmail'
import { Landing } from '@pages/Landing/Landing'
import { AuthAdminRouter } from '@pages/Login/Login'
import analytics from '@util/analytics'
import { showIntercom } from '@util/window'
import firebase from 'firebase/app'
import { H } from 'highlight.run'
import { omit } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import * as styles from './AuthRouter.css'

export const AuthRouter: React.FC = () => {
	const { isAuthLoading, isLoggedIn, admin } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()
	const [nextParam] = useQueryParam('next', StringParam)
	const [configurationIdParam] = useQueryParam('configurationId', StringParam)
	const isVercelIntegrationFlow = !!nextParam || !!configurationIdParam
	const history = useHistory()

	const [resolver, setResolver] =
		useState<firebase.auth.MultiFactorResolver>()

	useEffect(() => {
		if (admin) {
			const { email, id, name } = admin
			const identifyMetadata: {
				id: string
				avatar?: string
				name: string
				email?: string
			} = {
				email,
				id,
				name,
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

	useEffect(() => {
		if (isLoggedIn && admin) {
			if (admin.email_verified === false) {
				history.push('/verify_email')
			} else if (!admin.about_you_details_filled) {
				history.push('/about_you')
			}
		}
	}, [admin, admin?.email_verified, history, isLoggedIn])

	// Do not show the about you page if this is during the Vercel integration flow
	if (isLoggedIn && (admin || isVercelIntegrationFlow)) {
		return <AuthAdminRouter />
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
					<Route path="/verify_email">
						<VerifyEmail />
					</Route>
					<Redirect from="/" to="/sign_in" />
				</Switch>
			</Box>
		</Landing>
	)
}
