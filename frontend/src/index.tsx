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
import { ErrorState } from '@components/ErrorState/ErrorState'
import { LoadingPage } from '@components/Loading/Loading'
import {
	AppLoadingContext,
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { datadogLogs } from '@datadog/browser-logs'
import { datadogRum } from '@datadog/browser-rum'
import {
	useGetAdminLazyQuery,
	useGetAdminRoleByProjectLazyQuery,
	useGetAdminRoleLazyQuery,
	useGetProjectLazyQuery,
} from '@graph/hooks'
import { Admin } from '@graph/schemas'
import { ErrorBoundary } from '@highlight-run/react'
import { SignUp } from '@pages/Auth/SignUp'
import { AuthAdminRouter } from '@pages/Login/Login'
import useLocalStorage from '@rehooks/local-storage'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import analytics from '@util/analytics'
import { setAttributionData } from '@util/attribution'
import { auth } from '@util/auth'
import { HIGHLIGHT_ADMIN_EMAIL_DOMAINS } from '@util/authorization/authorizationUtils'
import { showHiringMessage } from '@util/console/hiringMessage'
import { client } from '@util/graph'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { showIntercom } from '@util/window'
import { H, HighlightOptions } from 'highlight.run'
import { parse, stringify } from 'query-string'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Helmet } from 'react-helmet'
import { SkeletonTheme } from 'react-loading-skeleton'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'

analytics.initialize()
const dev = import.meta.env.DEV
const options: HighlightOptions = {
	debug: { clientInteractions: true, domRecording: true },
	manualStart: true,
	enableStrictPrivacy: Math.floor(Math.random() * 8) === 0,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
		destinationDomains: [
			'pri.highlight.run',
			'pub.highlight.run',
			'localhost:8082',
		],
		urlBlocklist: [
			'console-messages-compressed',
			'network-resources-compressed',
			'session-contents-compressed',
		],
	},
	tracingOrigins: ['highlight.run', 'localhost'],
	integrations: {
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
	sessionShortcut: 'alt+1,command+`,alt+esc',
	version: import.meta.env.REACT_APP_COMMIT_SHA || undefined,
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

	showIntercom({ hideMessage: true })
	if (!dev) {
		datadogLogs.init({
			clientToken: import.meta.env.DD_CLIENT_TOKEN,
			site: 'datadoghq.com',
			forwardErrorsToLogs: true,
			sampleRate: 100,
			service: 'frontend',
		})
		datadogRum.init({
			applicationId: import.meta.env.DD_RUM_APPLICATION_ID,
			clientToken: import.meta.env.DD_CLIENT_TOKEN,
			site: 'datadoghq.com',
			service: 'frontend',
			env: options.environment,
			version: options.version,
			sampleRate: 100,
			sessionReplaySampleRate: 1,
			trackResources: true,
			trackLongTasks: true,
			trackInteractions: true,
			defaultPrivacyLevel: 'allow',
		})
		datadogRum.startSessionReplayRecording()

		Sentry.init({
			dsn: 'https://e8052ada7c10490b823e0f939c519903@o4504696930631680.ingest.sentry.io/4504697059934208',
			integrations: [new BrowserTracing()],
			tracesSampleRate: 1.0,
		})
	}
}

showHiringMessage()
setAttributionData()

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
						</BrowserRouter>
					</AppLoadingContext>
				</SkeletonTheme>
			</ApolloProvider>
		</ErrorBoundary>
	)
}

const AuthenticationRoleRouter = () => {
	const workspaceId = /^\/w\/(\d+)\/.*$/.exec(window.location.pathname)?.pop()
	const projectId = /^\/(\d+)\/.*$/.exec(window.location.pathname)?.pop()

	const [
		getAdminWorkspaceRoleQuery,
		{
			error: adminWError,
			data: adminWData,
			called: wCalled,
			refetch: wRefetch,
		},
	] = useGetAdminRoleLazyQuery()

	const [
		getAdminProjectRoleQuery,
		{
			error: adminPError,
			data: adminPData,
			called: pCalled,
			refetch: pRefetch,
		},
	] = useGetAdminRoleByProjectLazyQuery()

	const [
		getAdminSimpleQuery,
		{
			error: adminSError,
			data: adminSData,
			called: sCalled,
			refetch: sRefetch,
		},
	] = useGetAdminLazyQuery()

	let getAdminQuery:
			| ((
					workspace_id:
						| QueryLazyOptions<
								Partial<{
									workspace_id: string
									project_id: string
								}>
						  >
						| undefined,
			  ) => void)
			| ((
					project_id:
						| QueryLazyOptions<
								Partial<{
									workspace_id: string
									project_id: string
								}>
						  >
						| undefined,
			  ) => void)
			| (() => void),
		adminError: ApolloError | undefined,
		adminData: Admin | undefined | null,
		adminRole: string | undefined,
		called: boolean,
		refetch: any
	if (workspaceId) {
		getAdminQuery = getAdminWorkspaceRoleQuery
		adminError = adminWError
		adminData = adminWData?.admin_role?.admin
		adminRole = adminWData?.admin_role?.role
		called = wCalled
		refetch = wRefetch
	} else if (projectId) {
		getAdminQuery = getAdminProjectRoleQuery
		adminError = adminPError
		adminData = adminPData?.admin_role_by_project?.admin
		adminRole = adminPData?.admin_role_by_project?.role
		called = pCalled
		refetch = pRefetch
	} else {
		getAdminQuery = getAdminSimpleQuery
		adminError = adminSError
		adminData = adminSData?.admin
		called = sCalled
		refetch = sRefetch
	}

	const { setLoadingState } = useAppLoadingContext()
	const [getProjectQuery] = useGetProjectLazyQuery()

	const [user, setUser] = useState<any>()
	const [authRole, setAuthRole] = useState<AuthRole>(AuthRole.LOADING)

	useEffect(() => {
		// Wait until auth is finished loading otherwise this request can fail.
		if (!adminData || !projectId || isAuthLoading(authRole)) {
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
					'Workspace ID': data.workspace?.id,
				})
			},
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adminData, authRole, projectId])

	useEffect(() => {
		const variables: Partial<{ workspace_id: string; project_id: string }> =
			{}
		if (workspaceId) {
			variables.workspace_id = workspaceId
		} else if (projectId) {
			variables.project_id = projectId
		}
		const unsubscribeFirebase = auth.onAuthStateChanged(
			(user) => {
				setUser(user)

				if (user) {
					if (!called) {
						getAdminQuery({
							variables,
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
		// we want to run this on url changes to recalculate the workspace_id and project_id
		// eslint-disable-next-line
	}, [getAdminQuery, adminData, called, refetch, workspaceId, projectId])

	useEffect(() => {
		// Check user exists here as well because adminData isn't cleared correctly
		// when a user logs out.
		if (adminData && user) {
			if (
				HIGHLIGHT_ADMIN_EMAIL_DOMAINS.some((d) =>
					adminData?.email.includes(d),
				)
			) {
				setAuthRole(AuthRole.AUTHENTICATED_HIGHLIGHT)
			} else if (adminData) {
				setAuthRole(AuthRole.AUTHENTICATED)
			}
			analytics.track('Authenticated')
		} else if (adminError) {
			setAuthRole(AuthRole.UNAUTHENTICATED)
		}
	}, [adminError, adminData, user])

	useEffect(() => {
		if (authRole === AuthRole.UNAUTHENTICATED) {
			setLoadingState(
				isAuthLoading(authRole)
					? AppLoadingState.LOADING
					: AppLoadingState.LOADED,
			)
		}
	}, [authRole, setLoadingState])

	const [enableStaffView] = useLocalStorage(
		`highlight-enable-staff-view`,
		true,
	)

	return (
		<AuthContextProvider
			value={{
				role: authRole,
				admin: isLoggedIn(authRole)
					? adminData ?? undefined
					: undefined,
				workspaceRole: adminRole || undefined,
				isAuthLoading: isAuthLoading(authRole),
				isLoggedIn: isLoggedIn(authRole),
				isHighlightAdmin: isHighlightAdmin(authRole) && enableStaffView,
			}}
		>
			<Helmet>
				<title>highlight.io</title>
			</Helmet>
			{adminError ? (
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
					<Route path="sign_up" element={<SignUp />} />
					<Route path="/*" element={<AuthAdminRouter />} />
				</Routes>
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
