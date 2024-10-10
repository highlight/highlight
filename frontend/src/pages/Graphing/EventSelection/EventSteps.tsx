import React, { useState } from 'react'
import {
	Badge,
	Box,
	Button,
	IconSolidChip,
	IconSolidCursorClick,
	IconSolidPlus,
	IconSolidSearch,
	IconSolidX,
	Input,
	Text,
} from '@highlight-run/ui/components'
import { LabeledRow } from '@pages/Graphing/LabeledRow'
import { Divider } from 'antd'
import { EventSelection } from '@pages/Graphing/EventSelection/index'
import { SearchContext } from '@components/Search/SearchContext'
import { Search } from '@components/Search/SearchForm/SearchForm'
import { ProductType } from '@graph/schemas'
import {
	EventSelectionDetails,
	EventSelectionStep,
	EventType,
} from '@pages/Graphing/util'

const EventStep: React.FC<{
	index: number
	step: EventSelectionStep
	startDate: Date
	endDate: Date
	onRemove?: () => void
}> = ({ index, step, startDate, endDate, onRemove }) => {
	return (
		<Box
			width="full"
			display="flex"
			flexDirection="column"
			gap="6"
			p="8"
			borderRadius="8"
			border="secondary"
			backgroundColor="nested"
		>
			<Box width="full" display="flex" justifyContent="space-between">
				<Box width="full" display="flex" gap="4">
					<Badge
						size="medium"
						shape="basic"
						variant="white"
						label={(index + 1).toLocaleString()}
					/>
					<Badge
						size="medium"
						shape="basic"
						variant="gray"
						label={
							step.event.type === 'Track'
								? step.event.name
								: step.event.type
						}
						lines="1"
						iconStart={
							step.event.type === 'Click' ? (
								<IconSolidCursorClick width={13} />
							) : step.event.type === 'Navigate' ? (
								<IconSolidSearch width={13} />
							) : (
								<IconSolidChip width={13} />
							)
						}
					/>
					<Box my="8">
						<Text lines="1" size="small" color="strong">
							{step.title}
						</Text>
					</Box>
				</Box>
				<Badge
					size="medium"
					shape="basic"
					variant="white"
					iconStart={<IconSolidX width={13} />}
					onClick={onRemove}
				/>
			</Box>
			<Box border="divider" width="full" borderRadius="6">
				<SearchContext
					initialQuery={step.event.filters}
					onSubmit={() => {}}
					disabled
				>
					<Search
						startDate={startDate}
						endDate={endDate}
						productType={ProductType.Events}
						hideIcon
					/>
				</SearchContext>
			</Box>
		</Box>
	)
}

const AddEventStep: React.FC<{
	addStep: (step: EventSelectionStep) => void
	startDate: Date
	endDate: Date
}> = ({ addStep, startDate, endDate }) => {
	const [title, setTitle] = useState('')
	const [query, setQuery] = useState<string>('')
	const [event, setEvent] = useState<EventSelectionDetails>({
		type: EventType.Track,
		name: '',
		filters: '',
	})
	return (
		<Box
			width="full"
			display="flex"
			flexDirection="column"
			gap="12"
			p="8"
			borderRadius="8"
			border="secondary"
			backgroundColor="nested"
		>
			<LabeledRow label="Step title" name="stepTitle">
				<Input
					name="Step title"
					placeholder="Product added to"
					autoFocus
					required
					rounded
					onChange={(e) => {
						setTitle(e.target.value)
					}}
				/>
			</LabeledRow>
			<Divider className="m-0" />
			<EventSelection
				initialQuery={query}
				setQuery={setQuery}
				initialEvent={event}
				setEvent={setEvent}
				startDate={startDate}
				endDate={endDate}
			/>
			<Button
				size="small"
				kind="secondary"
				emphasis="high"
				iconLeft={<IconSolidPlus size={14} />}
				onClick={() => {
					addStep({ title, event, query })
				}}
			>
				Add step
			</Button>
		</Box>
	)
}

export const EventSteps: React.FC<{
	steps: EventSelectionStep[]
	setSteps: React.Dispatch<React.SetStateAction<EventSelectionStep[]>>
	startDate: Date
	endDate: Date
}> = ({ steps, setSteps, startDate, endDate }) => {
	return (
		<>
			{steps.map((step, index) => (
				<EventStep
					key={index}
					index={index}
					step={step}
					startDate={startDate}
					endDate={endDate}
					onRemove={() =>
						setSteps((s) =>
							s
								.slice(0, index)
								.concat(s.slice(index + 1, s.length)),
						)
					}
				/>
			))}
			<AddEventStep
				addStep={(step) => setSteps((existing) => [...existing, step])}
				startDate={startDate}
				endDate={endDate}
			/>
		</>
	)
}
