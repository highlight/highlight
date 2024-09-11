import '@fontsource/poppins'
import '@highlight-run/ui/styles.css'
import 'rrweb/dist/style.css'
import './__generated/antd.css'
import './index.css'
import './style/tailwind.css'

import { ApolloError, ApolloProvider } from '@apollo/client'
import { AuthContextProvider, AuthRole } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { LoadingPage } from '@components/Loading/Loading'
import { Toaster } from '@components/Toaster'
import {
	AppLoadingContext,
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useGetAdminLazyQuery,
	useGetAdminRoleByProjectLazyQuery,
	useGetAdminRoleLazyQuery,
	useGetProjectLazyQuery,
} from '@graph/hooks'
import { Admin, WorkspaceAdminRole } from '@graph/schemas'
import { ErrorBoundary } from '@highlight-run/react'
import useLocalStorage from '@rehooks/local-storage'
import { AppRouter } from '@routers/AppRouter/AppRouter'
import analytics from '@util/analytics'
import { getAttributionData, setAttributionData } from '@util/attribution'
import { auth } from '@util/auth'
import { showHiringMessage } from '@util/console/hiringMessage'
import { client } from '@util/graph'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { H, HighlightOptions } from 'highlight.run'
import { parse, stringify } from 'query-string'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Helmet } from 'react-helmet'
import { SkeletonTheme } from 'react-loading-skeleton'
import {
	BrowserRouter,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'

import { OTLP_ENDPOINT, PUBLIC_GRAPH_URI } from '@/constants'
import { SIGN_IN_ROUTE } from '@/pages/Auth/AuthRouter'
import { authRedirect } from '@/pages/Auth/utils'
import { onlyAllowHighlightStaff } from '@/util/authorization/authorizationUtils'
import { omit } from 'lodash'

document.body.className = 'highlight-light-theme'

const determinePrivacySetting = () => {
	const value = Math.random() * 10
	if (value < 1) {
		return 'strict' // 10%
	} else if (value < 4) {
		return 'none' // 30%
	} else {
		return 'default' // 60%
	}
}

analytics.initialize()
const dev = import.meta.env.DEV
const clientDebugKey = 'highlight-client-debug'
const clientDebug = window.localStorage.getItem(clientDebugKey)
if (!clientDebug) {
	window.localStorage.setItem(clientDebugKey, 'false')
}
const shouldDebugLog = clientDebug === 'true'
const options: HighlightOptions = {
	debug: shouldDebugLog
		? { clientInteractions: true, domRecording: true }
		: undefined,
	backendUrl: PUBLIC_GRAPH_URI,
	manualStart: true,
	privacySetting: determinePrivacySetting(),
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
		destinationDomains: [
			'pri.highlight.run',
			'pub.highlight.run',
			'pri.highlight.io',
			'pub.highlight.io',
			'localhost:8082',
		],
		urlBlocklist: [
			'network-resources-compressed',
			'session-contents-compressed',
			'web-socket-events-compressed',
		],
	},
	tracingOrigins: [
		'highlight.io',
		'highlight.run',
		'localhost',
		'localhost:8082',
	],
	integrations: {
		amplitude: {
			apiKey: 'fb83ae15d6122ef1b3f0ecdaa3393fea',
		},
		mixpanel: {
			projectToken: 'e70039b6a5b93e7c86b8afb02b6d2300',
		},
	},
	enableSegmentIntegration: true,
	enableCanvasRecording: true,
	samplingStrategy: {
		canvas: 1,
		canvasFactor: 0.5,
		canvasMaxSnapshotDimension: 480,
	},
	inlineStylesheet: true,
	inlineImages: true,
	sessionShortcut: 'alt+1,command+`,alt+esc',
	version: import.meta.env.REACT_APP_COMMIT_SHA ?? '1.0.0',
	serviceName: 'frontend',
	enableOtelTracing: true,
	otlpEndpoint: OTLP_ENDPOINT,
}
const favicon = document.querySelector("link[rel~='icon']") as any
if (dev) {
	options.integrations = undefined

	const sampleEnvironmentNames = ['john', 'jay', 'anthony', 'cameron', 'boba']
	options.environment = `${
		sampleEnvironmentNames[
			Math.floor(Math.random() * sampleEnvironmentNames.length)
		]
	}-localhost`
	window.document.title = `⚙️ ${window.document.title}`
	if (favicon) {
		favicon.href = `/favicon-localhost.ico`
	}
} else if (
	window.location.href.includes('onrender') ||
	window.location.href.includes('preview') ||
	shouldDebugLog
) {
	if (favicon) {
		favicon.href = `/favicon-pr.ico`
	}
	window.document.title = `📸 ${window.document.title}`
	options.environment = 'Pull Request Preview'
}
H.init(import.meta.env.REACT_APP_FRONTEND_ORG ?? 1, options)
analytics.track('attribution', getAttributionData())
if (!isOnPrem) {
	H.start()
}

showHiringMessage()
setAttributionData()

const App = () => {
	const [loadingState, setLoadingState] = useState<AppLoadingState>(
		AppLoadingState.LOADING,
	)

	return (
		<ErrorBoundary>
			<ApolloProvider client={client}>
				<SkeletonTheme
					baseColor="var(--color-gray-200)"
					highlightColor="var(--color-primary-background)"
				>
					<AppLoadingContext
						value={{
							loadingState,
							setLoadingState,
						}}
					>
						<LoadingPage />
						<BrowserRouter>
							<QueryParamProvider
								adapter={ReactRouter6Adapter}
								options={{
									searchStringToObject: parse,
									objectToSearchString: stringify,
								}}
							>
								<AuthenticationRoleRouter />
							</QueryParamProvider>
							<Toaster />
						</BrowserRouter>
					</AppLoadingContext>
				</SkeletonTheme>
			</ApolloProvider>
		</ErrorBoundary>
	)
}

const AuthenticationRoleRouter = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const workspaceId = /^\/w\/(\d+)\/.*$/.exec(location.pathname)?.pop()
	const projectId = /^\/(\d+)\/.*$/.exec(location.pathname)?.pop()

	const [
		getAdminWorkspaceRoleQuery,
		{
			error: adminWError,
			data: adminWData,
			called: wCalled,
			loading: wLoading,
			refetch: wRefetch,
		},
	] = useGetAdminRoleLazyQuery()

	const [
		getAdminProjectRoleQuery,
		{
			error: adminPError,
			data: adminPData,
			called: pCalled,
			loading: pLoading,
			refetch: pRefetch,
		},
	] = useGetAdminRoleByProjectLazyQuery()

	const [
		getAdminSimpleQuery,
		{
			error: adminSError,
			data: adminSData,
			called: sCalled,
			loading: sLoading,
			refetch: sRefetch,
		},
	] = useGetAdminLazyQuery()

	let getAdminQuery:
			| typeof getAdminWorkspaceRoleQuery
			| typeof getAdminProjectRoleQuery
			| typeof getAdminSimpleQuery,
		adminError: ApolloError | undefined,
		adminData: Admin | undefined | null,
		adminRole: string | undefined,
		roleData: WorkspaceAdminRole | undefined,
		called: boolean,
		loading: boolean,
		refetch: typeof wRefetch | typeof pRefetch | typeof sRefetch
	if (workspaceId) {
		getAdminQuery = getAdminWorkspaceRoleQuery
		adminError = adminWError
		adminData = adminWData?.admin_role?.admin
		adminRole = adminWData?.admin_role?.role
		roleData = adminWData?.admin_role ?? undefined
		called = wCalled
		loading = wLoading
		refetch = wRefetch
	} else if (projectId) {
		getAdminQuery = getAdminProjectRoleQuery
		adminError = adminPError
		adminData = adminPData?.admin_role_by_project?.admin
		adminRole = adminPData?.admin_role_by_project?.role
		roleData = adminPData?.admin_role_by_project ?? undefined
		called = pCalled
		loading = pLoading
		refetch = pRefetch
	} else {
		getAdminQuery = getAdminSimpleQuery
		adminError = adminSError
		adminData = adminSData?.admin
		called = sCalled
		loading = sLoading
		refetch = sRefetch
	}

	const { setLoadingState } = useAppLoadingContext()
	const [getProjectQuery] = useGetProjectLazyQuery()

	const [user, setUser] = useState(auth.currentUser)
	const [authRole, setAuthRole] = useState<AuthRole>(AuthRole.LOADING)

	const firebaseInitialized = useRef(false)
	const isAuthLoading = authRole === AuthRole.LOADING
	const isLoggedIn = authRole === AuthRole.AUTHENTICATED

	auth.onAuthStateChanged(
		async (user) => {
			if (!firebaseInitialized.current) {
				// Only call this logic when we are initializing Firebase, otherwise,
				// let the signIn/signOut handlers set it.
				setUser(user)

				if (!user) {
					// If Firebase initialized without a user they need to authenticate,
					// so set them as unauthenticated and disable the loading state.
					setAuthRole(AuthRole.UNAUTHENTICATED)
					setLoadingState(AppLoadingState.LOADED)
				}
			}

			firebaseInitialized.current = true
		},
		(error) => {
			H.consumeError(error)
		},
	)

	const fetchAdmin = useCallback(async () => {
		H.startSpan('adminFetch', async () => {
			if (loading || !user) {
				return
			}

			const variables: any = {}
			if (workspaceId) {
				variables.workspace_id = workspaceId
			} else if (projectId) {
				variables.project_id = projectId
			}

			if (!called) {
				await getAdminQuery({ variables })
			} else {
				await refetch!()
			}
		})
	}, [called, getAdminQuery, loading, projectId, refetch, user, workspaceId])

	useEffect(() => {
		if (adminData && user) {
			setAuthRole(AuthRole.AUTHENTICATED)
		} else if (adminError) {
			setAuthRole(AuthRole.UNAUTHENTICATED)
		}
	}, [adminData, adminError, user])

	useEffect(() => {
		const fetch = async () => {
			if (user) {
				await fetchAdmin()
			}
		}
		fetch()

		// Want to refetch admin when the query changes (happens when navigating to
		// different parts of the app) or when the Firebase user changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getAdminQuery, user])

	useEffect(() => {
		// Wait until auth is finished loading otherwise this request can fail.
		if (!adminData || !projectId || isAuthLoading) {
			return
		}

		getProjectQuery({
			variables: {
				id: projectId,
			},
			onCompleted: (data) => {
				if (!data.project || !adminData) {
					return
				}

				analytics.identify(adminData.id, {
					'Project ID': data.project?.id,
					'Workspace ID': data.project?.workspace?.id,
					...Object.entries(omit(adminData, ['__typename'])).reduce(
						(acc, [key, value]) => {
							if (value) {
								acc[key] = value.toString()
							}
							return acc
						},
						{} as Record<string, string>,
					),
				})
			},
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adminData, authRole, projectId])

	const [enableStaffView] = useLocalStorage(
		`highlight-enable-staff-view`,
		true,
	)

	const isProjectLevelMember = !!roleData?.projectIds?.length

	return (
		<AuthContextProvider
			value={{
				role: authRole,
				admin: isLoggedIn ? (adminData ?? undefined) : undefined,
				workspaceRole: adminRole || undefined,
				isAuthLoading,
				isLoggedIn,
				isHighlightAdmin:
					onlyAllowHighlightStaff(adminData) && enableStaffView,
				isProjectLevelMember,
				fetchAdmin,
				signIn: async (user: typeof auth.currentUser) => {
					analytics.track('Authenticated')
					setUser(user)
					setAuthRole(AuthRole.AUTHENTICATED)
				},
				signOut: () => {
					auth.signOut()
					client.clearStore()
					navigate(SIGN_IN_ROUTE)
					analytics.track('Sign out')
					setUser(null)
					setAuthRole(AuthRole.UNAUTHENTICATED)
					authRedirect.clear()
				},
			}}
		>
			<Helmet>
				<title>highlight.io</title>
			</Helmet>
			<div id="portal"></div>
			{adminError && user ? (
				<ErrorState
					message={
						`Seems like we had an issue with your login 😢. ` +
						`Feel free to log out and try again, or otherwise, ` +
						`get in contact with us!`
					}
					errorString={JSON.stringify(adminError)}
				/>
			) : (
				<Routes>
					<Route path="/*" element={<AppRouter />} />
				</Routes>
			)}
		</AuthContextProvider>
	)
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
