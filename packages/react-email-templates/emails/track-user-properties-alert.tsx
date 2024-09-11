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

type UserProperty = {
	key: string
	value: string
}

export interface TrackUserPropertiesAlertEmailProps {
	alertLink?: string
	alertName?: string
	projectName?: string
	sessionLink?: string
	userIdentifier?: string
	userProperties?: UserProperty[]
}

export const TrackUserPropertiesAlertEmail = ({
	alertLink = 'https://localhost:3000/1/alerts/sessions/1',
	alertName = 'Track Event Alert',
	projectName = 'Highlight Production (app.highlight.io)',
	sessionLink = 'https://localhost:3000/1/sessions/6r5FU4u4SYs4AG4kZjnLHyU5K2N7',
	userIdentifier = '1',
	userProperties = [
		{
			key: 'Email',
			value: 'spencer@highlight.io',
		},
		{
			key: 'Favorite movie',
			value: 'Super Mario Bros.',
		},
	],
}: TrackUserPropertiesAlertEmailProps) => (
	<EmailHtml previewText={`${alertName} alert fired`}>
		<HighlightLogo />
		<Title>
			<span style={highlightedTextStyle}>{alertName}</span> alert fired
		</Title>
		<Subtitle>{projectName}</Subtitle>

		<AlertContainer>
			<Text style={textStyle}>
				The following user properties have been created by{' '}
				<span style={highlightedTextStyle}>{userIdentifier}</span>.
			</Text>

			<Break />

			<Section style={eventPropertiesContainer}>
				{userProperties.map((property: UserProperty) => (
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

const eventPropertiesContainer = {
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

export default TrackUserPropertiesAlertEmail
