import { useEditProjectSettingsMutation } from '@graph/hooks'
import {
	Box,
	Heading,
	Select,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import { Button } from '@/components/Button'
import { LoadingBar } from '@components/Loading/Loading'
import { toast } from '@/components/Toaster'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

const isValidRegex = function (p: string) {
	try {
		new RegExp(p)
	} catch (e: any) {
		toast.error(`Pattern \`${p}\` is not valid regex.`)
		return false
	}
	return true
}

export const ErrorFiltersForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	const [errorFilters, setErrorFilters] = useState<string[]>([])

	useEffect(() => {
		if (data?.projectSettings?.error_filters) {
			setErrorFilters(data.projectSettings.error_filters)
		}
	}, [data?.projectSettings?.error_filters])

	const [editProjectSettings, { loading: editLoading }] =
		useEditProjectSettingsMutation()

	const onSave = (e: React.FormEvent) => {
		e.preventDefault()
		const validFilters = errorFilters.filter(isValidRegex)
		if (validFilters.length !== errorFilters.length) {
			return
		}

		editProjectSettings({
			variables: {
				projectId: project_id!,
				error_filters: errorFilters,
			},
		}).then(() => {
			toast.success('Updated error filters!', { duration: 5000 })
			setAllProjectSettings((current) =>
				current?.projectSettings
					? {
							projectSettings: {
								...current.projectSettings,
								error_filters: errorFilters,
							},
					  }
					: current,
			)
		})
	}

	const onDiscard = () => {
		setErrorFilters(data?.projectSettings?.error_filters || [])
	}

	const isDirty =
		JSON.stringify(errorFilters) !==
		JSON.stringify(data?.projectSettings?.error_filters || [])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<Stack gap="16">
			<Stack gap="4">
				<Heading level="h4">Error filters</Heading>
				<Text color="moderate">
					Enter regular expression patterns to filter out newly
					created errors. Any error filtered out will not count
					towards your billing quota.
				</Text>
			</Stack>

			<Box display="flex" flexDirection="column" gap="4">
				<Text weight="bold" size="small">
					Regex Patterns
				</Text>
				<Select
					placeholder="TypeError: Failed to fetch"
					value={errorFilters.map((f) => ({
						name: f,
						value: f,
					}))}
					onValueChange={(v: any) => {
						const newFilters = Array.isArray(v)
							? v.map((o) => o.value)
							: v
							? [v.value]
							: []
						setErrorFilters(newFilters)
						setAllProjectSettings((current) =>
							current?.projectSettings
								? {
										projectSettings: {
											...current.projectSettings,
											error_filters: newFilters,
										},
								  }
								: current,
						)
					}}
					creatable
					displayMode="tags"
				/>
			</Box>
		</Stack>

	)
}
