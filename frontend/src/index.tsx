import 'antd/dist/antd.css'
import '@highlight-run/rrweb/dist/rrweb.min.css'
import '@fontsource/poppins'
import './index.scss'
import './style/tailwind.css'

import { ApolloError, ApolloProvider, QueryLazyOptions } from '@apollo/client'
import {
	AuthContextProvider,
	AuthRole,
	isAuthLoading,
	isHighlightAdmin,
	isLoggedIn,
} from '@authentication/AuthContext'
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { LoadingPage } from '@components/Loading/Loading'
import {
	AppLoadingContext,
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { datadogLogs } from '@datadog/browser-logs'
import {
	useGetAdminLazyQuery,
	useGetAdminRoleByProjectLazyQuery,
	useGetAdminRoleLazyQuery,
} from '@graph/hooks'
import { Admin, Exact } from '@graph/schemas'
import { ErrorBoundary } from '@highlight-run/react'
import { auth } from '@util/auth'
import { HIGHLIGHT_ADMIN_EMAIL_DOMAINS } from '@util/authorization/authorizationUtils'
import { showHiringMessage } from '@util/console/hiringMessage'
import { client } from '@util/graph'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import { H, HighlightOptions } from 'highlight.run'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Helmet } from 'react-helmet'
import { SkeletonTheme } from 'react-loading-skeleton'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'

import packageJson from '../package.json'
import LoginForm, { AuthAdminRouter } from './pages/Login/Login'

const dev = import.meta.env.DEV
let commitSHA = import.meta.env.REACT_APP_COMMIT_SHA || ''
if (commitSHA.length > 8) {
	commitSHA = commitSHA.substring(0, 8)
}
const options: HighlightOptions = {
	debug: { clientInteractions: true, domRecording: true },
	manualStart: true,
	enableStrictPrivacy: Math.floor(Math.random() * 8) === 0,
	version: `${packageJson['version']}${commitSHA}`,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
		destinationDomains: [
			'pri.highlight.run',
			'pub.highlight.run',
			'localhost:8082',
		],
	},
	tracingOrigins: ['highlight.run', 'localhost'],
	integrations: {
		mixpanel: {
			projectToken: 'e70039b6a5b93e7c86b8afb02b6d2300',
		},
		amplitude: {
			apiKey: 'fb83ae15d6122ef1b3f0ecdaa3393fea',
		},
	},
	enableSegmentIntegration: true,
	enableCanvasRecording: true,
	samplingStrategy: {
		canvas: 15,
		canvasQuality: 'low',
		canvasMaxSnapshotDimension: 480,
		canvasFactor: 0.5,
	},
	inlineStylesheet: true,
	inlineImages: true,
	scriptUrl: 'https://static.highlight.run/beta/index.js',
	sessionShortcut: 'alt+1,command+`,alt+esc',
}
const favicon = document.querySelector("link[rel~='icon']") as any
if (dev) {
	options.scriptUrl = 'http://localhost:8080/dist/index.js'
	options.backendUrl = 'https://localhost:8082/public'

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
} else if (window.location.href.includes('onrender')) {
	if (favicon) {
		favicon.href = `/favicon-pr.ico`
	}
	window.document.title = `📸 ${window.document.title}`
	options.environment = 'Pull Request Preview'
}
H.init(import.meta.env.REACT_APP_FRONTEND_ORG ?? 1, options)
if (!isOnPrem) {
	H.start()

	window.Intercom('boot', {
		app_id: 'gm6369ty',
		alignment: 'right',
		hide_default_launcher: true,
	})

	if (!dev) {
		datadogLogs.init({
			clientToken: 'pub4946b807f59c69ede4bae46eb55dd066',
			site: 'datadoghq.com',
			forwardErrorsToLogs: true,
			sampleRate: 100,
			service: 'frontend',
		})
	}
}

showHiringMessage()

const App = () => {
	const [loadingState, setLoadingState] = useState<AppLoadingState>(
		AppLoadingState.LOADING,
	)

	return (
		<ErrorBoundary
			showDialog
			onAfterReportDialogCancelHandler={() => {
				const { origin } = window.location
				window.location.href = origin
			}}
		>
			<ApolloProvider client={client}>
				<QueryParamProvider>
					<SkeletonTheme
						baseColor={'var(--color-gray-200)'}
						highlightColor={'var(--color-primary-background)'}
					>
						<AppLoadingContext
							value={{
								loadingState,
								setLoadingState,
							}}
						>
							<LoadingPage />
							<Router>
								<Switch>
									<Route path="/w/:workspace_id(\d+)/*">
										<AuthenticationRoleRouter />
									</Route>
									<Route path="/:project_id(\d+)/*">
										<AuthenticationRoleRouter />
									</Route>
									<Route path="/">
										<AuthenticationRoleRouter />
									</Route>
								</Switch>
							</Router>
						</AppLoadingContext>
					</SkeletonTheme>
				</QueryParamProvider>
			</ApolloProvider>
		</ErrorBoundary>
	)
}

const AuthenticationRoleRouter = () => {
	const { workspace_id, project_id } = useParams<{
		workspace_id: string
		project_id: string
	}>()
	const [
		getAdminWorkspaceRoleQuery,
		{
			error: adminWError,
			data: adminWData,
			called: wCalled,
			refetch: wRefetch,
			loading: wLoading,
		},
	] = useGetAdminRoleLazyQuery()
	const [
		getAdminProjectRoleQuery,
		{
			error: adminPError,
			data: adminPData,
			called: pCalled,
			refetch: pRefetch,
			loading: pLoading,
		},
	] = useGetAdminRoleByProjectLazyQuery()
	const [
		getAdminSimpleQuery,
		{
			error: adminSError,
			data: adminSData,
			called: sCalled,
			refetch: sRefetch,
			loading: sLoading,
		},
	] = useGetAdminLazyQuery()
	let getAdminQuery:
			| ((
					workspace_id:
						| QueryLazyOptions<Exact<{ workspace_id: string }>>
						| undefined,
			  ) => void)
			| ((
					project_id:
						| QueryLazyOptions<Exact<{ project_id: string }>>
						| undefined,
			  ) => void)
			| (() => void),
		adminError: ApolloError | undefined,
		adminData: Admin | undefined | null,
		adminRole: string | undefined,
		called: boolean,
		refetch: any,
		loading: boolean
	if (workspace_id) {
		getAdminQuery = getAdminWorkspaceRoleQuery
		adminError = adminWError
		adminData = adminWData?.admin_role?.admin
		adminRole = adminWData?.admin_role?.role
		called = wCalled
		refetch = wRefetch
		loading = wLoading
	} else if (project_id) {
		getAdminQuery = getAdminProjectRoleQuery
		adminError = adminPError
		adminData = adminPData?.admin_role_by_project?.admin
		adminRole = adminPData?.admin_role_by_project?.role
		called = pCalled
		refetch = pRefetch
		loading = pLoading
	} else {
		getAdminQuery = getAdminSimpleQuery
		adminError = adminSError
		adminData = adminSData?.admin
		called = sCalled
		refetch = sRefetch
		loading = sLoading
	}

	const { setLoadingState } = useAppLoadingContext()

	const [authRole, setAuthRole] = useState<AuthRole>(AuthRole.LOADING)

	useEffect(() => {
		const unsubscribeFirebase = auth.onAuthStateChanged(
			(user) => {
				if (user) {
					if (!called) {
						getAdminQuery({
							variables: { workspace_id, project_id },
						})
					} else {
						refetch!()
					}
				} else {
					setAuthRole(AuthRole.UNAUTHENTICATED)
				}
			},
			(error) => {
				H.consumeError(new Error(JSON.stringify(error)))
				setAuthRole(AuthRole.UNAUTHENTICATED)
			},
		)

		return () => {
			unsubscribeFirebase()
		}
	}, [getAdminQuery, adminData, called, refetch, workspace_id, project_id])

	useEffect(() => {
		if (!loading && adminData) {
			if (
				HIGHLIGHT_ADMIN_EMAIL_DOMAINS.some((d) =>
					adminData?.email.includes(d),
				)
			) {
				setAuthRole(AuthRole.AUTHENTICATED_HIGHLIGHT)
			} else if (adminData) {
				setAuthRole(AuthRole.AUTHENTICATED)
			}
			H.track('Authenticated')
		} else if (adminError) {
			setAuthRole(AuthRole.UNAUTHENTICATED)
		}
	}, [adminError, adminData, loading])

	useEffect(() => {
		if (authRole === AuthRole.UNAUTHENTICATED) {
			setLoadingState(
				isAuthLoading(authRole)
					? AppLoadingState.LOADING
					: AppLoadingState.LOADED,
			)
		}
	}, [authRole, setLoadingState])

	console.log('vadim', { adminData, authRole, adminRole })
	return (
		<AuthContextProvider
			value={{
				role: authRole,
				admin: isLoggedIn(authRole)
					? adminData ?? undefined
					: undefined,
				workspaceRole: adminRole || undefined,
				isAuthLoading: loading || isAuthLoading(authRole),
				isLoggedIn: isLoggedIn(authRole),
				isHighlightAdmin: isHighlightAdmin(authRole),
			}}
		>
			<Helmet>
				<title>Highlight App</title>
			</Helmet>
			{adminError ? (
				<ErrorState
					message={`
Seems like we had an issue with your login 😢.
Feel free to log out and try again, or otherwise,
get in contact with us!
`}
					errorString={JSON.stringify(adminError)}
				/>
			) : (
				<Router>
					<Switch>
						<Route path="/:project_id(0)/*" exact>
							{/* Allow guests to access this route without being asked to log in */}
							<AuthAdminRouter />
						</Route>
						<Route
							path={`/:project_id(${DEMO_WORKSPACE_PROXY_APPLICATION_ID})/*`}
							exact
						>
							{/* Allow guests to access this route without being asked to log in */}
							<AuthAdminRouter />
						</Route>
						<Route
							path="/:project_id(\d+)/sessions/:session_secure_id(\w+)"
							exact
						>
							{/* Allow guests to access this route without being asked to log in */}
							<AuthAdminRouter />
						</Route>
						<Route
							path="/:project_id(\d+)/errors/:error_secure_id(\w+)"
							exact
						>
							{/* Allow guests to access this route without being asked to log in */}
							<AuthAdminRouter />
						</Route>
						<Route path="/">
							<LoginForm />
						</Route>
					</Switch>
				</Router>
			)}
		</AuthContextProvider>
	)
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root'),
)
