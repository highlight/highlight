export default function Page() {
	async function createInvoice(formData: FormData) {
		'use server'

		if (formData.get('isError')) {
			throw new Error(
				'🌋 Server action error: src/app/server-actions/page.tsx',
			)
		}

		console.info(
			'🎉 Server action success: src/app/server-actions/page.tsx',
		)
	}

	return (
		<form action={createInvoice} style={{ padding: '1rem' }}>
			<div style={{ display: 'flex', gap: '1rem' }}>
				<label>Throw error</label>
				<input type="checkbox" name="isError" defaultChecked />

				<button>Submit form</button>
			</div>
		</form>
	)
}
