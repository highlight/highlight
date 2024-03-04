import { Column, Row, Section, Text } from '@react-email/components'
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

type EventProperty = {
	key: string
	value: string
}

export interface TrackEventPropertiesAlertEmailProps {
	alertLink?: string
	alertName?: string
	eventProperties?: EventProperty[]
	projectName?: string
	sessionLink?: string
	userIdentifier?: string
}

export const TrackEventPropertiesAlertEmail = ({
	alertLink = 'https://localhost:3000/1/alerts/sessions/1',
	alertName = 'Track User Alert',
	eventProperties = [
		{
			key: 'Event',
			value: 'header-link-click-errors',
		},
		{
			key: 'Visited url',
			value: '/sessions',
		},
	],
	projectName = 'Highlight Production (app.highlight.io)',
	sessionLink = 'https://localhost:3000/1/sessions/6r5FU4u4SYs4AG4kZjnLHyU5K2N7',
	userIdentifier = '1',
}: TrackEventPropertiesAlertEmailProps) => (
	<EmailHtml previewText={`${alertName} alert fired`}>
		<HighlightLogo />
		<Title>
			<span style={highlightedTextStyle}>{alertName}</span> alert fired
		</Title>
		<Subtitle>{projectName}</Subtitle>

		<AlertContainer>
			<Text style={textStyle}>
				The following track event properties have been created by{' '}
				<span style={highlightedTextStyle}>{userIdentifier}</span>.
			</Text>

			<Break />

			<Section style={userPropertiesContainer}>
				{eventProperties.map((property: EventProperty) => (
					<Row style={propertyRow}>
						<Column style={propertyHeader}>{property.key}</Column>
						<Column style={propertyValue}>{property.value}</Column>
					</Row>
				))}
			</Section>

			<CtaLink href={sessionLink} label="View session" />
		</AlertContainer>

		<Break />

		<Footer alertLink={alertLink} />
	</EmailHtml>
)

const userPropertiesContainer = {
	marginBottom: '12px',
}

const propertyRow = {
	width: '100%',
	tableLayout: 'fixed' as const,
}

const propertyHeader = {
	...textStyle,
	color: '#9d97aa',
	textAlign: 'start' as const,
}

const propertyValue = {
	...textStyle,
	textAlign: 'start' as const,
}

export default TrackEventPropertiesAlertEmail
