import { useAuthContext } from '@authentication/AuthContext'
import {
	useIsBackendIntegratedLazyQuery,
	useIsIntegratedLazyQuery,
} from '@graph/hooks'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useState } from 'react'

export const useIntegrated = (): { integrated: boolean; loading: boolean } => {
	const { isLoggedIn, isAuthLoading } = useAuthContext()
	const { project_id } = useParams<{ project_id: string }>()
	const [query, { data, loading }] = useIsIntegratedLazyQuery({
		variables: { project_id: project_id! },
		fetchPolicy: 'cache-and-network',
	})
	const [localStorageIntegrated, setLocalStorageIntegrated] = useLocalStorage(
		`highlight-${project_id}-integrated`,
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
			}, 5000)
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
				analytics.track('IntegratedProject', { id: project_id })
			}
		}
	}, [
		integratedRaw,
		localStorageIntegrated,
		project_id,
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

export const useBackendIntegrated = (): {
	integrated: boolean
	loading: boolean
} => {
	const { isLoggedIn, isAuthLoading } = useAuthContext()
	const { project_id } = useParams<{ project_id: string }>()
	const [query, { data, loading }] = useIsBackendIntegratedLazyQuery({
		variables: { project_id: project_id?.toString() ?? '' },
		fetchPolicy: 'cache-and-network',
	})
	const [localStorageIntegrated, setLocalStorageIntegrated] = useLocalStorage(
		`highlight-${project_id}-backend-integrated`,
		false,
	)
	const [integrated, setIntegrated] = useState<boolean | undefined>(undefined)
	const [loadingState, setLoadingState] = useState(true)
	const integratedRaw = data?.isBackendIntegrated

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
			}, 5000)
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
				analytics.track('IntegratedProjectBackend', { id: project_id })
			}
		}
	}, [
		integratedRaw,
		localStorageIntegrated,
		project_id,
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
