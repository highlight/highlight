import { Button } from '@components/Button'
import {
	Box,
	Container,
	IconSolidCheveronRight,
	IconSolidSpeakerphone,
	PreviousDateRangePicker,
	Tag,
	Text,
} from '@highlight-run/ui'
import { LOG_TIME_PRESETS, now, thirtyDaysAgo } from '@pages/LogsPage/constants'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { useEffect, useState } from 'react'

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

	const query = ''

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
				<Container display="flex" flexDirection="column" py="24">
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
						/>
					</Box>
				</Container>
			</Box>
		</Box>
	)
}

export default LogMonitorPage
