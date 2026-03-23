import { useEditProjectSettingsMutation } from '@graph/hooks'
import {
	Box,
	Callout,
	Heading,
	Select,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import { Button } from '@/components/Button'
import Switch from '@/components/Switch/Switch'
import { LoadingBar } from '@components/Loading/Loading'
import { toast } from '@/components/Toaster'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

const DAY_VALUES = Array.from({ length: 30 }, (_, i) => i + 1)

export const AutoresolveStaleErrorsForm = () => {
	const { project_id } = useParams()
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	const [enabled, setEnabled] = useState<boolean>(false)
	const [interval, setInterval] = useState<number>(1)

	useEffect(() => {
		if (!loading && data?.projectSettings) {
			const i = data.projectSettings.autoResolveStaleErrorsDayInterval ?? 0
			setEnabled(i > 0)
			setInterval(i || 1)
		}
	}, [data?.projectSettings, loading])

	const [editProjectSettings, { loading: editLoading }] =
		useEditProjectSettingsMutation()

	const onSave = (e: React.FormEvent) => {
		e.preventDefault()
		const newInterval = enabled ? interval : 0
		editProjectSettings({
			variables: {
				projectId: project_id!,
				autoResolveStaleErrorsDayInterval: newInterval,
			},
		}).then(() => {
			toast.success('Updated auto-resolve settings!', { duration: 5000 })
			setAllProjectSettings((current) =>
				current?.projectSettings
					? {
							projectSettings: {
								...current.projectSettings,
								autoResolveStaleErrorsDayInterval: newInterval,
							},
					  }
					: current,
			)
		})
	}

	const onDiscard = () => {
		if (data?.projectSettings) {
			const i = data.projectSettings.autoResolveStaleErrorsDayInterval ?? 0
			setEnabled(i > 0)
			setInterval(i || 1)
		}
	}

	const currentInterval = data?.projectSettings?.autoResolveStaleErrorsDayInterval ?? 0
	const isDirty =
		enabled !== (currentInterval > 0) ||
		(enabled && interval !== currentInterval)

	if (loading) {
		return <LoadingBar />
	}

	return (
		<Box
			id="autoresolve"
			background="white"
			border="dividerWeak"
			borderRadius="8"
			p="24"
		>
			<Stack gap="16">
				<Stack gap="4">
					<Heading level="h4">Auto-resolve stale errors</Heading>
					<Text color="moderate">
						Enable this feature to automatically resolve errors that
						haven't been seen for the configured time period.
					</Text>
				</Stack>

				<Box borderTop="dividerWeak" style={{ marginLeft: -24, marginRight: -24 }} />

				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<Stack direction="row" alignItems="center" gap="12">
						<Text weight="bold" size="small">
							Auto-resolve errors not seen in
						</Text>
						<Box style={{ width: 120 }}>
							<Select
								value={{
									name: `${interval} day${
										interval === 1 ? '' : 's'
									}`,
									value: interval.toString(),
								}}
								disabled={!enabled}
								onValueChange={(option: any) => {
									const val = Number(option.value)
									setInterval(val)
									setAllProjectSettings((current) =>
										current?.projectSettings
											? {
													projectSettings: {
														...current.projectSettings,
														autoResolveStaleErrorsDayInterval:
															val,
													},
											  }
											: current,
									)
								}}
								options={DAY_VALUES.map((day) => ({
									name: `${day} day${day === 1 ? '' : 's'}`,
									value: day.toString(),
								}))}
							/>
						</Box>
					</Stack>
					<Switch
						trackingId="AutoresolveStaleErrors-Switch"
						checked={enabled}
						onChange={(checked: boolean) => {
							setEnabled(checked)
							const newInterval = checked ? interval : 0
							setAllProjectSettings((current) =>
								current?.projectSettings
									? {
											projectSettings: {
												...current.projectSettings,
												autoResolveStaleErrorsDayInterval:
													newInterval,
											},
									  }
									: current,
							)
						}}
					/>
				</Stack>

				{enabled && (
					<Callout kind="warning">
						Enabling auto-resolve will close all errors in that time
						period.
					</Callout>
				)}
			</Stack>
		</Box>

	)
}
