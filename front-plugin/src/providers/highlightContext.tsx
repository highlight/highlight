import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { gql } from '@apollo/client'
import { useGetAdminLazyQuery } from '../graph/generated/hooks'
import { GetAdminQuery } from '../graph/generated/operations'
import { client, HighlightPrivate } from '../util/graph'

const HIGHLIGHT_CLIENT_ID = 'aa101e42-169c-46f8-bed7-8d1f992d3cf0'

const VALIDATE_POLL = 1000
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
	logout?: () => Promise<boolean>
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
			photo_url
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
	const [valid, setValid] = useState<boolean>(false)
	const [OAuthToken, setOAuthToken] = useState<OAuthToken>()
	const [admin, setAdmin] = useState<GetAdminQuery>()
	const [query, { loading, called, refetch }] = useGetAdminLazyQuery({
		onCompleted: setAdmin,
	})

	const externalAuth = async () => {
		window.open(
			`${HIGHLIGHT_URI}/oauth/authorize?client_id=${HIGHLIGHT_CLIENT_ID}`,
		)
	}

	const logout = async () => {
		const token = getOAuthToken()
		const auth = await fetch(`${HighlightPrivate}/oauth/revoke`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${token?.AccessToken}`,
			},
		})
		if (auth.ok) {
			pollLogin()
			setValid(false)
			setOAuthToken(undefined)
			setAdmin(undefined)
			await client.resetStore()
		}
		return auth.ok
	}

	const refresh = useCallback(async () => {
		const token = getOAuthToken()
		if (!token?.AccessToken || !token.RefreshToken) return
		const data = new FormData()
		data.append('refresh_token', token.RefreshToken)
		const auth = await fetch(
			`${HighlightPrivate}/oauth/token?grant_type=refresh_token`,
			{
				credentials: 'include',
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token.AccessToken}`,
				},
			},
		)
		return auth.ok
	}, [])

	const validate = useCallback(async () => {
		let token = getOAuthToken()
		if (token?.ExpiresIn && token.ExpiresIn <= 15 * 60) {
			await refresh()
		}
		token = getOAuthToken()
		const auth = await fetch(`${HighlightPrivate}/oauth/validate`, {
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${token?.AccessToken}`,
			},
		})
		if (auth.ok) setOAuthToken(token)
		return auth.ok
	}, [refresh])

	const validatePoll = useCallback(async (): Promise<
		NodeJS.Timeout | undefined
	> => {
		const valid = await validate()
		setValid(valid)
		if (valid) {
			if (!called) await query()
			else await refetch()
		} else {
			return setTimeout(validatePoll, VALIDATE_POLL)
		}
	}, [validate, query, refetch, called])

	const pollLogin = () => {
		let timeout: NodeJS.Timeout | undefined = undefined
		validatePoll().then((t) => {
			if (t) timeout = t
		})
		return () => {
			if (timeout) clearTimeout(timeout)
		}
	}

	useEffect(pollLogin, [validatePoll])

	return (
		<HighlightContext.Provider
			value={{
				externalAuth,
				logout,
				authValid: valid,
				token: OAuthToken,
				loading,
				admin,
			}}
		>
			{children}
		</HighlightContext.Provider>
	)
}
