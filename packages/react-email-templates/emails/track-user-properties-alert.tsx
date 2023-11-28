import { Column, Row, Section, Text } from '@react-email/components'
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
import { Session, SessionPreview } from '../components/sessions'

const sessionExample = {
	url: 'https://app.highlight.io/1/sessions/123',
	identifier: 'jay@highlight.io',
	screenshotUrl: 'https://zane.test/404',
	activityGraphUrl:
		'https://static.highlight.io/assets/session-insights/activity.png',
	avatarUrl:
		'https://lh3.googleusercontent.com/a-/AOh14Gg3zY3_wfixRrZjjMuj2eTrBAOKDZrDWeYlHsjL=s96-c',
	country: 'Germany',
	activeLength: '1h 25m',
}

type UserProperty = {
	key: string
	value: string
}

export interface TrackUserPropertiesAlertEmailProps {
	alertLink?: string
	alertName?: string
	projectName?: string
	session?: Session
	userIdentifier?: string
	userProperties?: UserProperty[]
}

export const TrackUserPropertiesAlertEmail = ({
	alertLink = 'https://localhost:3000/1/alerts/sessions/1',
	alertName = 'Track Event Alert',
	projectName = 'Highlight Production (app.highlight.io)',
	session = sessionExample,
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

			<Break />

			<SessionPreview session={session} hideViewSessionButton />
			<CtaLink href={session.url} label="Open" />
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
