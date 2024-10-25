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

export interface SessionsAlertV2EmailProps {
	alertName?: string
	alertLink?: string
	projectName?: string
	query?: string
	secureId?: string
	sessionLink?: string
	userIdentifier?: string
}

export const SessionsAlertV2Email = ({
	alertName = 'New Session Alert',
	alertLink = 'https://localhost:3000/1/alerts/sessions/1',
	projectName = 'Highlight Production (app.highlight.io)',
	query = 'first_time=true',
	secureId = '6r5FU4u4SYs4AG4kZjnLHyU5K2N7',
	sessionLink = 'https://localhost:3000/1/sessions/6r5FU4u4SYs4AG4kZjnLHyU5K2N7',
	userIdentifier = '1',
}: SessionsAlertV2EmailProps) => (
	<EmailHtml previewText={`${alertName} Alert`}>
		<HighlightLogo />
		<Title>
			<span style={highlightedTextStyle}>{alertName}</span> Alert
		</Title>
		<Subtitle>{projectName}</Subtitle>

		<AlertContainer hideBorder>
			<Text style={textStyle}>
				Session found that matches query:{' '}
				<span style={highlightedTextStyle}>{query}</span>.
			</Text>
			<Text style={textStyle}>
				#{secureId} ({userIdentifier})
			</Text>

			<Break />

			<CtaLink href={sessionLink} label="View session" />
		</AlertContainer>

		<Break />

		<Footer alertLink={alertLink} />
	</EmailHtml>
)

export default SessionsAlertV2Email
