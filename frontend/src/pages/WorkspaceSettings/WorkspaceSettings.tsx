import { useAuthContext } from '@/authentication/AuthContext'
import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { AdminRole } from '@graph/schemas'
import {
	Box,
	Button,
	Callout,
	Form,
	IconSolidCheck,
	IconSolidLoading,
	Input,
	SwitchButton,
	Tooltip,
} from '@highlight-run/ui/components'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { Authorization } from '@util/authorization/authorization'

import {
	AutoJoinCheckboxProps,
	AutoJoinTooltipProps,
	BaseAutoJoinForm,
} from '@/pages/WorkspaceTeam/components/BaseAutoJoinForm'
import clsx from 'clsx'
import React from 'react'
import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
import {
	BaseFieldsForm,
	FormButtonProps,
	FormElementProps,
	FormInputProps,
} from './FieldsForm/BaseFieldsForm'
import styles from './WorkspaceSettings.module.css'

const WorkspaceSettings = () => {
	const { currentWorkspace } = useApplicationContext()
	const { workspaceRole } = useAuthContext()
	const isAdminRole = workspaceRole === AdminRole.Admin
	const autoJoinSwitch: React.FC<AutoJoinCheckboxProps> = ({
		className,
		onChange,
		checked,
	}) => (
		<SwitchButton
			className={clsx(className, styles.checkbox)}
			onClick={() => {
				onChange(!checked)
			}}
			iconLeft={<IconSolidCheck />}
			checked={checked}
		/>
	)

	const autoJoinTooltip: React.FC<AutoJoinTooltipProps> = ({
		title,
		children,
		...props
	}) => (
		<Tooltip trigger={children} {...props}>
			{title}
		</Tooltip>
	)

	const FieldsForm = () => {
		const form: React.FC<FormElementProps> = (props) => <Form {...props} />
		const input: React.FC<FormInputProps> = ({ name, ...props }) => (
			<Input name={name || ''} {...props} />
		)
		const button: React.FC<FormButtonProps> = ({
			isSubmitting,
			...props
		}) => (
			<Button size="medium" kind="primary" {...props}>
				{isSubmitting ? (
					<IconSolidLoading
						className={styles.spinner}
						style={{
							fontSize: 18,
							color: 'var(--text-primary-inverted)',
							animationName: styles.spin,
						}}
					/>
				) : (
					'Save'
				)}
			</Button>
		)

		return (
			<BaseFieldsForm
				defaultName={currentWorkspace?.name}
				disabled={!isAdminRole}
				form={form}
				input={input}
				button={button}
			/>
		)
	}

	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<div className={styles.container}>
					<div className={styles.titleContainer}>
						<div>
							<h3>Properties</h3>
							<p className={layoutStyles.subTitle}>
								Manage your workspace details.
							</p>
						</div>
					</div>
					<FieldsBox id="workspace">
						<FieldsForm />
					</FieldsBox>
					<FieldsBox id="autojoin">
						<h3>Auto Join</h3>
						<p>
							Enable auto join to allow anyone with an approved
							email origin join.
						</p>
						<Authorization
							allowedRoles={[AdminRole.Admin]}
							forbiddenFallback={
								<Callout
									kind="warning"
									title="You don't have access to auto-access domains."
								>
									You don't have permission to configure
									auto-access domains. Please contact a
									workspace admin to make changes.
								</Callout>
							}
						>
							<BaseAutoJoinForm
								checkbox={autoJoinSwitch}
								tooltip={autoJoinTooltip}
							/>
						</Authorization>
					</FieldsBox>
				</div>
			</Box>
		</Box>
	)
}

export default WorkspaceSettings
