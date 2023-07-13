import { LoadingBar } from '@components/Loading/Loading'
import { useEffect, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import { ToggleRow } from '@/components/ToggleRow/ToggleRow'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

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
			key: 'Exclude sessions without errors',
			message: 'Filter sessions without an error',
			checked: filterSessionsWithoutError,
		},
	]

	return (
		<>
			{categories.map((c) => (
				<BorderBox key={c.key}>
					{ToggleRow(
						c.key,
						c.message,
						c.checked,
						(isOptIn: boolean) => {
							setFilterSessionsWithoutError(isOptIn)
							setAllProjectSettings((currentProjectSettings) =>
								currentProjectSettings?.projectSettings
									? {
											projectSettings: {
												...currentProjectSettings.projectSettings,
												filterSessionsWithoutError:
													isOptIn,
											},
									  }
									: currentProjectSettings,
							)
						},
						false,
					)}
				</BorderBox>
			))}
		</>
	)
}
