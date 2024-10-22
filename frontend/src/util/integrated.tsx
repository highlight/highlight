import { useAuthContext } from '@authentication/AuthContext'
import {
	useGetAlertsPagePayloadQuery,
	useGetClientIntegrationQuery,
	useGetLogsIntegrationQuery,
	useGetProjectQuery,
	useGetServerIntegrationQuery,
	useGetTracesIntegrationQuery,
	useGetWorkspaceAdminsQuery,
} from '@graph/hooks'
import { useNumericProjectId } from '@hooks/useProjectId'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { useEffect } from 'react'

import { IntegrationStatus } from '@/graph/generated/schemas'

const POLL_INTERVAL_MS = 5000

export const useIntegratedLocalStorage = (
	projectId: string | number,
	area: 'client' | 'server' | 'logs' | 'alerts' | 'team' | 'traces',
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

export type LocalStorageIntegrationData = {
	loading: boolean
} & IntegrationStatus

export const useClientIntegration = () => {
	const { admin, isLoggedIn } = useAuthContext()
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
		if (data?.clientIntegration !== undefined && admin?.email) {
			if (
				!localStorageIntegrated.integrated &&
				data?.clientIntegration.integrated
			) {
				analytics.track('integrated-client', { id: projectId })
				analytics.trackGaEvent('integrated_client', {
					email: admin?.email,
				})
			}

			setLocalStorageIntegrated({
				loading: false,
				...data?.clientIntegration,
			})
		}
	}, [
		admin?.email,
		data?.clientIntegration,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}

export const useServerIntegration = () => {
	const { admin, isLoggedIn } = useAuthContext()
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
		if (data?.serverIntegration !== undefined && admin?.email) {
			if (
				!localStorageIntegrated.integrated &&
				data?.serverIntegration.integrated
			) {
				analytics.track('integrated-server', { id: projectId })
				analytics.trackGaEvent('integrated_server', {
					email: admin?.email,
				})
			}

			setLocalStorageIntegrated({
				loading: false,
				...data?.serverIntegration,
			})
		}
	}, [
		admin?.email,
		data?.serverIntegration,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}

export const useLogsIntegration = () => {
	const { admin, isLoggedIn } = useAuthContext()
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
		if (data?.logsIntegration !== undefined && admin?.email) {
			if (
				!localStorageIntegrated.integrated &&
				data?.logsIntegration.integrated
			) {
				analytics.track('integrated-logs', { id: projectId })
				analytics.trackGaEvent('integrated_logs', {
					email: admin?.email,
				})
			}

			setLocalStorageIntegrated({
				loading: false,
				...data?.logsIntegration,
			})
		}
	}, [
		admin?.email,
		data?.logsIntegration,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}

export const useTracesIntegration = () => {
	const { admin, isLoggedIn } = useAuthContext()
	const { projectId } = useNumericProjectId()
	const [localStorageIntegrated, setLocalStorageIntegrated] =
		useIntegratedLocalStorage(projectId!, 'traces')

	const { data, startPolling, stopPolling } = useGetTracesIntegrationQuery({
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
		if (data?.tracesIntegration !== undefined && admin?.email) {
			if (
				!localStorageIntegrated.integrated &&
				data?.tracesIntegration.integrated
			) {
				analytics.track('integrated-traces', { id: projectId })
				analytics.trackGaEvent('integrated_traces', {
					email: admin?.email,
				})
			}

			setLocalStorageIntegrated({
				loading: false,
				...data?.tracesIntegration,
			})
		}
	}, [
		admin?.email,
		data?.tracesIntegration,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}

export const useAlertsIntegration = () => {
	const { isLoggedIn, admin } = useAuthContext()
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
		if (admin?.email && (data?.alerts?.length ?? 0) > 0) {
			analytics.track('integrated-alerts', { id: projectId })
			analytics.trackGaEvent('integrated_alerts', {
				email: admin?.email,
			})

			setLocalStorageIntegrated({
				loading: false,
				integrated: true,
				resourceType: 'alerts',
			})
		}
	}, [
		admin?.email,
		data?.alerts?.length,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}

export const useTeamIntegration = () => {
	const { admin, isLoggedIn } = useAuthContext()
	const { projectId } = useNumericProjectId()
	const [localStorageIntegrated, setLocalStorageIntegrated] =
		useIntegratedLocalStorage(projectId!, 'team')
	const { data: projectData } = useGetProjectQuery({
		variables: { id: projectId ?? '' },
		skip: !projectId,
	})
	const { data, startPolling, stopPolling } = useGetWorkspaceAdminsQuery({
		variables: { workspace_id: projectData?.project?.workspace?.id ?? '' },
		skip:
			localStorageIntegrated.integrated ||
			!projectData?.project?.workspace?.id,
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
		if (admin?.email && (data?.admins.length ?? 0) > 1) {
			analytics.track('integrated-team', { id: projectId })
			analytics.trackGaEvent('integrated_team', {
				email: admin?.email,
			})

			setLocalStorageIntegrated({
				loading: false,
				integrated: true,
				resourceType: 'team',
			})
		}
	}, [
		admin?.email,
		data?.admins.length,
		localStorageIntegrated.integrated,
		projectId,
		setLocalStorageIntegrated,
	])

	return localStorageIntegrated
}
