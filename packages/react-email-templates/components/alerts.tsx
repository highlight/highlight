import { Heading, Hr, Img, Link, Section, Text } from '@react-email/components'
import * as React from 'react'

export const textStyle = {
	color: '#ffffff',
	fontSize: '14px',
	lineHeight: '22px',
	margin: 0,
}

export const highlightedTextStyle = {
	color: '#ebff5e',
}

export const Title: React.FC<React.PropsWithChildren> = ({ children }) => {
	return <Heading style={headingText}>{children}</Heading>
}

const headingText = {
	...textStyle,
	fontSize: '26px',
	lineHeight: '36px',
	paddingBottom: '8px',
	paddingTop: '16px',
}

export const Subtitle: React.FC<React.PropsWithChildren> = ({ children }) => {
	return <Text style={subtitleText}>{children}</Text>
}

const subtitleText = {
	...textStyle,
	color: '#9d97aa',
}

export const AlertContainer: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	return (
		<Section align="center" style={alertContainer}>
			{children}
		</Section>
	)
}

const alertContainer = {
	border: '1px solid #30294e',
	borderRadius: '6px',
	fontSize: '14px',
	margin: '36px 0',
	padding: '12px',
}

export const Break: React.FC = () => {
	return <Hr style={hr} />
}

const hr = {
	borderTop: '1px solid #30294e',
	color: '#30294e',
	margin: '12px 0',
}

interface CtaLinkProps {
	href: string
	label: string
}

export const CtaLink: React.FC<CtaLinkProps> = ({ href, label }) => {
	return (
		<Link href={href} style={cta}>
			{label}
			<svg
				fill="none"
				height="18"
				style={ctaIcon}
				viewBox="0 0 20 20"
				width="18"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z"
					fill="#6F6E77"
				/>
				<path
					d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7L8 7C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z"
					fill="#6F6E77"
				/>
			</svg>
		</Link>
	)
}

const cta = {
	borderRadius: '6px',
	color: '#ffffff',
	display: 'table',
	fontSize: '16px',
	lineHeight: '26px',
	outline: '1px solid #ffffff',
	padding: '4px 0',
	width: '100%',
}

const ctaIcon = {
	verticalAlign: 'bottom',
	padding: '4px 8px',
}

interface FooterProps {
	alertLink: string
}

export const Footer: React.FC<FooterProps> = ({ alertLink }) => {
	return (
		<>
			<Text style={unsubscribeText}>
				If you don't want to receive emails for these alerts in the
				future, you can edit your alert settings{' '}
				<Link href={alertLink}>here</Link>.
			</Text>
			<Img
				alt="Highlight logo"
				height="16"
				src="https://static.highlight.io/assets/digest/highlight-logo.png"
				style={logoFull}
				width="70"
			/>
			<Text style={footer}>Seattle, WA 98122</Text>
		</>
	)
}

const unsubscribeText = {
	color: '#9d97aa',
	fontSize: '12px',
	lineHeight: '20px',
	margin: '36px 0',
}

const logoFull = {
	margin: '24px auto 0',
}

const footer = {
	color: '#9d97aa',
	fontSize: '10px',
	lineHeight: '16px',
}
