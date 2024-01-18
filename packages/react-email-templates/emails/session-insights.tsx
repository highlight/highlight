import { Heading, Hr, Img, Link, Text } from '@react-email/components'
import * as React from 'react'

import { EmailHtml, HighlightLogo } from '../components/common'
import { Session, SessionPreview } from '../components/sessions'

export interface SessionInsightsEmailProps {
	projectId?: number
	projectName?: string
	toEmail?: string
	unsubscribeUrl?: string
	useHarold?: boolean
	interestingSessions?: Session[]
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
	insights: [
		`The user viewed an error page with the URL 'https://app.highlight.io/1/errors/7YboUB1obqGbOZV95X40gZrTGyRC/instances/196875448/?page=1&query=and%7C%7Cerror_state%2Cis%2COPEN'`,
		'The customer changed their billing settings on the billing page. This is a really long insight. I wonder what happens when the insight is this long.',
		'The customer logged out at 45:32.',
	],
}

export const SessionInsightsEmail = ({
	projectName = 'Highlight Production (app.highlight.io)',
	toEmail = 'zane@highlight.io',
	unsubscribeUrl = 'https://app.highlight.io/unsubscribe',
	useHarold = false,
	interestingSessions = [sessionExample, sessionExample, sessionExample],
}: SessionInsightsEmailProps) => (
	<EmailHtml previewText={`Session insights for ${projectName}`}>
		<HighlightLogo />
		<Heading style={headingText}>
			<span style={highlightedText}>
				<a style={highlightedText}>{projectName}</a>
			</span>
			<br />
			Session Insights
		</Heading>
		<Text style={subtitleText}>
			Here are 3 interesting* sessions recorded in your project this week:
		</Text>
		<Hr style={hr} />
		{interestingSessions.map((s) => (
			<>
				<SessionPreview session={s} />
				<Hr style={hr} />
			</>
		))}
		<Text style={paragraph}>
			* These are sessions with unusual user journeys. You can read more
			about our methodology{' '}
			<Link
				style={anchor}
				href="https://www.highlight.io/blog/interesting-sessions"
			>
				here
			</Link>
			.
		</Text>
		{!useHarold && (
			<Text style={paragraph}>
				Your workspace has AI insights turned off. If you would like
				this digest to include a summary of each session, you can turn
				on AI insights{' '}
				<Link
					style={anchor}
					href="https://app.highlight.io/w/harold-ai"
				>
					here
				</Link>
				.
			</Text>
		)}
		<Text style={paragraph}>
			This digest was sent to{' '}
			<Link style={anchor} href={`mailto:${toEmail}`}>
				{toEmail}
			</Link>
			. If you don't want to receive emails like this in the future, you
			can{' '}
			<Link style={anchor} href={unsubscribeUrl}>
				unsubscribe
			</Link>
			.
		</Text>
		<Hr style={hr} />
		<Img
			style={logoFull}
			src="https://static.highlight.io/assets/digest/highlight-logo.png"
			width="70"
			height="16"
			alt="Highlight logo"
		/>
		<Text style={footer}>Seattle, WA 98122</Text>
	</EmailHtml>
)

export default SessionInsightsEmail

const hr = {
	color: '#30294e',
	borderTop: '1px solid #30294e',
	margin: '20px 0',
}

const text = {
	color: '#ffffff',
}

const highlightedText = {
	color: '#ebff5e',
}

const anchor = {
	color: '#72e4fc',
}

const footer = {
	color: '#9d97aa',
	fontSize: '12px',
	lineHeight: '16px',
}

const logoFull = {
	margin: '24px auto 0',
}

const paragraph = {
	fontSize: '14px',
	fontWeight: '600',
	lineHeight: '22px',
	color: '#ffffff',
}

const subtitleText = {
	...text,
	fontSize: '16px',
}

const headingText = {
	...text,
	fontSize: '36px',
	lineHeight: '44px',
}
