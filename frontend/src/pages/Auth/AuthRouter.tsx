import { useAuthContext } from '@authentication/AuthContext'
import { Box } from '@highlight-run/ui'
import { MultiFactor } from '@pages/Auth/MultiFactor'
import { ResetPassword } from '@pages/Auth/ResetPassword'
import { SignIn } from '@pages/Auth/SignIn'
import { SignUp } from '@pages/Auth/SignUp'
import { Landing } from '@pages/Landing/Landing'
import firebase from 'firebase/compat/app'
import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import { SignInRedirect } from '@/pages/Auth/SignInRedirect'

import * as styles from './AuthRouter.css'

export const SIGN_IN_ROUTE = '/sign_in'
export const SIGN_UP_ROUTE = '/sign_up'

export const AuthRouter: React.FC = () => {
	const { isAuthLoading } = useAuthContext()

	const [resolver, setResolver] =
		useState<firebase.auth.MultiFactorResolver>()

	if (isAuthLoading) {
		return null
	}

	return (
		<Landing>
			<Box cssClass={styles.container}>
				<Routes>
					<Route
						path={SIGN_IN_ROUTE}
						element={<SignIn setResolver={setResolver} />}
					/>
					<Route path={SIGN_UP_ROUTE} element={<SignUp />} />
					<Route
						path="/multi_factor"
						element={<MultiFactor resolver={resolver} />}
					/>
					<Route path="/reset_password" element={<ResetPassword />} />
					<Route path="/*" element={<SignInRedirect />} />
				</Routes>
			</Box>
		</Landing>
	)
}
