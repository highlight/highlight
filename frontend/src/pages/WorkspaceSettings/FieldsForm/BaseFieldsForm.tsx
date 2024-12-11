import { toast } from '@components/Toaster'
import {
	useEditProjectMutation,
	useEditWorkspaceMutation,
	useGetProjectOrWorkspaceQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IconSolidLoading } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import {
	ComponentPropsWithoutRef,
	ComponentType,
	useEffect,
	useState,
} from 'react'
import commonStyles from '../../../Common.module.css'
import { LoadingBar } from '../../../components/Loading/LoadingBar'
import styles from './FieldsForm.module.css'

export type FormElementProps = ComponentPropsWithoutRef<'form'>
export type FormInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'size'>
export type FormButtonProps = ComponentPropsWithoutRef<'button'> & {
	isSubmitting?: boolean
}

export const BaseFieldsForm: React.FC<{
	form: ComponentType<FormElementProps>
	input: ComponentType<FormInputProps>
	button: ComponentType<FormButtonProps>
}> = (props) => {
	const Form = props.form
	const Input = props.input
	const Button = props.button
	const { project_id, workspace_id } = useParams<{
		project_id: string
		workspace_id: string
	}>()
	const isWorkspace = !!workspace_id
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const { data, loading } = useGetProjectOrWorkspaceQuery({
		variables: {
			project_id: project_id!,
			workspace_id: workspace_id!,
			is_workspace: isWorkspace,
		},
		skip: !project_id || !workspace_id,
	})

	const [editProject, { loading: editProjectLoading }] =
		useEditProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetProjects,
				namedOperations.Query.GetProject,
			],
		})

	const [editWorkspace, { loading: editWorkspaceLoading }] =
		useEditWorkspaceMutation()

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (isWorkspace) {
			editWorkspace({
				variables: {
					id: workspace_id,
					name,
				},
			}).then(() => {
				toast.success('Updated workspace fields!', { duration: 5000 })
			})
		} else {
			editProject({
				variables: {
					id: project_id!,
					name,
					billing_email: email,
				},
			}).then(() => {
				toast.success('Updated project fields!', { duration: 5000 })
			})
		}
	}

	const editingObj = isWorkspace ? data?.workspace : data?.project

	useEffect(() => {
		if (!loading) {
			setName(editingObj?.name || '')
			setEmail(data?.project?.billing_email || '')
		}
	}, [data?.project?.billing_email, editingObj?.name, loading])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<Form onSubmit={onSubmit} key={project_id}>
			<div className={styles.fieldRow}>
				<label className={styles.fieldKey}>Name</label>
				<Input
					name="name"
					value={name}
					className={styles.input}
					onChange={(e) => {
						setName(e.target.value)
					}}
				/>
			</div>
			{isWorkspace ? null : (
				<>
					{' '}
					<div className={styles.fieldRow}>
						<label className={styles.fieldKey}>Billing Email</label>
						<Input
							placeholder="Billing Email"
							type="email"
							name="email"
							value={email}
							className={styles.input}
							onChange={(e) => {
								setEmail(e.target.value)
							}}
						/>
					</div>
				</>
			)}
			<div className={styles.fieldRow}>
				<div className={styles.fieldKey} />
				<Button
					type="submit"
					// kind="primary"
					className={clsx(
						commonStyles.submitButton,
						styles.saveButton,
					)}
					// size="medium"
					isSubmitting={editProjectLoading || editWorkspaceLoading}
				>
					{editProjectLoading || editWorkspaceLoading ? (
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
			</div>
		</Form>
	)
}
