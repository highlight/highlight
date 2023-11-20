import * as React from 'react'

import { EmailHtml, HighlightLogo } from '../components/common'
import {
	AlertContainer,
	Break,
	CtaLink,
	Footer,
	highlightedTextStyle,
	Subtitle,
	Title,
} from '../components/alerts'
import { Session, SessionPreview } from '../components/sessions'

export interface NewUserAlertEmailProps {
	alertLink?: string
	projectName?: string
	session?: Session
	userIdentifier?: string
}

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

export const NewUserAlertEmail = ({
	alertLink = 'https://localhost:3000/1/alerts/sessions/1',
	projectName = 'Highlight Production (app.highlight.io)',
	session = sessionExample,
	userIdentifier = '1',
}: NewUserAlertEmailProps) => (
	<EmailHtml
		previewText={`${userIdentifier} just started their first session`}
	>
		<HighlightLogo />
		<Title>
			<span style={highlightedTextStyle}>{userIdentifier}</span> just
			started their first session
		</Title>
		<Subtitle>{projectName}</Subtitle>

		<AlertContainer>
			<SessionPreview session={session} hideViewSessionButton />s
			<CtaLink href={session.url} label="Open" />
		</AlertContainer>

		<Break />

		<Footer alertLink={alertLink} />
	</EmailHtml>
)

export default NewUserAlertEmail
