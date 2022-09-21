import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
} from 'react'
import { gql } from '@apollo/client'
import { useGetAdminLazyQuery } from '../graph/generated/hooks'
import { GetAdminQuery } from '../graph/generated/operations'
import { HighlightPrivate } from '../util/graph'

const HIGHLIGHT_CLIENT_ID = 'aa101e42-169c-46f8-bed7-8d1f992d3cf0'

const HIGHLIGHT_URI =
	window.location.host.indexOf('local') === -1
		? 'https://app.highlight.run'
		: 'https://app.highlight.localhost'

interface OAuthToken {
	AccessToken: string
	ExpiresIn: number
	RefreshToken: string
	Scope: string
}

interface HighlightContextData {
	externalAuth?: () => void
	authValid?: boolean
	token?: OAuthToken
	admin?: GetAdminQuery
	loading?: boolean
}

gql`
	query GetAdmin {
		admin {
			id
			name
			email
		}
	}
`

export const HighlightContext = createContext<HighlightContextData>({})

export function useHighlightContext() {
	return useContext(HighlightContext)
}

export function getOAuthToken() {
	const name = 'highlightOAuth'
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) {
		const rawValue = parts.pop()?.split(';').shift() || ''
		return JSON.parse(window.atob(rawValue)) as OAuthToken
	}
	return undefined
}

export const HighlightContextProvider = ({ children }: PropsWithChildren) => {
	const [query, { loading, data: admin }] = useGetAdminLazyQuery({})
	const OAuthData = getOAuthToken()

	const externalAuth = async () => {
		window.open(
			`${HIGHLIGHT_URI}/oauth/authorize?client_id=${HIGHLIGHT_CLIENT_ID}`,
		)
	}

	const validate = useCallback(async () => {
		const auth = await fetch(`${HighlightPrivate}/oauth/validate`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${OAuthData?.AccessToken}`,
			},
		})
		return auth.ok
	}, [OAuthData])

	const refresh = async () => {
		if (!OAuthData?.AccessToken || !OAuthData.RefreshToken) return
		const data = new FormData()
		data.append('refresh_token', OAuthData.RefreshToken)
		const auth = await fetch(
			`${HighlightPrivate}/oauth/token?grant_type=refresh_token`,
			{
				credentials: 'include',
				method: 'POST',
				headers: {
					Authorization: `Bearer ${OAuthData.AccessToken}`,
				},
			},
		)
		return auth.ok
	}

	useEffect(() => {
		validate().then((valid) => (valid ? query() : null))
	}, [])

	return (
		<HighlightContext.Provider
			value={{
				externalAuth,
				authValid: !!OAuthData?.AccessToken,
				token: OAuthData,
				loading,
				admin,
			}}
		>
			{children}
		</HighlightContext.Provider>
	)
}
