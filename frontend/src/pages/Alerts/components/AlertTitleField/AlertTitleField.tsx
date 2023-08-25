import { Form, FormState } from '@highlight-run/ui'

import * as styles from './styles.css'

const AlertTitleField = ({ form }: { form: FormState<any> }) => {
	return (
		<Form.Input
			name={String(form.names.name)}
			type="text"
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
