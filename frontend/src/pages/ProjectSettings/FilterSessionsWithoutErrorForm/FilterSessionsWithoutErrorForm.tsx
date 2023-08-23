import { LoadingBar } from '@components/Loading/Loading'
import { Box, IconSolidExclamation } from '@highlight-run/ui'
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
			key: 'Filter sessions without errors',
			message:
				'Filter newly created sessions without an error. Any session filtered out will not count towards your billing quota.',
			checked: filterSessionsWithoutError,
			warning:
				'Excluding sessions without errors will not store any session without an error.',
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
					{c.warning && (
						<Box
							p="8"
							borderRadius="8"
							border="dividerWeak"
							backgroundColor="neutral"
							style={{
								alignItems: 'center',
								display: 'flex',
								flexDirection: 'row',
							}}
						>
							<IconSolidExclamation size={14} color="neutral" />
							{c.warning}
						</Box>
					)}
				</BorderBox>
			))}
		</>
	)
}
