import {
	Body,
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
	activityGraphUrl: string
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
	screenshotUrl: 'https://zane.test/404',
	activityGraphUrl:
		'https://static.highlight.io/assets/session-insights/activity.png',
	avatarUrl:
		'https://lh3.googleusercontent.com/a-/AOh14Gg3zY3_wfixRrZjjMuj2eTrBAOKDZrDWeYlHsjL=s96-c',
	country: 'Germany',
	activeLength: '1h 25m',
	insights: [
		`The user viewed an error page with the URL 'https://app.highlight.io/1/errors/7YboUB1obqGbOZV95X40gZrTGyRC/instances/196875448/?page=1&query=and%7C%7Cerror_state%2Cis%2COPEN%7C%7Cerror-field_timestamp%2Cbetween_date%2C2023-06-05T18%3A32%3A16.319Z_2023-07-05T18%3A32%3A16.319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z319Z'`,
		'The customer changed their billing settings on the billing page. This is a really long insight. I wonder what happens when the insight is this long.',
		'The customer logged out at 45:32.',
	],
}

const css = `
    a {
        color: unset;
		text-decoration: none;
    }
`

export const SessionInsightsEmail = ({
	projectName = 'Highlight Production (app.highlight.io)',
	toEmail = 'zane@highlight.io',
	unsubscribeUrl = 'https://app.highlight.io/unsubscribe',
	useHarold = false,
	interestingSessions = [sessionExample, sessionExample, sessionExample],
}: SessionInsightsEmailProps) => (
	<Html>
		<Head>
			<style>{css}</style>
		</Head>
		<Preview>Session insights for {projectName}</Preview>
		<Body style={main}>
			<Container width={400} style={container}>
				<Img
					src="https://static.highlight.io/assets/digest/logo-on-dark.png"
					width="32"
					height="32"
					alt="Highlight logo"
					style={logo}
				/>
				<Heading style={headingText}>
					<span style={highlightedText}>
						<a style={highlightedText}>{projectName}</a>
					</span>
					<br />
					Session Insights
				</Heading>
				<Text style={subtitleText}>
					Here are 3 interesting* sessions recorded in your project
					this week:
				</Text>
				<Hr style={hr} />
				{interestingSessions.map((s, idx) => (
					<>
						<Section width={378}>
							<Link href={s.url}>
								<Img
									src={s.screenshotUrl}
									style={sessionScreenshot}
									width={378}
									height={206}
								/>
							</Link>
						</Section>
						<Section width={378} style={sessionAttributes}>
							<Column
								align="left"
								width={266}
								style={sessionProperties}
							>
								<Section align="left" style={leftAlign}>
									<Text style={identifier}>
										{s.avatarUrl && (
											<>
												<Img
													src={s.avatarUrl}
													width="22"
													height="22"
													style={avatar}
												/>
												&nbsp;
											</>
										)}
										<a style={identifierText}>
											{s.identifier}
										</a>
									</Text>
								</Section>
								<Section align="left" style={leftAlign}>
									<span style={sessionProperty}>
										{s.country}
									</span>
									&nbsp;
									<span style={sessionProperty}>
										{s.activeLength}
									</span>
								</Section>
								<Section
									align="left"
									style={{ ...leftAlign, marginTop: '8px' }}
								>
									<Link style={viewSessionText} href={s.url}>
										View Session →
									</Link>
								</Section>
							</Column>
							<Column width={132} style={activityGraphColumn}>
								<Img
									style={activityGraph}
									src={s.activityGraphUrl}
									width="132"
									height="66"
									alt="Session activity graph"
								/>
							</Column>
						</Section>
						{s.insights.map((i, idx) => (
							<Section width={378} key={idx} style={insight}>
								<Column width={24} style={numberLabel}>
									{idx + 1}
								</Column>
								<Column
									width={354}
									style={{ wordBreak: 'break-all' }}
								>
									<Text style={insightText}>{i}</Text>
								</Column>
							</Section>
						))}
						<Hr style={hr} />
					</>
				))}
				<Text style={paragraph}>
					* These are sessions with unusual user journeys. You can
					read more about our methodology{' '}
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
						Your workspace has AI insights turned off. If you would
						like this digest to include a summary of each session,
						you can turn on AI insights{' '}
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
					. If you don't want to receive emails like this in the
					future, you can{' '}
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
			</Container>
		</Body>
	</Html>
)

export default SessionInsightsEmail

const main = {
	backgroundColor: '#0d0225',
	fontFamily: 'Helvetica, sans-serif',
}

const container = {
	width: '400px',
	padding: '0 16px',
	textAlign: 'center' as const,
	margin: '0 auto',
}

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
	color: '#ffffff',
}

const insight = {
	border: '1px solid #30294e',
	borderRadius: '6px',
	padding: '8px',
	marginTop: '8px',
	fontSize: '14px',
}

const numberLabel = {
	color: '#9d97aa',
	backgroundColor: '#30294e',
	borderRadius: '3px',
}

const sessionScreenshot = {
	backgroundImage:
		'url("https://static.highlight.io/assets/session-insights/session4.png")',
	borderRadius: '6px',
	objectFit: 'cover' as const,
	width: '378px',
	height: '206px',
}

const identifier = {
	color: '#ffffff',
	margin: '8px 0',
	fontSize: '16px',
	height: '24px',
	overflow: 'hidden',
	textAlign: 'left' as const,
}

const identifierText = {
	color: '#ffffff',
	textDecoration: 'none',
}

const sessionAttributes = {
	marginBottom: '16px',
	marginTop: '8px',
}

const viewSessionText = {
	...anchor,
	fontSize: '16px',
}

const subtitleText = {
	...text,
	fontSize: '16px',
}

const leftAlign = {
	textAlign: 'left' as const,
}

const sessionProperties = {
	textAlign: 'left' as const,
	fontSize: '16px',
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
	margin: '8px 0',
}

const activityGraph = {
	width: '132px',
	height: '66px',
}

const activityGraphColumn = {
	paddingTop: '8px',
	verticalAlign: 'middle',
}

const headingText = {
	...text,
	fontSize: '36px',
	lineHeight: '44px',
}
