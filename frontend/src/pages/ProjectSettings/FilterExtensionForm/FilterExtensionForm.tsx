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
			key: 'Filter errors thrown by Chrome extensions.',
			message: 'Filter Chrome extensions ',
			label: (
				<p>
					Filter errors thrown by Chrome extensions (read the{' '}
					<a
						href="https://www.highlight.io/docs/general/product-features/error-monitoring/ignoring-errors#ignore-errors-emitted-by-chrome-extensions"
						target="_blank"
						rel="noreferrer"
					>
						docs
					</a>
					).
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
						setfilterChromeExtension(isOptIn)
						setAllProjectSettings((currentProjectSettings) =>
							currentProjectSettings?.projectSettings
								? {
										projectSettings: {
											...currentProjectSettings.projectSettings,
											filterChromeExtension: isOptIn,
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
