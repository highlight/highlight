import { Column, Row, Text } from '@react-email/components'
import * as React from 'react'

import {
	AlertContainer,
	Break,
	CtaLink,
	Footer,
	highlightedTextStyle,
	Subtitle,
	textStyle,
	Title,
} from '../components/alerts'
import { EmailHtml, HighlightLogo } from '../components/common'

export interface LogsAlertV2EmailProps {
	alertLink?: string
	alertName?: string
	belowThreshold?: boolean
	functionName?: string
	functionValue?: number
	logsLink?: string
	projectName?: string
	query?: string
	thresholdValue?: number
}

export const LogsAlertV2Email = ({
	alertLink = 'https://localhost:3000/1/alerts/1',
	alertName = 'Log Alert',
	belowThreshold = false,
	functionName = 'Count',
	functionValue = 24,
	logsLink = 'https://localhost:3000/1/logs',
	projectName = 'Highlight Production (app.highlight.io)',
	query = 'level:info',
	thresholdValue = 20,
}: LogsAlertV2EmailProps) => (
	<EmailHtml previewText={`${alertName} Alert`}>
		<HighlightLogo />
		<Title>
			<span style={highlightedTextStyle}>{alertName}</span> Alert
		</Title>
		<Subtitle>{projectName}</Subtitle>

		<AlertContainer>
			<Text style={textStyle}>
				Log {functionName} for query{' '}
				<span style={highlightedTextStyle}>{query}</span> is currently{' '}
				{belowThreshold ? 'below' : 'above'} the threshold.
			</Text>

			<Break />

			<Row style={statContainer}>
				<Column>
					<Text style={leftStat}>
						<span style={statHeader}>{functionName}</span>
						{functionValue}
					</Text>
				</Column>
				<Column>
					<Text style={rightStat}>
						<span style={statHeader}>Threshold</span>
						{thresholdValue}
					</Text>
				</Column>
			</Row>
			<CtaLink href={logsLink} label="View logs" />
		</AlertContainer>

		<Break />

		<Footer alertLink={alertLink} />
	</EmailHtml>
)

const statContainer = {
	marginBottom: '12px',
}

const leftStat = {
	...textStyle,
	textAlign: 'left' as const,
}

const rightStat = {
	...textStyle,
	textAlign: 'right' as const,
}

const statHeader = {
	...textStyle,
	color: '#9d97aa',
	marginRight: '8px',
}

export default LogsAlertV2Email
