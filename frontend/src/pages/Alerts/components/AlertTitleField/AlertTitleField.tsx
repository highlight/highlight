import { Form, FormState, useForm } from '@highlight-run/ui'

import { AlertForm } from '@/pages/Alerts/utils/AlertsUtils'

import * as styles from './styles.css'

const AlertTitleField = () => {
	const form = useForm() as FormState<AlertForm>
	return (
		<Form.Input
			name={form.names.name}
			value={form.values.name}
			placeholder="Type name..."
			style={{
				borderColor: form.errors.name
					? 'var(--color-red-500)'
					: 'transparent',
			}}
			className={styles.formTitle}
		/>
	)
}

export default AlertTitleField
