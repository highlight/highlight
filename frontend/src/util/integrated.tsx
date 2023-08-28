import { useAuthContext } from '@authentication/AuthContext'
import {
	useGetAlertsPagePayloadQuery,
	useGetClientIntegrationQuery,
	useGetLogsIntegrationQuery,
	useGetProjectQuery,
	useGetServerIntegrationQuery,
	useGetWorkspaceAdminsQuery,
	useIsIntegratedLazyQuery,
} from '@graph/hooks'
import { useNumericProjectId } from '@hooks/useProjectId'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { useEffect, useState } from 'react'

import { IntegrationStatus } from '@/graph/generated/schemas'

const POLL_INTERVAL_MS = 5000

export const useIntegratedLocalStorage = (
	projectId: string,
	area: 'client' | 'server' | 'logs' | 'alerts' | 'team',
) => {
	return useLocalStorage<LocalStorageIntegrationData>(
		`highlight-${projectId}-${area}-integration`,
		{
			loading: true,
			integrated: false,
			createdAt: undefined,
			resourceType: '',
		},
	)
}

export const useIntegrated = (): { integrated: boolean; loading: boolean } => {
	const { isLoggedIn, isAuthLoading } = useAuthContext()
	const { projectId } = useNumericProjectId()
	const [query, { data, loading }] = useIsIntegratedLazyQuery({
		variables: { project_id: projectId! },
		fetchPolicy: 'cache-and-network',
	})
	const [localStorageIntegrated, setLocalStorageIntegrated] = useLocalStorage(
		`highlight-${projectId}-integrated`,
		false,
	)
	const [integrated, setIntegrated] = useState<boolean | undefined>(undefined)
	const [loadingState, setLoadingState] = useState(true)
	const integratedRaw = data?.isIntegrated

	useEffect(() => {
		if (!isLoggedIn) return
		if (!localStorageIntegrated) {
			query()
			const timer = setInterval(() => {
				if (!integrated) {
					query()
				} else {
					clearInterval(timer)
				}
			}, POLL_INTERVAL_MS)
			return () => {
				clearInterval(timer)
			}
		} else {
			setLoadingState(false)
			setIntegrated(localStorageIntegrated)
		}
	}, [integrated, localStorageIntegrated, query, isLoggedIn])

	useEffect(() => {
		if (integratedRaw !== undefined) {
			setIntegrated(integratedRaw?.valueOf())
			setLocalStorageIntegrated(integratedRaw?.valueOf() || false)
			if (
				localStorageIntegrated === false &&
				integratedRaw?.valueOf() === true
			) {
				analytics.track('IntegratedProject', { id: projectId })
			}
		}
	}, [
		integratedRaw,
		localStorageIntegrated,
		projectId,
		setLocalStorageIntegrated,
	])

	useEffect(() => {
		if (loading === false) {
			setLoadingState(false)
		}
	}, [loading])

	// Assume that app is integrated if viewing session as guest and not loading
	if (!isLoggedIn) {
		return { integrated: !isAuthLoading, loading: isAuthLoading }
	}

	return { integrated: integrated || false, loading: loadingState }
}

export type LocalStorageIntegrationData = {
	loading: boolean
} & IntegrationStatus

export const useClientIntegration = () => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useNumericProjectId()
	const [localStorageIntegrated, setLocalStorageIntegrated] =
		useIntegratedLocalStorage(projectId!, 'client')

	const { data, startPolling, stopPolling } = useGetClientIntegrationQuery({
		variables: { project_id: projectId! },
		skip: localStorageIntegrated.integrated,
		fetchPolicy: 'cache-and-network',
	})

	useEffect(() => {
		if (!isLoggedIn) return
		if (!localStorageIntegrated.integrated) {
			startPolling(POLL_INTERVAL_MS)

			return () => {
				stopPolling()
			}
		} else {
			stopPolling()
		}
	}, [
		localStorageIntegrated.integrated,
		isLoggedIn,
		startPolling,
		stopPolling,
	])

	useEffect(() => {
		if (data?.clientIntegration !== undefined) {
			if (
				!localStorageIntegrated.integrated &&
				data?.clientIntegration.integrated
			) {
				analytics.track('integrated-client', { id: projectId })
			}

			setLocalStorageIntegrated({
				loading: false,
				...data?.clientIntegration,
			})
		}
	}, [
		data?.clientIntegration,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}

export const useServerIntegration = () => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useNumericProjectId()
	const [localStorageIntegrated, setLocalStorageIntegrated] =
		useIntegratedLocalStorage(projectId!, 'server')

	const { data, startPolling, stopPolling } = useGetServerIntegrationQuery({
		variables: { project_id: projectId! },
		skip: localStorageIntegrated.integrated,
		fetchPolicy: 'cache-and-network',
	})

	useEffect(() => {
		if (!isLoggedIn) return
		if (!localStorageIntegrated.integrated) {
			startPolling(POLL_INTERVAL_MS)

			return () => {
				stopPolling()
			}
		} else {
			stopPolling()
		}
	}, [
		localStorageIntegrated.integrated,
		isLoggedIn,
		startPolling,
		stopPolling,
	])

	useEffect(() => {
		if (data?.serverIntegration !== undefined) {
			if (
				!localStorageIntegrated.integrated &&
				data?.serverIntegration.integrated
			) {
				analytics.track('integrated-server', { id: projectId })
			}

			setLocalStorageIntegrated({
				loading: false,
				...data?.serverIntegration,
			})
		}
	}, [
		data?.serverIntegration,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}

export const useLogsIntegration = () => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useNumericProjectId()
	const [localStorageIntegrated, setLocalStorageIntegrated] =
		useIntegratedLocalStorage(projectId!, 'logs')

	const { data, startPolling, stopPolling } = useGetLogsIntegrationQuery({
		variables: { project_id: projectId! },
		skip: localStorageIntegrated.integrated,
		fetchPolicy: 'cache-and-network',
	})

	useEffect(() => {
		if (!isLoggedIn) return
		if (!localStorageIntegrated.integrated) {
			startPolling(POLL_INTERVAL_MS)

			return () => {
				stopPolling()
			}
		} else {
			stopPolling()
		}
	}, [
		localStorageIntegrated.integrated,
		isLoggedIn,
		startPolling,
		stopPolling,
	])

	useEffect(() => {
		if (data?.logsIntegration !== undefined) {
			if (
				!localStorageIntegrated.integrated &&
				data?.logsIntegration.integrated
			) {
				analytics.track('integrated-logs', { id: projectId })
			}

			setLocalStorageIntegrated({
				loading: false,
				...data?.logsIntegration,
			})
		}
	}, [
		data?.logsIntegration,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}

export const useAlertsIntegration = () => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useNumericProjectId()
	const [localStorageIntegrated, setLocalStorageIntegrated] =
		useIntegratedLocalStorage(projectId!, 'alerts')

	const { data, startPolling, stopPolling } = useGetAlertsPagePayloadQuery({
		variables: { project_id: projectId! },
		skip: localStorageIntegrated.integrated,
		fetchPolicy: 'cache-and-network',
	})

	useEffect(() => {
		if (!isLoggedIn) return
		if (!localStorageIntegrated.integrated) {
			startPolling(POLL_INTERVAL_MS)

			return () => {
				stopPolling()
			}
		} else {
			stopPolling()
		}
	}, [
		localStorageIntegrated.integrated,
		isLoggedIn,
		startPolling,
		stopPolling,
	])

	useEffect(() => {
		if (
			(data?.log_alerts?.length ?? 0) +
				(data?.error_alerts?.length ?? 0) +
				(data?.new_session_alerts?.length ?? 0) +
				(data?.rage_click_alerts?.length ?? 0) +
				(data?.new_user_alerts?.length ?? 0) +
				(data?.track_properties_alerts?.length ?? 0) +
				(data?.user_properties_alerts?.length ?? 0) >
			0
		) {
			analytics.track('integrated-logs', { id: projectId })

			setLocalStorageIntegrated({
				loading: false,
				integrated: true,
				resourceType: 'alerts',
			})
		}
	}, [
		data?.error_alerts?.length,
		data?.log_alerts?.length,
		data?.new_session_alerts?.length,
		data?.new_user_alerts?.length,
		data?.rage_click_alerts?.length,
		data?.track_properties_alerts?.length,
		data?.user_properties_alerts?.length,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}

export const useTeamIntegration = () => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useNumericProjectId()
	const [localStorageIntegrated, setLocalStorageIntegrated] =
		useIntegratedLocalStorage(projectId!, 'team')
	const { data: projectData } = useGetProjectQuery({
		variables: { id: projectId ?? '' },
		skip: !projectId,
	})
	const { data, startPolling, stopPolling } = useGetWorkspaceAdminsQuery({
		variables: { workspace_id: projectData?.workspace?.id ?? '' },
		skip: localStorageIntegrated.integrated || !projectData?.workspace?.id,
		fetchPolicy: 'cache-and-network',
	})

	useEffect(() => {
		if (!isLoggedIn) return
		if (!localStorageIntegrated.integrated) {
			startPolling(POLL_INTERVAL_MS)

			return () => {
				stopPolling()
			}
		} else {
			stopPolling()
		}
	}, [
		localStorageIntegrated.integrated,
		isLoggedIn,
		startPolling,
		stopPolling,
	])

	useEffect(() => {
		if ((data?.admins.length ?? 0) > 1) {
			analytics.track('integrated-team', { id: projectId })

			setLocalStorageIntegrated({
				loading: false,
				integrated: true,
				resourceType: 'team',
			})
		}
	}, [
		data?.admins.length,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}
