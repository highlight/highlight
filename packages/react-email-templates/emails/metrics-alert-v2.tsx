import { Column, Text, Row } from '@react-email/components'
import * as React from 'react'

import { EmailHtml, HighlightLogo } from '../components/common'
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

export interface MetricsAlertV2EmailProps {
	alertLink?: string
	alertName?: string
	belowThreshold?: boolean
	count?: number
	dashboardsLink?: string
	functionName?: string
	functionValue?: number
	projectName?: string
	query?: string
	thresholdValue?: number
}

export const MetricsAlertV2Email = ({
	alertLink = 'https://localhost:3000/1/alerts/1',
	alertName = 'Metric Alert',
	belowThreshold = false,
	functionName = 'Count',
	functionValue = 24,
	dashboardsLink = 'https://localhost:3000/1/dashboards',
	projectName = 'Highlight Production (app.highlight.io)',
	query = 'level:info',
	thresholdValue = 20,
}: MetricsAlertV2EmailProps) => (
	<EmailHtml previewText={`${alertName} alert fired`}>
		<HighlightLogo />
		<Title>
			<span style={highlightedTextStyle}>{alertName}</span> alert fired
		</Title>
		<Subtitle>{projectName}</Subtitle>

		<AlertContainer>
			<Text style={textStyle}>
				Metrics {functionName} for query{' '}
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
			<CtaLink href={dashboardsLink} label="View metrics" />
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

export default MetricsAlertV2Email
