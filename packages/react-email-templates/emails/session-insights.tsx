import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from '@react-email/components'
import * as React from 'react'

interface InterestingSession {
	identifier: string
	avatarUrl: string
	screenshotUrl: string
	country: string
	activeLength: string
	url: string
	insights: string[]
}

export interface SessionInsightsEmailProps {
	projectId?: number
	projectName?: string
	toEmail?: string
	unsubscribeUrl?: string
	useHarold?: boolean
	interestingSessions?: InterestingSession[]
}

const sessionExample = {
	url: 'https://app.highlight.io/1/sessions/123',
	identifier: 'jay@highlight.io',
	screenshotUrl: '',
	avatarUrl:
		'https://lh3.googleusercontent.com/a-/AOh14Gg3zY3_wfixRrZjjMuj2eTrBAOKDZrDWeYlHsjL=s96-c',
	country: 'Germany',
	activeLength: '1h 25m',
	insights: [
		`The user viewed an error page with the URL 'https://app.highlight.io/1/errors/7YboUB1obqGbOZV95X40gZrTGyRC/instances/196875448/?page=1&query=and%7C%7Cerror_state%2Cis%2COPEN%7C%7Cerror-field_timestamp%2Cbetween_date%2C2023-06-05T18%3A32%3A16.319Z_2023-07-05T18%3A32%3A16.319Z'`,
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
	<Html>
		<Head />
		<Preview>Session insights for {projectName}</Preview>
		<Body style={main}>
			<Container style={container}>
				<Container style={contentContainer}>
					<Section>
						<Img
							src="https://static.highlight.io/assets/digest/logo-on-dark.png"
							width="32"
							height="32"
							alt="Highlight"
							style={logo}
						/>
						<Heading style={{ ...text, fontSize: '36px' }}>
							<a style={highlightedText}>{projectName}</a>
							<br />
							Session Insights
						</Heading>
					</Section>
					{interestingSessions.map((s, idx) => (
						<Section key={idx} style={infoCard}>
							<Link href={s.url}>
								<Img
									src={s.screenshotUrl}
									style={sessionScreenshot}
									width="368"
									height="200"
								/>
							</Link>
							<Section>
								<Column style={sessionProperties}>
									<Section>
										<Text style={identifier}>
											{s.avatarUrl && (
												<Img
													src={s.avatarUrl}
													width="22"
													height="22"
													style={avatar}
												/>
											)}
											<a style={identifierText}>
												{s.identifier}
											</a>
										</Text>
									</Section>
									<Section>
										<span style={sessionProperty}>
											{s.country}
										</span>
										<span style={sessionProperty}>
											{s.activeLength}
										</span>
									</Section>
								</Column>
								<Column>
									<Img
										src="https://static.highlight.io/assets/session-insights/activity.png"
										width="120"
										height="60"
										alt="activity"
									/>
								</Column>
							</Section>
							{s.insights.map((i, idx) => (
								<Section key={idx} style={insight}>
									<Column style={numberLabel} width={24}>
										{idx + 1}
									</Column>
									<Column width={326}>
										<Link style={hoverAnchor} href={s.url}>
											<Text style={insightText}>{i}</Text>
										</Link>
									</Column>
								</Section>
							))}
						</Section>
					))}
				</Container>

				{!useHarold && (
					<Section style={paragraph}>
						<Text style={text}>
							Your workspace has AI insights turned off. If you
							would like this digest to include a summary of each
							session, you can turn on AI insights{' '}
							<Link
								style={anchor}
								href="https://app.highlight.io/w/harold-ai"
							>
								here
							</Link>
							.
						</Text>
					</Section>
				)}

				<Section style={paragraph}>
					<Text style={text}>
						This digest was sent to{' '}
						<Link style={anchor} href={`mailto:${toEmail}`}>
							{toEmail}
						</Link>
						. If you don't want to receive emails like this in the
						future, you can{' '}
						<Link style={anchor} href={unsubscribeUrl}>
							unsubscribe
						</Link>
						.
					</Text>
				</Section>
				<Hr style={hr} />
				<Img
					style={logoFull}
					src="https://static.highlight.io/assets/digest/highlight-logo.png"
					width="70"
					height="16"
				/>
				<Text style={footer}>Seattle, WA 98122</Text>
			</Container>
		</Body>
	</Html>
)

export default SessionInsightsEmail

const main = {
	backgroundColor: '#0d0225',
	fontFamily: 'Helvetica, sans-serif',
	width: '100%',
	height: '100%',
}

const container = {
	margin: '0 auto',
	padding: '0 16px',
	marginBottom: '64px',
	textAlign: 'center' as const,
}

const hr = {
	borderColor: '#30294e',
	margin: '20px 0',
}

const text = {
	color: '#ffffff',
}

const highlightedText = {
	color: '#ebff5e',
}

const hoverAnchor = {
	color: '#ffffff',
}

const anchor = {
	color: '#72e4fc',
}

const footer = {
	color: '#9d97aa',
	fontSize: '12px',
	lineHeight: '16px',
}

const logo = {
	paddingTop: '32px',
	margin: '0 auto',
}

const logoFull = {
	margin: '24px auto 0',
}

const paragraph = {
	fontSize: '14px',
	fontWeight: '600',
	lineHeight: '22px',
}

const infoCard = {
	border: '1px solid #30294e',
	borderRadius: '12px',
	padding: '16px',
	marginBottom: '24px',
}

const contentContainer = {
	width: '400px',
}

const insight = {
	border: '1px solid #30294e',
	borderRadius: '6px',
	padding: '8px',
	marginTop: '8px',
	minHeight: '68px',
	fontSize: '14px',
}

const numberLabel = {
	color: '#9d97aa',
	backgroundColor: '#30294e',
	borderRadius: '3px',
}

const sessionScreenshot = {
	backgroundColor: '#6c37f4',
	width: '368px',
	height: '200px',
	borderRadius: '6px',
}

const identifier = {
	color: '#ffffff',
	margin: '8px 0',
	fontSize: '16px',
	height: '24px',
	overflow: 'hidden',
}

const identifierText = {
	color: '#ffffff',
	textDecoration: 'none',
}

const sessionProperties = {
	textAlign: 'left' as const,
	fontSize: '16px',
	width: '248px',
}

const sessionProperty = {
	color: '#ffffff',
	backgroundColor: 'rgba(255,255,255,0.32)',
	borderRadius: '100px',
	lineHeight: '26px',
	padding: '2px 12px',
	marginRight: '6px',
}

const avatar = {
	display: 'inline',
	borderRadius: '100px',
	verticalAlign: 'middle',
	marginRight: '4px',
}

const insightText = {
	...text,
	paddingLeft: '8px',
	textAlign: 'left' as const,
	wordBreak: 'break-word' as const,
}
