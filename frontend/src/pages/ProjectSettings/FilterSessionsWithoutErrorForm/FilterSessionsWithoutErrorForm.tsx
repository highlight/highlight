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
					<hr
						style={{
							border: 0,
							height: '1px',
							backgroundColor: '#E4E2E4',
						}}
					/>
					{c.warning && (
						<Box
							p="8"
							gap="8"
							borderRadius="8"
							border="dividerWeak"
							style={{
								display: 'flex',
								color: '#6F6E77',
								fontWeight: '500',
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: '#F4F2F4',
								fontSize: '13px',
							}}
						>
							<IconSolidExclamation
								size={14}
								opacity="0.8"
								color="#6F6E77"
							/>
							{c.warning}
						</Box>
					)}
				</BorderBox>
			))}
		</>
	)
}
