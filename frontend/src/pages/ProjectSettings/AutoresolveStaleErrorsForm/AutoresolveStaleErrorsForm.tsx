import { LoadingBar } from '@components/Loading/Loading'
import { Box, Callout, Label, Stack } from '@highlight-run/ui'
import { useEffect, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import { ToggleRow } from '@/components/ToggleRow/ToggleRow'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import * as styles from './styles.css'

const DAY_VALUES = Array.from({ length: 30 }, (_, i) => i + 1)

export const AutoresolveStaleErrorsForm = () => {
	const [enableAutoResolveStaleErrors, setEnableAutoResolveStaleErrors] =
		useState<boolean>(false)

	const [
		autoResolveStaleErrorsDayInterval,
		setAutoResolveStaleErrorsDayInterval,
	] = useState<number>()
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	useEffect(() => {
		if (!loading) {
			const interval =
				data?.projectSettings?.autoResolveStaleErrorsDayInterval ?? 0

			if (interval > 0) {
				setEnableAutoResolveStaleErrors(true)
				setAutoResolveStaleErrorsDayInterval(interval)
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
		<>
			{categories.map((c) => (
				<BorderBox key={c.key}>
					<Box py="8">
						{ToggleRow(
							c.key,
							c.message,
							c.checked,
							(isOptIn: boolean) => {
								setEnableAutoResolveStaleErrors(isOptIn)
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
						<Label
							label="Auto-resolve errors not seen in"
							name="Auto-resolve errors not seen in"
						/>
						<select
							value={autoResolveStaleErrorsDayInterval}
							onChange={(e) => {
								setAllProjectSettings(
									(currentProjectSettings) =>
										currentProjectSettings?.projectSettings
											? {
													projectSettings: {
														...currentProjectSettings.projectSettings,
														autoResolveStaleErrorsDayInterval:
															Number(
																e.target.value,
															),
													},
											  }
											: currentProjectSettings,
								)
							}}
							className={styles.select}
							disabled={!enableAutoResolveStaleErrors}
						>
							{DAY_VALUES.map((day) => {
								if (day === 1) {
									return (
										<option value={day} key={day}>
											{day} days
										</option>
									)
								}
								return (
									<option value={day} key={day}>
										{day} days
									</option>
								)
							})}
						</select>
					</Stack>
					{enableAutoResolveStaleErrors && (
						<Callout kind="warning">
							Enabling auto-resolve will close all errors in that
							time period.
						</Callout>
					)}
				</BorderBox>
			))}
		</>
	)
}
