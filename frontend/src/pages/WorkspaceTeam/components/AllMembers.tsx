import { useAuthContext } from '@authentication/AuthContext'
import { AdminAvatar } from '@components/Avatar/Avatar'
import {
	useChangeAdminRoleMutation,
	useChangeProjectMembershipMutation,
	useDeleteAdminFromWorkspaceMutation,
	useGetWorkspaceSettingsQuery,
} from '@graph/hooks'
import { AdminRole, Project, WorkspaceAdminRole } from '@graph/schemas'
import {
	Box,
	ComboboxSelect,
	IconSolidCheveronDown,
	IconSolidDotsHorizontal,
	IconSolidSortAscending,
	IconSolidSortDescending,
	IconSolidXCircle,
	Menu,
	Stack,
	Table,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { getDisplayNameFromEmail } from '@util/string'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { toast } from '@/components/Toaster'
import {
	ChangeAdminRoleMutation,
	ChangeProjectMembershipMutation,
	namedOperations,
} from '@/graph/generated/operations'
import { useAuthorization } from '@/util/authorization/authorization'
import { POLICY_NAMES } from '@/util/authorization/authorizationPolicies'

import * as style from './AllMembers.css'

type Option = {
	key: string
	value: AdminRole
	render: string
}

const ALL_KEY = 'All'
const ALL_OPTION = { key: ALL_KEY, value: AdminRole.Member, render: ALL_KEY }

export const PopoverCell = <T extends string[] | string>({
	options,
	initialSelection,
	onChange,
	label,
	filter,
	disabledReason,
}: {
	options?: Option[]
	initialSelection: T
	onChange: (selection: T) => void
	label: string
	filter?: boolean
	disabledReason?: string
}) => {
	const [query, setQuery] = useState('')

	let initialCopy = initialSelection
	let selectionKey = ''
	if (initialCopy instanceof Array) {
		if (initialCopy.length === 0) {
			// @ts-ignore
			initialCopy = [ALL_KEY]
		}
		selectionKey = initialCopy.join('')
	} else {
		selectionKey = initialCopy
	}
	useEffect(() => {
		setSelection(initialCopy)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectionKey])

	const [selection, setSelection] = useState<T>(initialCopy)
	const isMultiSelect =
		initialCopy instanceof Array && selection instanceof Array

	const [changed, setChanged] = useState(false)

	if (!options) {
		return null
	}
	if (isMultiSelect) {
		options = [ALL_OPTION].concat(options)
	}
	const filteredOptions = filter
		? options.filter((o) =>
				o.render.toLowerCase().includes(query.toLowerCase()),
			)
		: options
	const selectionSet = isMultiSelect
		? new Set(initialCopy)
		: new Set([initialCopy])
	// @ts-ignore
	const selectedOptions = options.filter((o) => selectionSet.has(o.key))
	const selectedText = `${selectedOptions[0].render}${
		selectedOptions.length > 1 ? ` +${selectedOptions.length - 1}` : ''
	}`
	const isDisabled = disabledReason !== undefined
	let inner = (
		<ComboboxSelect
			label={label}
			value={selection}
			valueRender={
				<Stack
					direction="row"
					width="full"
					gap="4"
					alignItems="center"
					cssClass={clsx(style.comboboxText, {
						[style.disabled]: isDisabled,
					})}
				>
					<Text lines="1">{selectedText}</Text>
					<IconSolidCheveronDown size={12} />
				</Stack>
			}
			options={filteredOptions}
			onChange={(value) => {
				setChanged(true)
				if (value instanceof Array) {
					if (selection.includes(ALL_KEY) && value.length > 1) {
						// @ts-ignore
						value = value.filter((v) => v !== ALL_KEY)
					} else if (value.length === 0 || value.includes(ALL_KEY)) {
						// @ts-ignore
						value = [ALL_KEY]
					}
				}
				setSelection(value)
				if (!isMultiSelect) {
					onChange(value)
				}
			}}
			onChangeQuery={isMultiSelect ? setQuery : undefined}
			onClose={
				isMultiSelect && changed
					? () => {
							let value: string[] = selection
							if (value.includes(ALL_KEY)) {
								value = value.filter((v) => v !== ALL_KEY)
							}
							if (isMultiSelect) {
								// @ts-ignore
								onChange(value)
							}
							setChanged(false)
						}
					: undefined
			}
			cssClass={style.combobox}
			wrapperCssClass={style.comboboxWrapper}
			queryPlaceholder={`Search ${label}`}
			disabled={isDisabled}
		/>
	)

	if (isDisabled) {
		inner = (
			<Tooltip delayed trigger={inner}>
				{disabledReason}
			</Tooltip>
		)
	}

	return inner
}

export const RoleOptions: Option[] = [
	{
		key: AdminRole.Member,
		value: AdminRole.Member,
		render: 'Member',
	},
	{
		key: AdminRole.Admin,
		value: AdminRole.Admin,
		render: 'Admin',
	},
]

const GRID_COLUMNS = ['3fr', '3fr', 'auto', '1fr', '2fr', '30px']

const DISABLED_REASON_NOT_ADMIN =
	'You must have Admin role to update user access.'
const DISABLED_REASON_IS_SELF = 'You cannot update your own access.'
export const DISABLED_REASON_IS_ADMIN = 'Admins have access to all projects.'
export const DISABLED_REASON_NOT_ENTERPRISE =
	'Manage project access with an enterprise plan.'

const AllMembers = ({
	workspaceId,
	admins,
	projects,
	loading,
}: {
	workspaceId?: string
	admins?: WorkspaceAdminRole[]
	projects?: Project[] | null | undefined
	loading: boolean
}) => {
	const { checkPolicyAccess } = useAuthorization()
	const canUpdateRoles = checkPolicyAccess({
		policyName: POLICY_NAMES.RolesUpdate,
	})

	const { data: workspaceSettings } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: workspaceId! },
		skip: !workspaceId,
	})

	// Sorting state
	const [sortColumn, setSortColumn] = useState<string | null>(null)
	const [sortAsc, setSortAsc] = useState(true)

	// Sort handler
	const handleSort = (column: string) => {
		if (sortColumn === column) {
			setSortAsc(!sortAsc)
		} else {
			setSortColumn(column)
			setSortAsc(true)
		}
	}

	// Sorted admins
	const sortedAdmins = useMemo(() => {
		if (!admins || !sortColumn) {
			return admins
		}

		const sorted = [...admins].sort((a, b) => {
			let aValue: any = null
			let bValue: any = null

			switch (sortColumn) {
				case 'name':
					aValue =
						a.admin.name || getDisplayNameFromEmail(a.admin.email)
					bValue =
						b.admin.name || getDisplayNameFromEmail(b.admin.email)
					break
				case 'email':
					aValue = a.admin.email
					bValue = b.admin.email
					break
				case 'role':
					aValue = a.role
					bValue = b.role
					break
				case 'lastActive':
					aValue = a.admin.updated_at
						? new Date(a.admin.updated_at).getTime()
						: 0
					bValue = b.admin.updated_at
						? new Date(b.admin.updated_at).getTime()
						: 0
					break
				default:
					return 0
			}

			if (aValue < bValue) return sortAsc ? -1 : 1
			if (aValue > bValue) return sortAsc ? 1 : -1
			return 0
		})

		return sorted
	}, [admins, sortColumn, sortAsc])

	const canUpdateProjects =
		workspaceSettings?.workspaceSettings?.enable_project_level_access ??
		false

	const { admin: self } = useAuthContext()
	const [deleteAdminFromWorkspace, deleteContext] =
		useDeleteAdminFromWorkspaceMutation({
			refetchQueries: [namedOperations.Query.GetWorkspaceAdmins],
		})
	const [changeAdminRole] = useChangeAdminRoleMutation()
	const [changeProjectMembership] = useChangeProjectMembershipMutation()

	const projectOptions = projects?.map((p) => ({
		key: p.id,
		value: AdminRole.Admin,
		render: p.name,
	}))

	const getOptimisticResponse = (
		adminId: string,
		role: string,
		projectIds: string[],
	):
		| ChangeProjectMembershipMutation['changeProjectMembership']
		| ChangeAdminRoleMutation['changeAdminRole'] => {
		if (role === AdminRole.Admin) {
			projectIds = []
		}
		return {
			workspaceId: workspaceId!,
			admin: {
				id: adminId,
				__typename: 'Admin',
			},
			role: role,
			projectIds: projectIds,
			__typename: 'WorkspaceAdminRole',
		}
	}

	if (loading) {
		return <LoadingBox />
	}

	const getSortIcon = (column: string) => {
		if (sortColumn !== column) return null
		return sortAsc ? (
			<IconSolidSortAscending size={14} />
		) : (
			<IconSolidSortDescending size={14} />
		)
	}

	return (
		<Table noBorder>
			<Table.Head>
				<Table.Row gridColumns={GRID_COLUMNS}>
					<Table.Header onClick={() => handleSort('name')}>
						<Stack
							direction="row"
							width="full"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text>User</Text>
							{getSortIcon('name')}
						</Stack>
					</Table.Header>
					<Table.Header onClick={() => handleSort('email')}>
						<Stack
							direction="row"
							width="full"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text>Email</Text>
							{getSortIcon('email')}
						</Stack>
					</Table.Header>
					<Table.Header>Project Access</Table.Header>
					<Table.Header onClick={() => handleSort('role')}>
						<Stack
							direction="row"
							width="full"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text>Role</Text>
							{getSortIcon('role')}
						</Stack>
					</Table.Header>
					<Table.Header onClick={() => handleSort('lastActive')}>
						<Stack
							direction="row"
							width="full"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text>Last Active</Text>
							{getSortIcon('lastActive')}
						</Stack>
					</Table.Header>
					<Table.Header></Table.Header>
				</Table.Row>
			</Table.Head>
			<Table.Body>
				{sortedAdmins?.map((wa) => {
					const admin = wa.admin
					const role = wa.role
					const projectIds = wa.projectIds
					const isSelf = self?.id === admin.id
					let disabledProject: string | undefined
					let disabledRole: string | undefined
					if (!canUpdateProjects) {
						disabledProject = DISABLED_REASON_NOT_ENTERPRISE
					}
					if (!canUpdateRoles) {
						disabledProject = DISABLED_REASON_NOT_ADMIN
						disabledRole = DISABLED_REASON_NOT_ADMIN
					}
					if (role === AdminRole.Admin) {
						disabledProject = DISABLED_REASON_IS_ADMIN
					}
					if (isSelf) {
						disabledProject = DISABLED_REASON_IS_SELF
						disabledRole = DISABLED_REASON_IS_SELF
					}
					return (
						<Table.Row key={admin.id} gridColumns={GRID_COLUMNS}>
							<Table.Cell>
								<Stack
									direction="row"
									gap="6"
									alignItems="center"
								>
									<AdminAvatar
										size={20}
										adminInfo={{
											email: admin.email,
											name: admin.name,
											photo_url: admin.photo_url,
										}}
									/>
									<Stack gap="4">
										<Text color="default" lines="1">
											{admin.name
												? admin.name
												: getDisplayNameFromEmail(
														admin.email,
													)}{' '}
											{isSelf && '(You)'}
										</Text>
									</Stack>
								</Stack>
							</Table.Cell>
							<Table.Cell>
								<Stack
									direction="row"
									gap="6"
									alignItems="center"
								>
									<Text color="default" lines="1">
										{admin.email}
									</Text>
								</Stack>
							</Table.Cell>
							<Table.Cell padding="0">
								<PopoverCell
									label="projects"
									options={projectOptions}
									initialSelection={projectIds}
									filter
									disabledReason={disabledProject}
									onChange={(projectIds) => {
										changeProjectMembership({
											variables: {
												workspace_id: workspaceId!,
												admin_id: admin.id,
												project_ids: projectIds,
											},
											optimisticResponse: {
												changeProjectMembership:
													getOptimisticResponse(
														admin.id,
														role,
														projectIds,
													),
											},
										})
											.then(() =>
												toast.success(
													'Updated user projects',
												),
											)
											.catch(() =>
												toast.error(
													'Error updating user projects',
												),
											)
									}}
								/>
							</Table.Cell>
							<Table.Cell padding="0">
								<PopoverCell
									label="roles"
									options={RoleOptions}
									initialSelection={role}
									disabledReason={disabledRole}
									onChange={(role) => {
										changeAdminRole({
											variables: {
												workspace_id: workspaceId!,
												admin_id: admin.id,
												new_role: role,
											},
											optimisticResponse: {
												changeAdminRole:
													getOptimisticResponse(
														admin.id,
														role,
														projectIds,
													),
											},
										})
											.then(() =>
												toast.success(
													'Updated user role',
												),
											)
											.catch(() =>
												toast.error(
													'Error updating user role',
												),
											)
									}}
								/>
							</Table.Cell>
							<Table.Cell>
								<Text color="moderate" size="xSmall" lines="1">
									{admin.updated_at
										? new Date(
												admin.updated_at,
											).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											})
										: 'Never'}
								</Text>
							</Table.Cell>
							<Table.Cell padding="0">
								<Menu>
									<Menu.Button
										cssClass={style.menuButton}
										size="xSmall"
										emphasis="low"
										kind="secondary"
										iconLeft={<IconSolidDotsHorizontal />}
										onClick={(e: any) => {
											e.stopPropagation()
										}}
										disabled={disabledRole !== undefined}
									/>
									<Menu.List>
										<Menu.Item
											disabled={deleteContext.loading}
										>
											<Box
												display="flex"
												alignItems="center"
												gap="4"
												onClick={(e) => {
													e.stopPropagation()
													deleteAdminFromWorkspace({
														variables: {
															workspace_id:
																workspaceId!,
															admin_id: admin.id,
														},
													})
												}}
											>
												<IconSolidXCircle />
												Remove user
											</Box>
										</Menu.Item>
									</Menu.List>
								</Menu>
							</Table.Cell>
						</Table.Row>
					)
				})}
			</Table.Body>
		</Table>
	)
}

export default AllMembers
