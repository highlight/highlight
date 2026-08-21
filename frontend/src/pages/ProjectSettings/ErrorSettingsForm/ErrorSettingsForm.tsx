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

export const ErrorSettingsForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()

	const [errorJsonPaths, setErrorJsonPaths] = useState<string[]>([])

	useEffect(() => {
		if (data?.projectSettings?.error_json_paths) {
			setErrorJsonPaths(data.projectSettings.error_json_paths)
		}
	}, [data?.projectSettings?.error_json_paths])

	const [editProjectSettings, { loading: editLoading }] =
		useEditProjectSettingsMutation()

	const onSave = (e: React.FormEvent) => {
		e.preventDefault()
		editProjectSettings({
			variables: {
				projectId: project_id!,
				error_json_paths: errorJsonPaths,
			},
		}).then(() => {
			toast.success('Updated error grouping!', { duration: 5000 })
			setAllProjectSettings((current) =>
				current?.projectSettings
					? {
							projectSettings: {
								...current.projectSettings,
								error_json_paths: errorJsonPaths,
							},
					  }
					: current,
			)
		})
	}

	const onDiscard = () => {
		setErrorJsonPaths(data?.projectSettings?.error_json_paths || [])
	}

	const isDirty =
		JSON.stringify(errorJsonPaths) !==
		JSON.stringify(data?.projectSettings?.error_json_paths || [])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<Stack gap="16">
			<Stack gap="4">
				<Heading level="h4">Error grouping</Heading>
				<Text color="moderate">
					Enter JSON expressions to use for grouping your errors.
				</Text>
			</Stack>

			<Box display="flex" flexDirection="column" gap="4">
				<Text weight="bold" size="small">
					JSON Expressions
				</Text>
				<Select
					placeholder="$.context.messages[0]"
					value={errorJsonPaths.map((p) => ({
						name: p,
						value: p,
					}))}
					onValueChange={(v: any) => {
						const newPaths = Array.isArray(v)
							? v.map((o) => o.value)
							: v
							? [v.value]
							: []
						setErrorJsonPaths(newPaths)
						setAllProjectSettings((current) =>
							current?.projectSettings
								? {
										projectSettings: {
											...current.projectSettings,
											error_json_paths: newPaths,
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
