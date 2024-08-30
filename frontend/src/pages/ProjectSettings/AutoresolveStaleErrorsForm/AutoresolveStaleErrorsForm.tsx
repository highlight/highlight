import { LoadingBar } from '@components/Loading/Loading'
import { Box, Callout, Form, Label, Stack } from '@highlight-run/ui/components'
import { useEffect, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import { ToggleRow } from '@/components/ToggleRow/ToggleRow'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

const DAY_VALUES = Array.from({ length: 30 }, (_, i) => i + 1)

export const AutoresolveStaleErrorsForm = () => {
	const [enableAutoResolveStaleErrors, setEnableAutoResolveStaleErrors] =
		useState<boolean>(false)

	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	const setAutoResolveStaleErrorsDayInterval = (interval: number) => {
		setAllProjectSettings((currentProjectSettings) =>
			currentProjectSettings?.projectSettings
				? {
						projectSettings: {
							...currentProjectSettings.projectSettings,
							autoResolveStaleErrorsDayInterval: interval,
						},
					}
				: currentProjectSettings,
		)
	}

	useEffect(() => {
		if (!loading) {
			const interval =
				data?.projectSettings?.autoResolveStaleErrorsDayInterval ?? 0

			if (interval > 0) {
				setEnableAutoResolveStaleErrors(true)
			}
		}
	}, [data?.projectSettings?.autoResolveStaleErrorsDayInterval, loading])

	if (loading) {
		return <LoadingBar />
	}

	const categories = [
		{
			key: 'Auto-resolve stale errors',
			message:
				"Enable this feature to automatically resolve errors that haven't been seen for the configured time period.",
			checked: enableAutoResolveStaleErrors,
		},
	]

	return (
		<Form>
			{categories.map((c) => (
				<BorderBox key={c.key}>
					<Box py="8">
						{ToggleRow(
							c.key,
							c.message,
							c.checked,
							(isOptIn: boolean) => {
								setEnableAutoResolveStaleErrors(isOptIn)

								if (!isOptIn) {
									setAutoResolveStaleErrorsDayInterval(0)
								} else {
									setAutoResolveStaleErrorsDayInterval(1)
								}
							},
							false,
						)}
					</Box>

					<Box borderTop="dividerWeak" />

					<Stack
						direction="row"
						alignItems="center"
						justify="space-between"
						py="8"
					>
						<Box display="flex">
							<Label
								label="Auto-resolve errors not seen in"
								name="auto-resolve-not-seen-in"
							/>
						</Box>
						<Box>
							<Form.Select
								name="auto-resolve-not-seen-in"
								value={
									data?.projectSettings
										?.autoResolveStaleErrorsDayInterval
								}
								onValueChange={(option) => {
									setAutoResolveStaleErrorsDayInterval(
										option.value,
									)
								}}
								disabled={!enableAutoResolveStaleErrors}
								options={DAY_VALUES.map((day) => ({
									name: `${day} day${day === 1 ? '' : 's'}`,
									value: day,
								}))}
							/>
						</Box>
					</Stack>
					{enableAutoResolveStaleErrors && (
						<Callout kind="warning">
							Enabling auto-resolve will close all errors in that
							time period.
						</Callout>
					)}
				</BorderBox>
			))}
		</Form>
	)
}
