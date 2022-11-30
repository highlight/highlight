import { Box } from '@highlight-run/ui'
import React from 'react'

type Props = React.PropsWithChildren
type OnboardingCardComponent = React.FC<Props> & {
	Header: typeof Header
	Footer: typeof Footer
	Body: typeof Body
}

const Header = ({ children }: React.PropsWithChildren) => {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			flexDirection="column"
			style={{ borderRadius: 8, backgroundColor: '#f9f8f9' }}
		>
			{children}
		</Box>
	)
}

const Footer = ({ children }: React.PropsWithChildren) => {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			flexDirection="column"
		>
			{children}
		</Box>
	)
}

const Body = ({ children }: React.PropsWithChildren) => {
	return (
		<Box
			display="flex"
			alignItems="center"
			width="full"
			justifyContent="center"
			flexDirection="column"
			cssClass="px-[20px] py-[12px] bg-white"
			style={{
				borderBottom: '1px solid rgb(220, 219, 221)',
				borderTop: '1px solid rgb(220, 219, 221)',
			}}
		>
			{children}
		</Box>
	)
}

const OnboardingCard: OnboardingCardComponent = ({ children }: Props) => {
	return (
		<Box
			display="flex"
			flexDirection="column"
			cssClass="w-[280px] rounded-[8px] bg-[#F9F8F9]"
		>
			{children}
		</Box>
	)
}

OnboardingCard.Header = Header
OnboardingCard.Footer = Footer
OnboardingCard.Body = Body

export default OnboardingCard
