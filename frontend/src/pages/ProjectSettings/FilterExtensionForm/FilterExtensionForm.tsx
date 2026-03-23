import { Box, Heading, Stack, Text } from '@highlight-run/ui/components'
import { useEffect, useState } from 'react'

import { LoadingBar } from '@components/Loading/Loading'
import Switch from '@/components/Switch/Switch'
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

	return (
		<Box background="white" border="dividerWeak" borderRadius="8" p="24">
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				gap="16"
			>
				<Stack gap="4">
					<Heading level="h4">Extension errors</Heading>
					<Text color="moderate">
						Filter out newly created errors thrown by browser
						extensions. Any error filtered out will not count
						towards your billing quota.
					</Text>
				</Stack>
				<Switch
					trackingId="FilterChromeExtensionSwitch"
					checked={filterChromeExtension}
					onChange={(isOptIn: boolean) => {
						setfilterChromeExtension(isOptIn)
						setAllProjectSettings((currentProjectSettings) =>
							currentProjectSettings?.projectSettings
								? {
										projectSettings: {
											...currentProjectSettings.projectSettings,
											filter_chrome_extension: isOptIn,
										},
								  }
								: currentProjectSettings,
						)
					}}
				/>
			</Stack>
		</Box>
	)
}

