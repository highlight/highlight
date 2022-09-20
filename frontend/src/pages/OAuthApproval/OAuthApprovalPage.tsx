import { CardFormActionsContainer } from '@components/Card/Card'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import useLocalStorage from '@rehooks/local-storage'
import { GenerateSecureRandomString } from '@util/random'
import { GetBaseURL } from '@util/window'
import { message } from 'antd'
import Firebase from 'firebase'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParams } from 'use-query-params'

import Button from '../../components/Button/Button/Button'

interface OAuthToken {
	access_token: string
	expires_in: number
	refresh_token: string
	token_type: string
}

const OAuthBackend = `https://pri.highlight.run`
const OAuthApprovalPage = () => {
	const { setLoadingState } = useAppLoadingContext()
	const [oauthParams] = useQueryParams({
		client_id: StringParam,
		redirect_uri: StringParam,
	})
	const [localStorageOAuth, setLocalStorageOAuth] =
		useLocalStorage<OAuthToken>(`highlight-oauth`)

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	useEffect(() => {
		if (!localStorageOAuth?.access_token) return
		// send the oauth token to a potential iframe parent for transferring it to another domain
		const iframe = document.getElementById('highlight-receiver')
		if (iframe) {
			const receiver = (iframe as HTMLIFrameElement).contentWindow
			receiver!.postMessage(
				'highlight-oauth',
				JSON.stringify(localStorageOAuth),
			)
		}
	}, [localStorageOAuth])

	const onLogin = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		const user = Firebase.auth().currentUser
		const userToken = (await user?.getIdToken()) || ''
		const state = GenerateSecureRandomString(32)
		const redirectUri = `${GetBaseURL()}/oauth/authorize`
		const auth = await fetch(
			`${OAuthBackend}/oauth/authorize?response_type=code&redirect_uri=${redirectUri}&client_id=${oauthParams.client_id}&state=${state}`,
			{ headers: { token: userToken } },
		)
		const { code, state: returnedState } = new Proxy(
			new URLSearchParams(new URL(auth.url).search),
			{
				get: (searchParams, prop) => searchParams.get(prop.toString()),
			},
		) as { code?: string; state?: string }
		if (!code) {
			return message.error(
				`Something went wrong. Please restart the authorization.`,
			)
		}
		if (state !== returnedState) {
			return message.error(
				`Something went wrong while processing your authorization request. Please try again.`,
			)
		}

		const token = await fetch(
			`${OAuthBackend}/oauth/token?grant_type=authorization_code&redirect_uri=${redirectUri}&client_id=${oauthParams.client_id}&code=${code}`,
			{ method: 'POST', headers: { token: userToken } },
		)
		if (!token.ok) {
			return message.error(`Something went wrong. Please try again.`)
		}
		const data = (await token.json()) as OAuthToken
		setLocalStorageOAuth(data)

		await message.success(`Successfully authorized!`)
		if (oauthParams.redirect_uri) {
			window.location.href = oauthParams.redirect_uri
		}
	}

	return (
		<>
			<Helmet>
				<title>New OAuth Integration</title>
			</Helmet>
			<div className={'max-w-lg border border-gray-300 bg-white p-8'}>
				<h2
					className={'mb-3 text-2xl'}
				>{`Do you want to add ${oauthParams.client_id} to your account?`}</h2>
				<p className={'mb-6 text-base text-gray-500'}>
					Make sure you trust this app with access to your Highlight
					data.
				</p>
				<div className="gap-5">
					{localStorageOAuth?.access_token ? (
						<div className={'text-center'}>
							You're already logged in!
						</div>
					) : (
						<CardFormActionsContainer>
							<Button
								trackingId={`OAuthApprove`}
								type="primary"
								className="mx-0 flex"
								block
								onClick={onLogin}
							>
								Approve
							</Button>
							<Button
								trackingId={`OAuthReject`}
								className="mx-0 flex"
								block
								danger
								onClick={() => {
									message
										.warning(`Rejecting authorization!`)
										.then(() => {
											if (oauthParams.redirect_uri) {
												window.location.href =
													oauthParams.redirect_uri
											}
										})
								}}
							>
								Reject
							</Button>
						</CardFormActionsContainer>
					)}
				</div>
			</div>
		</>
	)
}

export default OAuthApprovalPage
