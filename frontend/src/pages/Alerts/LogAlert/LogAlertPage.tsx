import { Button } from '@components/Button'
import { useGetLogsKeysQuery } from '@graph/hooks'
import {
	Box,
	Column,
	Container,
	Form,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidCheveronUp,
	IconSolidSpeakerphone,
	Menu,
	PreviousDateRangePicker,
	Stack,
	Tag,
	Text,
	useForm,
	useFormState,
	useMenu,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { LOG_TIME_PRESETS, now, thirtyDaysAgo } from '@pages/LogsPage/constants'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { Search } from '@pages/LogsPage/SearchForm/SearchForm'
import { useEffect, useMemo, useState } from 'react'

import * as styles from './styles.css'

export const LogMonitorPage = () => {
	const [selectedDates, setSelectedDates] = useState([
		LOG_TIME_PRESETS[0].startDate,
		now.toDate(),
	])

	const [startDate, setStartDate] = useState(LOG_TIME_PRESETS[0].startDate)
	const [endDate, setEndDate] = useState(now.toDate())

	useEffect(() => {
		if (selectedDates.length === 2) {
			setStartDate(selectedDates[0])
			setEndDate(selectedDates[1])
		}
	}, [selectedDates])

	const form = useFormState<{
		query: string
		belowThreshold: boolean
		threshold?: number
		frequency?: number
	}>({
		defaultValues: {
			query: '',
			belowThreshold: false,
		},
	})

	form.useSubmit(() => {
		console.log('::: TEST')
	})
	const query = form.getValue(form.names.query)
	const belowThreshold = form.getValue(form.names.belowThreshold)
	// optional values can't be accessed via form.names
	const threshold = form.getValue('threshold')

	const header = useMemo(() => {
		return (
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				borderBottom="dividerWeak"
				px="8"
				py="6"
				cssClass={styles.header}
			>
				<Text userSelect="none">Create monitoring alert</Text>
				<Box display="flex" alignItems="center" gap="4">
					<Button
						kind="secondary"
						size="small"
						emphasis="low"
						trackingId="closeLogMonitoringAlert"
					>
						Cancel
					</Button>
					<Button
						kind="primary"
						size="small"
						emphasis="high"
						trackingId="saveLogMonitoringAlert"
					>
						Create alert
					</Button>
				</Box>
			</Box>
		)
	}, [])

	return (
		<Box width="full" background="raised" px="8" pb="8">
			<Box
				border="dividerWeak"
				borderRadius="6"
				width="full"
				shadow="medium"
				background="default"
				display="flex"
				flexDirection="column"
				height="full"
			>
				{header}
				<Container
					display="flex"
					flexDirection="column"
					py="24"
					gap="40"
				>
					<Box
						display="flex"
						flexDirection="column"
						width="full"
						height="full"
						gap="12"
					>
						<Box
							display="flex"
							alignItems="center"
							width="full"
							justifyContent="space-between"
						>
							<Box
								display="flex"
								alignItems="center"
								gap="4"
								color="weak"
							>
								<Tag
									kind="secondary"
									size="medium"
									shape="basic"
									emphasis="high"
									iconLeft={<IconSolidSpeakerphone />}
								>
									Alerts
								</Tag>
								<IconSolidCheveronRight />
								<Text
									color="moderate"
									size="small"
									weight="medium"
									userSelect="none"
								>
									Log monitor
								</Text>
							</Box>
							<PreviousDateRangePicker
								selectedDates={selectedDates}
								onDatesChange={setSelectedDates}
								presets={LOG_TIME_PRESETS}
								minDate={thirtyDaysAgo}
								kind="secondary"
								size="medium"
								emphasis="low"
							/>
						</Box>
						<LogsHistogram
							query={query}
							startDate={startDate}
							endDate={endDate}
							onDatesChange={(startDate, endDate) => {
								setSelectedDates([startDate, endDate])
							}}
							onLevelChange={() => {}}
							outline
							threshold={threshold}
							belowThreshold={belowThreshold}
						/>
					</Box>
					<Form state={form} resetOnSubmit={false}>
						<LogAlertForm {...{ startDate, endDate }} />
					</Form>
				</Container>
			</Box>
		</Box>
	)
}

const LogAlertForm = ({
	startDate,
	endDate,
}: {
	startDate: Date
	endDate: Date
}) => {
	const { projectId } = useProjectId()
	const { data: keysData } = useGetLogsKeysQuery({
		variables: {
			project_id: projectId,
		},
	})
	const form = useForm()
	const query = form.values.query

	return (
		<Box cssClass={styles.grid}>
			<Stack gap="12">
				<Box cssClass={styles.sectionHeader}>
					<Text size="large" weight="bold" color="strong">
						Define query
					</Text>
				</Box>
				<Box borderTop="dividerWeak" width="full" />
				<Form.NamedSection label="Search query" name="query">
					<Box cssClass={styles.queryContainer} mt="4">
						<Search
							initialQuery={query}
							keys={keysData?.logs_keys ?? []}
							startDate={startDate}
							endDate={endDate}
							hideIcon
							className={styles.combobox}
						/>
					</Box>
				</Form.NamedSection>
			</Stack>
			<Stack gap="12">
				<Box
					cssClass={styles.sectionHeader}
					justifyContent="space-between"
				>
					<Text size="large" weight="bold" color="strong">
						Alert conditions
					</Text>
					<Menu>
						<ThresholdTypeConfiguration />
					</Menu>
				</Box>
				<Box borderTop="dividerWeak" width="full" />
				<Column.Container gap="12">
					<Column>
						<Form.NamedSection
							label="Alert threshold"
							name="threshold"
						>
							<Form.Input name="threshold" type="number" />
						</Form.NamedSection>
					</Column>
					<Column>
						<Form.NamedSection
							label="Alert frequency"
							name="frequency"
						>
							<Form.Input name="frequency" type="number" />
						</Form.NamedSection>
					</Column>
				</Column.Container>
			</Stack>
			<Stack gap="12">
				<Box cssClass={styles.sectionHeader}>
					<Text size="large" weight="bold" color="strong">
						General
					</Text>
				</Box>
				<Box borderTop="dividerWeak" width="full" />
			</Stack>
			<Stack gap="12">
				<Box cssClass={styles.sectionHeader}>
					<Text size="large" weight="bold" color="strong">
						Notify team
					</Text>
				</Box>
				<Box borderTop="dividerWeak" width="full" />
			</Stack>
		</Box>
	)
}

const ThresholdTypeConfiguration = () => {
	const form = useForm()
	const menu = useMenu()
	const belowThreshold = form.values.belowThreshold
	return (
		<>
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="high"
				cssClass={styles.thresholdTypeButton}
				iconRight={
					menu.open ? (
						<IconSolidCheveronUp />
					) : (
						<IconSolidCheveronDown />
					)
				}
			>
				{belowThreshold ? 'Below' : 'Above'} threshold
			</Menu.Button>
			<Menu.List>
				<Menu.Item
					onClick={() => {
						form.setValue('belowThreshold', false)
					}}
				>
					Above threshold
				</Menu.Item>
				<Menu.Item
					onClick={() => {
						form.setValue('belowThreshold', true)
					}}
				>
					Below threshold
				</Menu.Item>
			</Menu.List>
		</>
	)
}

export default LogMonitorPage
