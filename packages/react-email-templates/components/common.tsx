import {
	Body,
	Container,
	Head,
	Html,
	Img,
	Preview,
} from '@react-email/components'
import * as React from 'react'

interface EmailHtmlProps extends React.PropsWithChildren {
	previewText: string
}

export const EmailHtml: React.FC<EmailHtmlProps> = ({
	children,
	previewText,
}) => {
	return (
		<Html>
			<Head>
				<style>{css}</style>
			</Head>
			<Preview>{previewText}</Preview>
			<Body style={main}>
				<Container width={400} style={container}>
					{children}
				</Container>
			</Body>
		</Html>
	)
}

const css = `
    a {
        color: unset;
		text-decoration: none;
    }
`

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

export const HighlightLogo = () => {
	return (
		<Img
			src="https://static.highlight.io/assets/digest/logo-on-dark.png"
			width="32"
			height="32"
			alt="Highlight logo"
			style={logo}
		/>
	)
}

const logo = {
	paddingTop: '32px',
	margin: '0 auto',
}
