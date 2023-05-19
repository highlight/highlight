import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { LoadingBar } from '@components/Loading/Loading'
import Switch from '@components/Switch/Switch'
import { Box } from '@highlight-run/ui'
import { useEffect, useState } from 'react'

import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

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
	const [filterSessionsWithoutError, setFilterSessionsWithoutError] =
		useState<boolean>(false)
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	useEffect(() => {
		if (!loading) {
			setFilterSessionsWithoutError(
				data?.projectSettings?.filterSessionsWithoutError ?? false,
			)
		}
	}, [data?.projectSettings?.filterSessionsWithoutError, loading])

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
						setFilterSessionsWithoutError(isOptIn)
						setAllProjectSettings((currentProjectSettings) =>
							currentProjectSettings?.projectSettings
								? {
										projectSettings: {
											...currentProjectSettings.projectSettings,
											filterSessionsWithoutError: isOptIn,
										},
								  }
								: currentProjectSettings,
						)
					}),
				)}
			</p>
		</FieldsBox>
	)
}
