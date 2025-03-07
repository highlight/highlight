import React, { useState } from 'react'
import {
	Badge,
	Box,
	Button,
	IconSolidArrowDown,
	IconSolidArrowUp,
	IconSolidChip,
	IconSolidCursorClick,
	IconSolidDotsHorizontal,
	IconSolidPencil,
	IconSolidPlus,
	IconSolidSearch,
	IconSolidTrash,
	Input,
	Menu,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { LabeledRow } from '@pages/Graphing/LabeledRow'
import { Divider } from 'antd'
import { EventSelection } from '@pages/Graphing/EventSelection/index'
import {
	EventSelectionDetails,
	EventSelectionStep,
	EventType,
} from '@pages/Graphing/util'

import * as styles from './EventSteps.css'

type EventStepProps = {
	index: number
	step: EventSelectionStep
	onEdit: () => void
	onRemove: () => void
	onMoveUp?: () => void
	onMoveDown?: () => void
}

const EventStep: React.FC<EventStepProps> = ({
	index,
	step,
	onEdit,
	onRemove,
	onMoveUp,
	onMoveDown,
}) => {
	return (
		<Box
			width="full"
			display="flex"
			flexDirection="row"
			gap="6"
			p="8"
			backgroundColor="nested"
			justifyContent="space-between"
			cssClass={styles.eventStep}
		>
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
			<Menu placement="bottom-end">
				<Menu.Button
					cssClass={styles.discoverableButton}
					icon={<IconSolidDotsHorizontal size={13} />}
					emphasis="low"
					kind="secondary"
					size="xSmall"
				/>
				<Menu.List>
					<Menu.Item onClick={onEdit}>
						<Stack gap="4" direction="row" align="center">
							<IconSolidPencil />
							Edit step
						</Stack>
					</Menu.Item>
					{onMoveUp && (
						<Menu.Item onClick={onMoveUp}>
							<Stack gap="4" direction="row" align="center">
								<IconSolidArrowUp />
								Move up
							</Stack>
						</Menu.Item>
					)}
					{onMoveDown && (
						<Menu.Item onClick={onMoveDown}>
							<Stack gap="4" direction="row" align="center">
								<IconSolidArrowDown />
								Move down
							</Stack>
						</Menu.Item>
					)}
					<Menu.Item onClick={onRemove}>
						<Stack gap="4" direction="row" align="center">
							<IconSolidTrash />
							Delete step
						</Stack>
					</Menu.Item>
				</Menu.List>
			</Menu>
		</Box>
	)
}

const DEFAULT_STEP: EventSelectionDetails = {
	type: EventType.Track,
	name: '',
	filters: '',
}

type AddEventStepProps = {
	step?: EventSelectionStep
	addStep: (step: EventSelectionStep) => void
	startDate: Date
	endDate: Date
}

const AddEventStep: React.FC<AddEventStepProps> = ({
	step,
	addStep,
	startDate,
	endDate,
}) => {
	const [title, setTitle] = useState(step?.title ?? '')
	const [query, setQuery] = useState<string>(step?.query ?? '')
	const [event, setEvent] = useState<EventSelectionDetails>(
		step?.event ?? DEFAULT_STEP,
	)

	return (
		<Box
			width="full"
			display="flex"
			flexDirection="column"
			gap="12"
			p="8"
			backgroundColor="nested"
			cssClass={styles.eventStep}
		>
			<LabeledRow label="Step title" name="stepTitle">
				<Input
					value={title}
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
				{step ? 'Update step' : 'Add step'}
			</Button>
		</Box>
	)
}

type Props = {
	steps: EventSelectionStep[]
	setSteps: React.Dispatch<React.SetStateAction<EventSelectionStep[]>>
	startDate: Date
	endDate: Date
}

export const EventSteps: React.FC<Props> = ({
	steps,
	setSteps,
	startDate,
	endDate,
}) => {
	const [editStep, setEditStep] = useState(-1)

	const onAddStep = (index: number, step: EventSelectionStep) => {
		setSteps((existing) =>
			existing
				.slice(0, index)
				.concat(step)
				.concat(existing.slice(index + 1, existing.length)),
		)

		setEditStep(-1)
	}

	const onRemove = (index: number) => {
		setSteps((s) => s.slice(0, index).concat(s.slice(index + 1, s.length)))
	}

	const onMoveUp = (index: number) => {
		setSteps((s) =>
			s
				.slice(0, index - 1)
				.concat(s[index], s[index - 1])
				.concat(s.slice(index + 1, s.length)),
		)
	}

	const onMoveDown = (index: number) => {
		setSteps((s) =>
			s
				.slice(0, index)
				.concat(s[index + 1], s[index])
				.concat(s.slice(index + 2, s.length)),
		)
	}

	return (
		<Box>
			{steps.map((step, index) => {
				if (index === editStep) {
					return (
						<AddEventStep
							key={index}
							step={step}
							addStep={(s) => onAddStep(index, s)}
							startDate={startDate}
							endDate={endDate}
						/>
					)
				}

				const showMoveUp = index > 0
				const showMoveDown = index < steps.length - 1

				return (
					<EventStep
						key={index}
						index={index}
						step={step}
						onEdit={() => setEditStep(index)}
						onRemove={() => onRemove(index)}
						onMoveUp={
							showMoveUp ? () => onMoveUp(index) : undefined
						}
						onMoveDown={
							showMoveDown ? () => onMoveDown(index) : undefined
						}
					/>
				)
			})}
			{editStep < 0 && (
				<AddEventStep
					key={steps.length}
					addStep={(s) => onAddStep(steps.length, s)}
					startDate={startDate}
					endDate={endDate}
				/>
			)}
		</Box>
	)
}
