import React, { useState } from 'react'
import {
	Box,
	Checkbox,
	Text,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Input,
	Form,
	Badge,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import * as styles from './MetricsFilterPanel.css'

interface FilterCategory {
	id: string
	label: string
	expandable?: boolean
	searchable?: boolean
	options: FilterOption[]
}

interface FilterOption {
	id: string
	label: string
	count: number
	checked: boolean
}

interface MetricsFilterPanelProps {
	onFilterChange: (
		categoryId: string,
		optionId: string,
		checked: boolean,
	) => void
}

export const MetricsFilterPanel: React.FC<MetricsFilterPanelProps> = ({
	onFilterChange,
}) => {
	// Sample data - in a real implementation, this would come from the API
	const [categories, setCategories] = useState<FilterCategory[]>([
		{
			id: 'tags',
			label: 'All tags',
			options: [
				{
					id: 'all_tags',
					label: 'All tags',
					count: 99,
					checked: false,
				},
			],
		},
		{
			id: 'configured_tags',
			label: 'Configured tags',
			options: [
				{
					id: 'configured_tags',
					label: 'Configured tags',
					count: 0,
					checked: false,
				},
			],
		},
		{
			id: 'percentiles',
			label: 'Percentiles',
			expandable: true,
			options: [],
		},
		{
			id: 'metric_type',
			label: 'Metric Type',
			expandable: true,
			searchable: true,
			options: [
				{
					id: 'server.address',
					label: 'server.address',
					count: 99,
					checked: false,
				},
				{
					id: 'server.port',
					label: 'server.port',
					count: 99,
					checked: false,
				},
				{
					id: 'client.address',
					label: 'client.address',
					count: 99,
					checked: false,
				},
				{
					id: 'client.port',
					label: 'client.port',
					count: 99,
					checked: false,
				},
				{
					id: 'source.address',
					label: 'source.address',
					count: 76,
					checked: false,
				},
				{
					id: 'source.port',
					label: 'source.port',
					count: 54,
					checked: false,
				},
				{
					id: 'destination.address',
					label: 'destination.address',
					count: 43,
					checked: false,
				},
				{
					id: 'destination.port',
					label: 'destination.port',
					count: 43,
					checked: false,
				},
				{
					id: 'network.protocol.version',
					label: 'network.protocol.version',
					count: 33,
					checked: false,
				},
				{
					id: 'network.protocol.name',
					label: 'network.protocol.name',
					count: 20,
					checked: false,
				},
			],
		},
		{
			id: 'category',
			label: 'Category',
			expandable: true,
			searchable: true,
			options: [
				{ id: 'asdfdf1', label: 'asdfdf', count: 99, checked: false },
				{ id: 'asdfdf2', label: 'asdfdf', count: 99, checked: false },
				{ id: 'asdfdf3', label: 'asdfdf', count: 99, checked: false },
				{ id: 'asdfdf4', label: 'asdfdf', count: 99, checked: false },
				{ id: 'asdfdf5', label: 'asdfdf', count: 76, checked: false },
				{ id: 'asdfdf6', label: 'asdfdf', count: 54, checked: false },
				{ id: 'asdfdf7', label: 'asdfdf', count: 43, checked: false },
				{ id: 'asdfdf8', label: 'asdfdf', count: 43, checked: false },
				{ id: 'asdfdf9', label: 'asdfdf', count: 33, checked: false },
			],
		},
	])

	const [expandedCategories, setExpandedCategories] = useState<
		Record<string, boolean>
	>({
		metric_type: true,
		category: false,
	})

	const [searchFilters, setSearchFilters] = useState<Record<string, string>>(
		{},
	)

	const toggleCategory = (categoryId: string) => {
		setExpandedCategories((prev) => ({
			...prev,
			[categoryId]: !prev[categoryId],
		}))
	}

	const handleSearchChange = (categoryId: string, value: string) => {
		setSearchFilters((prev) => ({
			...prev,
			[categoryId]: value,
		}))
	}

	const handleCheckboxChange = (
		categoryId: string,
		optionId: string,
		checked: boolean,
	) => {
		// Update local state
		setCategories((prev) =>
			prev.map((category) =>
				category.id === categoryId
					? {
							...category,
							options: category.options.map((option) =>
								option.id === optionId
									? { ...option, checked }
									: option,
							),
						}
					: category,
			),
		)

		// Propagate change to parent component
		onFilterChange(categoryId, optionId, checked)
	}

	const getFilteredOptions = (category: FilterCategory) => {
		const searchValue = searchFilters[category.id] || ''
		return category.options.filter(
			(option) =>
				searchValue === '' ||
				option.label.toLowerCase().includes(searchValue.toLowerCase()),
		)
	}

	return (
		<Box
			width="full"
			borderRight="dividerWeak"
			height="full"
			overflow="auto"
			backgroundColor="white"
			style={{ width: '250px' }}
		>
			{categories.map((category) => {
				const isExpanded = expandedCategories[category.id] || false
				const filteredOptions = getFilteredOptions(category)

				return (
					<Box key={category.id} px="4" py="4">
						<Box
							display="flex"
							alignItems="center"
							justifyContent="space-between"
							px="4"
							py="2"
							cursor={category.expandable ? 'pointer' : 'default'}
							onClick={
								category.expandable
									? () => toggleCategory(category.id)
									: undefined
							}
							cssClass={
								category.expandable
									? styles.categoryHeaderHover
									: undefined
							}
						>
							{category.expandable ? (
								<Box display="flex" alignItems="center">
									<Box
										mr="2"
										display="flex"
										alignItems="center"
									>
										{isExpanded ? (
											<IconSolidCheveronDown
												size={14}
												color={vars.color.n8}
											/>
										) : (
											<IconSolidCheveronRight
												size={14}
												color={vars.color.n8}
											/>
										)}
									</Box>
									<Text
										weight="medium"
										size="small"
										color="default"
									>
										{category.label}
									</Text>
								</Box>
							) : null}
							{category.id === 'metric_type' && (
								<Text size="small" weight="medium" color="n8">
									{expandedCategories[category.id]
										? '−'
										: '+'}
								</Text>
							)}
						</Box>

						{(!category.expandable || isExpanded) && (
							<Box
								pl={category.expandable ? '10' : '4'}
								pr="4"
								pb="3"
							>
								{category.searchable && (
									<Box mb="3" mt="1">
										<Form>
											<Input
												name={`search-${category.id}`}
												size="small"
												placeholder="Find..."
												value={
													searchFilters[
														category.id
													] || ''
												}
												onChange={(e) =>
													handleSearchChange(
														category.id,
														e.target.value,
													)
												}
											/>
										</Form>
									</Box>
								)}

								<Box
									display="flex"
									flexDirection="column"
									gap="2"
								>
									{filteredOptions.map((option) => (
										<Box
											key={option.id}
											display="flex"
											alignItems="center"
											justifyContent="space-between"
										>
											<Box
												display="flex"
												alignItems="center"
												width="full"
												py="1"
												px="1"
												cssClass={styles.optionRowHover}
												borderRadius="4"
											>
												<Box
													display="flex"
													alignItems="center"
													mr="2"
												>
													<Checkbox
														type="checkbox"
														id={`${category.id}-${option.id}`}
														checked={option.checked}
														onChange={(
															e: React.ChangeEvent<HTMLInputElement>,
														) =>
															handleCheckboxChange(
																category.id,
																option.id,
																e.target
																	.checked,
															)
														}
														className={
															styles.customCheckbox
														}
													/>
													<Badge
														label={option.label}
													/>
												</Box>
												<Box ml="auto" pr="2">
													<Text
														size="xSmall"
														color="moderate"
													>
														{option.count > 99
															? '99+'
															: option.count}
													</Text>
												</Box>
											</Box>
										</Box>
									))}
								</Box>

								{category.id === 'metric_type' &&
									filteredOptions.length > 5 && (
										<Box mt="3" textAlign="center">
											<Text
												size="xSmall"
												color="moderate"
												cssClass={{ cursor: 'pointer' }}
											>
												Show more
											</Text>
										</Box>
									)}
							</Box>
						)}
					</Box>
				)
			})}
		</Box>
	)
}
