import { LoadingBar } from '@components/Loading/Loading'
import { toast } from '@components/Toaster'
import { Box, Stack, Input, Text } from '@highlight-run/ui/components'
import { Button } from '@/components/Button'
import React, { useState } from 'react'

import BoxLabel from '@/components/BoxLabel/BoxLabel'
import { useProjectSettingsContext } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './ErrorFiltersForm.module.css'

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
	const {
		allProjectSettings: data,
		loading,
		setAllProjectSettings,
	} = useProjectSettingsContext()
	const [inputValue, setInputValue] = useState('')

	if (loading) {
		return <LoadingBar />
	}

	const currentFilters = data?.projectSettings?.error_filters || []

	const handleAdd = () => {
		if (!inputValue || !isValidRegex(inputValue)) return
		if (currentFilters.includes(inputValue)) {
			setInputValue('')
			return
		}
		const newFilters = [...currentFilters, inputValue]
		updateFilters(newFilters)
		setInputValue('')
	}

	const handleRemove = (filterToRemove: string) => {
		updateFilters(currentFilters.filter((f) => f !== filterToRemove))
	}

	const updateFilters = (newFilters: string[]) => {
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
	}

	return (
		<form>
			<Stack gap="8">
				<BoxLabel
					label="Error filters"
					info="Enter regular expression patterns to filter out newly created errors. Any error filtered out will not count towards your billing quota."
				/>
				<div className={styles.inputAndButtonRow}>
					<Stack direction="row" gap="8" align="center">
						<Input
							name="errorFilter"
							placeholder="TypeError: Failed to fetch"
							value={inputValue}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) => setInputValue(e.target.value)}
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
							trackingId="error-filter-add"
						>
							Add
						</Button>
					</Stack>
				</div>
				{currentFilters.length > 0 && (
					<Stack direction="row" gap="4" wrap="wrap">
						{currentFilters.map((filter) => (
							<Box
								key={filter}
								display="flex"
								alignItems="center"
								gap="4"
								p="4"
								border="secondary"
								borderRadius="4"
							>
								<Text>{filter}</Text>
								<div
									style={{
										cursor: 'pointer',
										padding: '0 4px',
									}}
									onClick={() => handleRemove(filter)}
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
