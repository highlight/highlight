import {
	useCreateErrorTagMutation,
	useGetErrorTagsQuery,
} from '@/graph/generated/hooks'

export function ErrorTags() {
	const { data: errorTags, loading } = useGetErrorTagsQuery({
		variables: { project_id: '' },
	})
	const [createErrorTag] = useCreateErrorTagMutation()

	console.log(errorTags, loading)

	return (
		<div>
			<h1>Error Tags</h1>
			<form
				onSubmit={async (e) => {
					e.preventDefault()

					const formData = new FormData(e.target as HTMLFormElement)
					const title = (formData.get('title') as string) || ''
					const description =
						(formData.get('description') as string) || ''

					await createErrorTag({ variables: { title, description } })

					console.log({ formData, title, description })
				}}
			>
				<input type="text" name="title" />
				<input type="text" name="description" />
				<button type="submit">Submit</button>
			</form>
		</div>
	)
}
