import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { gql } from '@apollo/client'
import { useGetAdminQuery } from '../graph/generated/hooks'
import { GetAdminQuery } from '../graph/generated/operations'
import { HighlightPrivateGraph } from '../util/graph'

const HIGHLIGHT_CLIENT_ID = 'aa101e42-169c-46f8-bed7-8d1f992d3cf0'

const HIGHLIGHT_URI =
	window.location.host.indexOf('local') === -1
		? 'https://app.highlight.run'
		: 'https://app.highlight.localhost'

interface OAuthToken {
	access_token: string
	expires_in: number
	refresh_token: string
	token_type: string
}

interface HighlightContextData {
	externalAuth?: () => void
	authValid?: boolean
	token?: OAuthToken
	admin?: GetAdminQuery
	loading?: boolean
}

gql`
	query GetAdmin($year: Int!) {
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
		return JSON.parse(parts.pop()?.split(';').shift() || '') as OAuthToken
	}

	return undefined
}

export const HighlightContextProvider = ({ children }: PropsWithChildren) => {
	const [OAuthData, setOAuthData] = useState<OAuthToken>()
	const { loading, data: admin } = useGetAdminQuery({})

	const externalAuth = async () => {
		window.open(
			`${HIGHLIGHT_URI}/oauth/authorize?client_id=${HIGHLIGHT_CLIENT_ID}`,
		)
	}

	const validate = useCallback(async () => {
		const auth = await fetch(`${HighlightPrivateGraph}/oauth/validate`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${OAuthData?.access_token}`,
			},
		})
		return auth.ok
	}, [OAuthData])

	const refresh = async () => {
		if (!OAuthData?.access_token || !OAuthData.refresh_token) return
		const data = new FormData()
		data.append('refresh_token', OAuthData.refresh_token)
		const auth = await fetch(
			`${HighlightPrivateGraph}/oauth/token?grant_type=refresh_token`,
			{
				credentials: 'include',
				method: 'POST',
				headers: {
					Authorization: `Bearer ${OAuthData.access_token}`,
				},
			},
		)
		return auth.ok
	}

	useEffect(() => {
		validate().then((valid) => console.log('vadim', 'valid', valid))
	}, [validate])

	useEffect(() => {
		setOAuthData(getOAuthToken())
	}, [])

	return (
		<HighlightContext.Provider
			value={{
				externalAuth,
				authValid: !!OAuthData?.access_token,
				token: OAuthData,
				loading,
				admin,
			}}
		>
			{children}
		</HighlightContext.Provider>
	)
}
