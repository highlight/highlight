import { LoadingBar } from '@components/Loading/Loading'
import { Box, Stack, Input, Text } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'

import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { Button } from '@/components/Button'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

export const ErrorSettingsForm = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()
	const [inputValue, setInputValue] = useState('')

	if (loading) {
		return <LoadingBar />
	}

	const currentPaths = data?.projectSettings?.error_json_paths || []

	const handleAdd = () => {
		if (!inputValue || currentPaths.includes(inputValue)) return
		updatePaths([...currentPaths, inputValue])
		setInputValue('')
	}

	const handleRemove = (pathToRemove: string) => {
		updatePaths(currentPaths.filter((p) => p !== pathToRemove))
	}

	const updatePaths = (newPaths: string[]) => {
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
	}

	return (
		<form key={project_id}>
			<Stack gap="8">
				<BoxLabel
					label="Error grouping"
					info="Enter JSON expressions to use for grouping your errors."
				/>
				<Stack direction="row" gap="8" align="center">
					<Input
						name="errorGroup"
						placeholder="$.context.messages[0]"
						value={inputValue}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setInputValue(e.target.value)
						}
						onKeyDown={(
							e: React.KeyboardEvent<HTMLInputElement>,
						) => {
							if (e.key === 'Enter') {
								e.preventDefault()
								handleAdd()
							}
						}}
					/>
					<Button
						onClick={handleAdd}
						size="small"
						kind="secondary"
						trackingId="error-group-add"
					>
						Add
					</Button>
				</Stack>

				{currentPaths.length > 0 && (
					<Stack direction="row" gap="4" wrap="wrap">
						{currentPaths.map((path) => (
							<Box
								key={path}
								display="flex"
								alignItems="center"
								gap="4"
								p="4"
								border="secondary"
								borderRadius="4"
							>
								<Text>{path}</Text>
								<div
									style={{
										cursor: 'pointer',
										padding: '0 4px',
									}}
									onClick={() => handleRemove(path)}
								>
									✕
								</div>
							</Box>
						))}
					</Stack>
				)}
			</Stack>
		</form>
	)
}
