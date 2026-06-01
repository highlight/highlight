import { Button } from '@highlight-run/ui/components'
import { CircularSpinner, LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import Tag from '@components/Tag/Tag'
import { toast } from '@components/Toaster'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetWorkspacesQuery, useJoinWorkspaceMutation } from '@graph/hooks'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import styles from './SwitchWorkspace.module.css'

const SwitchWorkspace = () => {
	const [currentWorkspaceId] = useQueryParam('current_workspace', StringParam)

	const [selectedWorkspace, setSelectedWorkspace] = useState('')
	const [actionText, setActionText] = useState('Enter')
	const { setLoadingState } = useAppLoadingContext()
	const navigate = useNavigate()

	const joinWorkspaceMutation = useJoinWorkspaceMutation()
	const [joinWorkspace, { loading: joinLoading }] = joinWorkspaceMutation

	const [shouldRedirect, setShouldRedirect] = useState(false)

	const { loading, data } = useGetWorkspacesQuery()

	if (loading) {
		return <LoadingBar />
	}

	const workspaces = data?.workspaces ?? []

	if (shouldRedirect) {
		return <Navigate to="/" />
	}

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedWorkspace) return

		setLoadingState(AppLoadingState.LOADING)
		joinWorkspace({
			variables: { id: selectedWorkspace },
		})
			.then(() => {
				setShouldRedirect(true)
				toast.success('Switched workspace successfully')
			})
			.catch(() => {
				toast.error('Failed to switch workspace')
				setLoadingState(AppLoadingState.LOADED)
			})
	}

	const workspaceOptions = workspaces.map((w) => ({
		value: w?.id ?? '',
		label: w?.name ?? '',
	}))

	const currentWorkspace = workspaces.find((w) => w?.id === currentWorkspaceId)

	return (
		<div className={styles.box}>
			<Helmet>
				<title>Enter Workspace</title>
			</Helmet>
			<form onSubmit={onSubmit}>
				<h2 className={styles.title}>Enter Workspace</h2>
				<p className={styles.subTitle}>
					Pick a workspace. If you're having trouble getting into
					the correct workspace, reach out to us.
				</p>
				
				{/* @ts-ignore */}
				<Select
					className={styles.fullWidth}
					options={workspaceOptions}
					onChange={(value: string) => {
						setSelectedWorkspace(value)
					}}
					value={selectedWorkspace || currentWorkspace?.id || ''}
					placeholder="Enter a Workspace"
				/>

				<Button
					trackingId="SubmitWorkspaceSwitchForm"
					kind="primary"
					className={styles.button}
					style={{ width: '100%' }}
					htmlType="submit"
					disabled={selectedWorkspace.length === 0}
				>
					{joinLoading ? (
						<CircularSpinner
							style={{
								fontSize: 18,
								color: 'var(--text-primary-inverted)',
							}}
						/>
					) : (
						`${actionText} Workspace`
					)}
				</Button>
				<Button
					trackingId="SwitchWorkspace-CreateWorkspace"
					className={styles.button}
					onClick={() => navigate(`/new`)}
					style={{ width: '100%' }}
					kind="secondary"
				>
					Create a New Workspace
				</Button>
			</form>
		</div>
	)
}

export default SwitchWorkspace