import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { LoadingBar } from '@components/Loading/Loading'
import Switch from '@components/Switch/Switch'
import { useEditProjectMutation, useGetProjectQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Box } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useEffect, useState } from 'react'

const OptInRow = (
	label: string,
	info: string | undefined,
	checked: boolean,
	setState: (n: boolean) => void,
) => {
	return (
		<Switch
			key={label}
			label={
				<Box display="flex" alignItems="center" gap="2">
					{label}
					{info && (
						<InfoTooltip
							placement="right"
							size="medium"
							title={info}
						/>
					)}
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
			label: 'Chrome extension',
			info: 'Hide Chrome extension stack frames from errors.',
			checked: filterChromeExtension,
		},
	]

	return (
		<FieldsBox id="errors">
			<h3>Filter Browser Extension</h3>

			<p>
				{categories.map((c) =>
					OptInRow(c.label, c.info, c.checked, (isOptIn: boolean) => {
						editProject({
							variables: {
								id: project_id!,
								filter_chrome_extension: isOptIn,
							},
						})
							.then(() => {
								message.success(
									`${c.label} turns ${
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
