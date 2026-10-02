import { LoadingBar } from '@components/Loading/Loading'
import { Box } from '@highlight-run/ui/components'
import { useEffect, useState } from 'react'

import { ToggleRow } from '@/components/ToggleRow/ToggleRow'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

export const FilterExtensionForm = () => {
	const [filterChromeExtension, setfilterChromeExtension] =
		useState<boolean>(false)
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	useEffect(() => {
		if (!loading) {
			setfilterChromeExtension(
				data?.projectSettings?.filter_chrome_extension ?? false,
			)
		}
	}, [data?.projectSettings?.filter_chrome_extension, loading])

	if (loading) {
		return <LoadingBar />
	}

	const categories = [
		{
			key: 'Extension errors',
			message:
				'Filter out newly created errors thrown by browser extensions. Any error filtered out will not count towards your billing quota.',
			checked: filterChromeExtension,
		},
	]

	return (
		<>
			{categories.map((c) => (
				<Box
					key={c.key}
					border="dividerWeak"
					borderRadius="8"
					px="8"
					py="12"
				>
					{ToggleRow(
						c.key,
						c.message,
						c.checked,
						(isOptIn: boolean) => {
							setfilterChromeExtension(isOptIn)
							setAllProjectSettings((currentProjectSettings) =>
								currentProjectSettings?.projectSettings
									? {
											projectSettings: {
												...currentProjectSettings.projectSettings,
												filter_chrome_extension:
													isOptIn,
											},
										}
									: currentProjectSettings,
							)
						},
						false,
					)}
				</Box>
			))}
		</>
	)
}
