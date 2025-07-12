import { useAuthContext } from '@/authentication/AuthContext'
import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { AdminRole } from '@graph/schemas'

import { IconAnimatedLoading } from '@/components/Loading/IconAnimatedLoading'
import { AutoJoinForm } from '@/pages/WorkspaceTeam/components/AutoJoinForm'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'

import { Box, Button, Callout, Form, Input } from '@highlight-run/ui/components'
import { Authorization } from '@util/authorization/authorization'
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

	const FieldsForm = () => {
		const form: React.FC<FormElementProps> = (props) => <Form {...props} />
		const input: React.FC<FormInputProps> = ({ name, ...props }) => (
			<Input name={name || ''} {...props} />
		)
		const button: React.FC<FormButtonProps> = ({
			isSubmitting,
			className,
			...props
		}) => (
			<Button
				className={clsx(className, styles.submitButton)}
				size="medium"
				kind="primary"
				{...props}
			>
				{isSubmitting ? (
					<IconAnimatedLoading
						style={{
							fontSize: 18,
							color: 'var(--text-primary-inverted)',
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
							<AutoJoinForm />
						</Authorization>
					</FieldsBox>
				</div>
			</Box>
		</Box>
	)
}

export default WorkspaceSettings
