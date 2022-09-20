import { CardForm, CardFormActionsContainer } from '@components/Card/Card'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import Button from '../../components/Button/Button/Button'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { StringParam, useQueryParams } from 'use-query-params'
import { GetBaseURL } from '@util/window'
import { message } from 'antd'
import { GenerateSecureRandomString } from '@util/random'
import useLocalStorage from '@rehooks/local-storage'

interface OAuthToken {
	access_token: string
	expires_in: number
	refresh_token: string
	token_type: string
}
// TODO(vkorolik) dynamic...
const OAuthBackend = `https://localhost:8082`
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

	const onSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		const state = GenerateSecureRandomString(32)
		const redirectUri = `${GetBaseURL()}/oauth/authorize`
		const auth = await fetch(
			`${OAuthBackend}/oauth/authorize?response_type=code&redirect_uri=${redirectUri}&client_id=${oauthParams.client_id}&state=${state}`,
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
		)
		if (!token.ok) {
			return message.error(`Something went wrong. Please try again.`)
		}
		const data = (await token.json()) as OAuthToken
		setLocalStorageOAuth(data)

		await message.success(`Successfully authenticated!`)
		if (oauthParams.redirect_uri) {
			window.location.href = oauthParams.redirect_uri
		}
	}

	return (
		<>
			<Helmet>
				<title>New OAuth Integration</title>
			</Helmet>
			<div className={'bg-white border border-gray-300 max-w-lg p-8'}>
				<h2
					className={'text-2xl mb-3'}
				>{`Do you want to add ${oauthParams.client_id} to your account?`}</h2>
				<p className={'text-gray-500 text-base mb-6'}>
					Make sure you trust this app with access to your Highlight
					data.
				</p>
				<CardForm onSubmit={onSubmit} className="gap-5">
					{localStorageOAuth?.access_token ? (
						<div className={'text-center'}>
							You're already logged in!
						</div>
					) : (
						<CardFormActionsContainer>
							<Button
								trackingId={`OAuthApprove`}
								type="primary"
								className="flex mx-0"
								block
								htmlType="submit"
							>
								Approve
							</Button>
							{/*TODO(vkorolik) what to do on reject?*/}
							<Button
								trackingId={`OAuthReject`}
								className="flex mx-0"
								block
								danger
							>
								Reject
							</Button>
						</CardFormActionsContainer>
					)}
				</CardForm>
			</div>
		</>
	)
}

export default OAuthApprovalPage
