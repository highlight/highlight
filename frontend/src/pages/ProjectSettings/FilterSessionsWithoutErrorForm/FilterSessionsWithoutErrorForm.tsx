import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { LoadingBar } from '@components/Loading/Loading'
import Switch from '@components/Switch/Switch'
import { namedOperations } from '@graph/operations'
import { Box } from '@highlight-run/ui'
import { message } from 'antd'
import { useEffect, useState } from 'react'

import {
	useEditProjectFilterSettingsMutation,
	useGetProjectFilterSettingsQuery,
} from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'

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

export const FilterSessionsWithoutErrorForm = () => {
	const { projectId } = useProjectId()

	const [filterSessionsWithoutError, setFilterSessionsWithoutError] =
		useState<boolean>(false)
	const { data, loading } = useGetProjectFilterSettingsQuery({
		variables: {
			projectId,
		},
	})

	const [editProjectFilterSettingsMutation] =
		useEditProjectFilterSettingsMutation({
			refetchQueries: [namedOperations.Query.GetProjectFilterSettings],
		})

	useEffect(() => {
		if (!loading) {
			setFilterSessionsWithoutError(
				data?.projectFilterSettings?.filterSessionsWithoutError ??
					false,
			)
		}
	}, [data?.projectFilterSettings?.filterSessionsWithoutError, loading])

	if (loading) {
		return <LoadingBar />
	}

	const categories = [
		{
			key: 'Filter sessions without an error',
			message: 'Filter sessions without an error',
			label: (
				<p>
					Filter sessions without an error (read the{' '}
					<a
						href="https://www.highlight.io/docs/general/product-features/session-replay/ignoring-sessions#ignore-sessions-without-an-error"
						target="_blank"
						rel="noreferrer"
					>
						docs
					</a>
					).
				</p>
			),
			checked: filterSessionsWithoutError,
		},
	]

	return (
		<FieldsBox id="errors">
			<p>
				{categories.map((c) =>
					OptInRow(c.key, c.label, c.checked, (isOptIn: boolean) => {
						editProjectFilterSettingsMutation({
							variables: {
								projectId,
								filterSessionsWithoutError: isOptIn,
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
