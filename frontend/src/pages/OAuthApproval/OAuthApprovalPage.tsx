import { ErrorState } from '@components/ErrorState/ErrorState'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetOAuthClientMetadataQuery } from '@graph/hooks'
import { auth } from '@util/auth'
import { GenerateSecureRandomString } from '@util/random'
import { GetBaseURL } from '@util/window'
import { message } from 'antd'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParams } from 'use-query-params'

import Button from '../../components/Button/Button/Button'

interface OAuthToken {
	access_token: string
	expires_in: number
	refresh_token: string
	token_type: string
}

const OAuthBackend =
	window.location.port === ''
		? `https://pri.highlight.io`
		: `https://pri.highlight.localhost`
const HighlightFrontend =
	window.location.port === ''
		? GetBaseURL()
		: `https://app.highlight.localhost`
const OAuthApprovalPage = () => {
	const { setLoadingState } = useAppLoadingContext()
	const [oauthParams] = useQueryParams({
		client_id: StringParam,
		redirect_uri: StringParam,
	})
	const [localStorageOAuth, setLocalStorageOAuth] = useState<OAuthToken>()
	const { loading, called, data } = useGetOAuthClientMetadataQuery({
		variables: {
			client_id: oauthParams.client_id || '',
		},
		skip: !oauthParams.client_id,
	})

	useEffect(() => {
		if (!loading && called) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [setLoadingState, loading, called])

	const validate = async (accessToken: string) => {
		const auth = await fetch(`${OAuthBackend}/oauth/validate`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${accessToken}` },
			credentials: 'include',
		})
		return auth.ok
	}

	const onLogin = async () => {
		const user = auth.currentUser
		const userToken = (await user?.getIdToken()) || ''
		const state = GenerateSecureRandomString(32)
		const redirectUri = `${HighlightFrontend}/oauth/authorize`
		const a = await fetch(
			`${OAuthBackend}/oauth/authorize?response_type=code&redirect_uri=${redirectUri}&client_id=${oauthParams.client_id}&state=${state}`,
			{ method: 'POST', headers: { token: userToken } },
		)
		const { code, state: returnedState } = new Proxy(
			new URLSearchParams(new URL(a.url).search),
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

		if (!(await validate(data.access_token))) {
			return message.error(
				`Validation failed after completing authorization flow! Please try again.`,
			)
		}

		await message.success(`Successfully authorized!`)
		if (oauthParams.redirect_uri) {
			window.location.href = oauthParams.redirect_uri
		}
	}

	if (loading) {
		return null
	} else if (called && !data?.oauth_client_metadata?.id) {
		return (
			<div className="absolute left-0 top-0 flex h-full w-full">
				<ErrorState message="We don't recognize this OAuth client." />
			</div>
		)
	}
	return (
		<>
			<Helmet>
				<title>New OAuth Integration</title>
			</Helmet>
			<div className="max-w-lg border border-gray-300 bg-white p-8">
				<h2 className="mb-3 text-2xl">{`Do you want to add ${
					data?.oauth_client_metadata?.app_name ||
					oauthParams.client_id
				} to your account?`}</h2>
				<p className="mb-6 text-base text-gray-500">
					Make sure you trust this app with access to your Highlight
					data.
				</p>
				<div>
					{localStorageOAuth?.access_token ? (
						<div className="text-center">
							You're logged in! You can now close this tab.
						</div>
					) : (
						<div className="flex gap-5">
							<Button
								trackingId="OAuthApprove"
								type="primary"
								className="mx-0 flex"
								block
								onClick={onLogin}
							>
								Approve
							</Button>
							<Button
								trackingId="OAuthReject"
								className="mx-0 flex"
								block
								danger
								onClick={() => {
									message
										.warning(
											`Rejecting authorization! Please close this window.`,
										)
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
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default OAuthApprovalPage
