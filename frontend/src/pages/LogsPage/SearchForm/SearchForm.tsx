import { Form, useFormState } from '@highlight-run/ui'
import React from 'react'

type Props = {
	onFormSubmit: (query: string) => void
	query: string
}

const SearchForm = ({ query, onFormSubmit }: Props) => {
	const form = useFormState({
		defaultValues: {
			search: query,
		},
	})

	form.useSubmit(async () => {
		onFormSubmit(form.values.search)
	})

	return (
		<Form state={form}>
			<Form.Input
				name={form.names.search}
				placeholder="Search your logs..."
			/>
		</Form>
	)
}

export { SearchForm }
