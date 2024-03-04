import { Text } from '@react-email/components'
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

export interface RageClickAlertEmailProps {
	alertLink?: string
	alertName?: string
	projectName?: string
	userIdentifier?: string
	sessionLink?: string
}

export const RageClickAlertEmail = ({
	alertName = 'Rage Click Alert',
	alertLink = 'https://localhost:3000/1/alerts/sessions/1',
	projectName = 'Highlight Production (app.highlight.io)',
	sessionLink = 'https://localhost:3000/1/sessions/6r5FU4u4SYs4AG4kZjnLHyU5K2N7',
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

			<CtaLink href={sessionLink} label="View session" />
		</AlertContainer>

		<Break />

		<Footer alertLink={alertLink} />
	</EmailHtml>
)

export default RageClickAlertEmail
