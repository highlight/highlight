import { Form, FormState, useForm } from '@highlight-run/ui'

import { AlertForm } from '@/pages/Alerts/utils/AlertsUtils'

import * as styles from './styles.css'

const AlertTitleField = () => {
	const formStore = useForm() as FormState<AlertForm>
	const formState = formStore.getState()

	return (
		<Form.Input
			name={formStore.names.name}
			placeholder="Type name..."
			style={{
				borderColor: formState.errors.name
					? 'var(--color-red-500)'
					: 'transparent',
			}}
			className={styles.formTitle}
		/>
	)
}

export default AlertTitleField
