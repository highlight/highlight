import Button from '@components/Button/Button/Button'
import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import { CircularSpinner, LoadingBar } from '@components/Loading/Loading'
import Select from '@components/Select/Select'
import Tag from '@components/Tag/Tag'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetWorkspacesQuery, useJoinWorkspaceMutation } from '@graph/hooks'
import { message } from 'antd'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, useLocation } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import styles from './SwitchWorkspace.module.css'

const SwitchWorkspace = () => {
	const [currentWorkspaceId] = useQueryParam('current_workspace', StringParam)

	const [selectedWorkspace, setSelectedWorkspace] = useState('')
	const [actionText, setActionText] = useState('Enter')
	const { setLoadingState } = useAppLoadingContext()

	const joinWorkspaceMutation = useJoinWorkspaceMutation()
	const [joinWorkspace, { loading: joinLoading }] = joinWorkspaceMutation

	const [shouldRedirect, setShouldRedirect] = useState(false)

	const { loading, data } = useGetWorkspacesQuery()

	const { search } = useLocation()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	useEffect(() => {
		if (!loading) {
			if (
				!!data?.workspaces &&
				data.workspaces.some(
					(workspace) =>
						!!workspace?.id && workspace.id === selectedWorkspace,
				)
			) {
				setActionText('Enter')
			} else if (
				!!data?.joinable_workspaces &&
				data.joinable_workspaces.some(
					(workspace) =>
						!!workspace?.id && workspace.id === selectedWorkspace,
				)
			) {
				setActionText('Join')
			}
		}
	}, [
		loading,
		data?.workspaces,
		data?.joinable_workspaces,
		selectedWorkspace,
	])

	if (loading) {
		return <LoadingBar />
	}

	const workspaceOptions = (data?.workspaces || [])
		?.map((workspace) => ({
			value: workspace?.id || '',
			displayValue: workspace?.name || '',
			id: workspace?.id || '',
		}))
		.concat(
			(data?.joinable_workspaces || [])?.map((workspace) => ({
				value: workspace?.id || '',
				displayValue: workspace?.name || '',
				id: workspace?.id || '',
				dropDownIcon: (
					<Tag
						className={styles.joinButton}
						infoTooltipText="Your email domain is whitelisted by this workspace!"
						backgroundColor="var(--color-purple)"
						color="var(--color-white)"
					>
						Join
					</Tag>
				),
			})),
		)

	const currentWorkspace = workspaceOptions?.find(
		(workspace) => workspace.id === currentWorkspaceId,
	)

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (
			!!data?.workspaces &&
			data.workspaces.some(
				(workspace) =>
					!!workspace?.id && workspace.id === selectedWorkspace,
			)
		) {
			setShouldRedirect(true)
		} else if (
			!!data?.joinable_workspaces &&
			data.joinable_workspaces.some(
				(workspace) =>
					!!workspace?.id && workspace.id === selectedWorkspace,
			)
		) {
			joinWorkspace({
				variables: { workspace_id: selectedWorkspace },
			}).then((result) => {
				if (!!result.data?.joinWorkspace) {
					message.success('Successfuly joined workspace!', 1)
					setShouldRedirect(true)
				}
			})
		}
	}

	if (shouldRedirect) {
		if (actionText === 'Join') {
			return <Navigate to={`/w/${selectedWorkspace}/switch${search}`} />
		}
		return <Navigate to={`/w/${selectedWorkspace}${search}`} />
	}

	return (
		<>
			<Helmet>
				<title>Enter Workspace</title>
			</Helmet>
			<div className={styles.box}>
				<form onSubmit={onSubmit}>
					<h2 className={styles.title}>Enter Workspace</h2>
					<p className={styles.subTitle}>
						Pick a workspace. If you’re having trouble getting into
						the correct workspace, reach out to us.
					</p>
					<Select
						className={styles.fullWidth}
						options={workspaceOptions}
						onChange={(workspaceId) => {
							setSelectedWorkspace(workspaceId)
						}}
						value={currentWorkspace?.value}
						placeholder="Enter a Workspace"
					/>
					<Button
						trackingId="SubmitWorkspaceSwitchForm"
						type="primary"
						className={styles.button}
						block
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
					<ButtonLink
						trackingId="SwitchWorkspace-CreateWorkspace"
						className={styles.button}
						to={`/new${search}`}
						fullWidth
						type="default"
					>
						Create a New Workspace
					</ButtonLink>
				</form>
			</div>
		</>
	)
}

export default SwitchWorkspace
