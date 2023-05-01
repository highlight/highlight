import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { LoadingBar } from '@components/Loading/Loading'
import Switch from '@components/Switch/Switch'
import { useEditProjectMutation, useGetProjectQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Box } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useEffect, useState } from 'react'

const OptInRow = (
	key: string,
	label: string | React.ReactNode,
	checked: boolean,
	setState: (n: boolean) => void,
) => {
	return (
		<Switch
			key={key}
			label={
				<Box display="flex" alignItems="center" gap="2">
					{label}
				</Box>
			}
			trackingId={`switch-${label}`}
			checked={checked}
			onChange={setState}
		/>
	)
}

export const FilterExtensionForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const [filterChromeExtension, setfilterChromeExtension] =
		useState<boolean>(false)
	const { data, loading } = useGetProjectQuery({
		variables: {
			id: project_id!,
		},
		skip: !project_id,
	})

	const [editProject] = useEditProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetProjects,
			namedOperations.Query.GetProject,
		],
	})

	useEffect(() => {
		if (!loading) {
			setfilterChromeExtension(
				data?.project?.filter_chrome_extension || false,
			)
		}
	}, [data?.project?.filter_chrome_extension, loading])

	if (loading) {
		return <LoadingBar />
	}

	const categories = [
		{
			key: 'Filter errors thrown by Chrome extensions.',
			message: 'Filter Chrome extensions ',
			label: (
				<p>
					Filter errors thrown by Chrome extensions. (read the{' '}
					<a
						href="https://www.highlight.io/docs/general/product-features/error-monitoring/ignoring-errors#ignore-errors-emitted-by-chrome-extensions"
						target="_blank"
						rel="noreferrer"
					>
						docs
					</a>
					)
				</p>
			),
			checked: filterChromeExtension,
		},
	]

	return (
		<FieldsBox id="errors">
			<p>
				{categories.map((c) =>
					OptInRow(c.key, c.label, c.checked, (isOptIn: boolean) => {
						editProject({
							variables: {
								id: project_id!,
								filter_chrome_extension: isOptIn,
							},
						})
							.then(() => {
								message.success(
									`${c.message} turned ${
										isOptIn ? 'on' : 'off'
									} successfully`,
								)
							})
							.catch((reason: any) => {
								message.error(String(reason))
							})
					}),
				)}
			</p>
		</FieldsBox>
	)
}
