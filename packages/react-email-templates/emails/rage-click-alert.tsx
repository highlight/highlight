import { Text } from '@react-email/components'
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

export interface RageClickAlertEmailProps {
	alertLink?: string
	alertName?: string
	projectName?: string
	userIdentifier?: string
	session?: Session
}

export const RageClickAlertEmail = ({
	alertName = 'Rage Click Alert',
	alertLink = 'https://localhost:3000/1/alerts/sessions/1',
	projectName = 'Highlight Production (app.highlight.io)',
	session = sessionExample,
	userIdentifier = '1',
}: RageClickAlertEmailProps) => (
	<EmailHtml previewText={`${alertName} alert fired`}>
		<HighlightLogo />
		<Title>
			<span style={highlightedTextStyle}>{alertName}</span> alert fired
		</Title>
		<Subtitle>{projectName}</Subtitle>

		<AlertContainer>
			<Text style={textStyle}>
				<span style={highlightedTextStyle}>{userIdentifier}</span> has
				been rage clicking in a session.
			</Text>

			<Break />

			<SessionPreview session={session} hideViewSessionButton />
			<CtaLink href={session.url} label="Open" />
		</AlertContainer>

		<Break />

		<Footer alertLink={alertLink} />
	</EmailHtml>
)

export default RageClickAlertEmail
