import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from 'react'
import { gql } from '@apollo/client'
import { useGetAdminQuery } from '../graph/generated/hooks'
import { GetAdminQuery } from '../graph/generated/operations'

const HIGHLIGHT_CLIENT_ID = 'aa101e42-169c-46f8-bed7-8d1f992d3cf0'

const HIGHLIGHT_URI =
	window.location.host.indexOf('300') === -1
		? 'https://app.highlight.run'
		: 'https://localhost:3000'
const REDIRECT_URI = window.location.protocol + '//' + window.location.host

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
	const d = window.localStorage.getItem('highlight-oauth')
	if (d) {
		return JSON.parse(d) as OAuthToken
	}
	return undefined
}

export const HighlightContextProvider = ({ children }: PropsWithChildren) => {
	const [OAuthData, setOAuthData] = useState<OAuthToken>()
	const { loading, data: admin } = useGetAdminQuery({})
	console.log({ loading, admin })
	const externalAuth = async () => {
		window.open(
			`${HIGHLIGHT_URI}/oauth/authorize?client_id=${HIGHLIGHT_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`,
		)
	}

	useEffect(() => {
		setOAuthData(getOAuthToken())
	}, [])

	useEffect(() => {
		if (OAuthData?.access_token) {
			window.localStorage.setItem(
				'highlight-oauth',
				JSON.stringify(OAuthData),
			)
		}
	}, [OAuthData])

	window.addEventListener('message', function (e: MessageEvent) {
		if (
			e.origin !== 'https://app.highlight.run' &&
			e.origin !== 'https://localhost:3000'
		) {
			return
		}
		try {
			const d = JSON.parse(e.data)
			if (d?.access_token) {
				setOAuthData(d)
			}
		} catch (e) {}
	})

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
			<>
				{children}
				<iframe
					id="highlight-receiver"
					src={`${HIGHLIGHT_URI}/oauth/authorize`}
					width={100}
					height={100}
					hidden
					title={'highlight'}
				/>
			</>
		</HighlightContext.Provider>
	)
}
