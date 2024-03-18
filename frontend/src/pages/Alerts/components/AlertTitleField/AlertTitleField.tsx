import { Form, FormState } from '@highlight-run/ui/components'

import { AlertForm } from '@/pages/Alerts/utils/AlertsUtils'

import * as styles from './styles.css'

const AlertTitleField = () => {
	const formStore = Form.useContext() as FormState<AlertForm>
	const errors = formStore.useState('errors')

	return (
		<Form.Input
			name={formStore.names.name}
			placeholder="Type name..."
			style={{
				borderColor: errors.name
					? 'var(--color-red-500)'
					: 'transparent',
			}}
			className={styles.formTitle}
		/>
	)
}

export default AlertTitleField
