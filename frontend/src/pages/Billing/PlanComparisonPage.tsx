import { Button } from '@components/Button'
import {
	Box,
	IconSolidChatAlt,
	IconSolidCheck,
	IconSolidCheveronDown,
	IconSolidOfficeBuilding,
	IconSolidPuzzle,
	IconSolidReceiptTax,
	IconSolidServer,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useGetBillingDetailsQuery } from '@/graph/generated/hooks'
import { PlanType } from '@/graph/generated/schemas'
import { PlanSelectSteps } from '@/pages/Billing/UpdatePlanPage'
import { useParams } from '@/util/react-router/useParams'

import * as style from './PlanComparisonPage.css'

type Plan = {
	type: PlanType
	name: string
	descriptions: string[]
	icon: React.ReactNode
	price: number
}

const PLANS = [
	{
		type: PlanType.Free,
		name: 'Free',
		descriptions: ['Observability for individual developers'],
		icon: (
			<IconSolidReceiptTax
				size="24"
				color={vars.theme.static.content.weak}
			/>
		),
		price: 0,
	},
	{
		type: PlanType.Graduated,
		name: 'Pay as you go',
		descriptions: [
			'Monitoring for your production application',
			'Flexible billing that scales as you grow',
		],
		icon: <IconSolidPuzzle size="24" color="#0090FF" />,
		price: 50,
	},
	{
		type: PlanType.Enterprise,
		name: 'Enterprise (Cloud)',
		descriptions: [
			'Robust availability for large-scale demanding teams',
			'Support for SSO, RBAC, and other organizational requirements',
		],
		icon: <IconSolidServer size="24" color="#E93D82" />,
		price: 1000,
	},
	{
		type: PlanType.Enterprise,
		name: 'Enterprise (Self-hosted)',
		descriptions: [
			'Highly-available on-prem / cloud-prem deployments',
			'Bring your own infrastructure',
			'Govern data in your environment',
		],
		icon: (
			<IconSolidOfficeBuilding
				size="24"
				color={vars.theme.static.content.default}
			/>
		),
		price: 3000,
	},
] as Plan[]

const FAQ = [
	{
		question: 'Do you offer discounts for non-profit organizations?',
		answer: 'We love supporting non-profits and offer a 75% discount for the lifetime of the account. To activate the discount, create a workplace on a paying plan. Then reach out to us over email requesting the discount.',
	},
] as const

const PlanCard = ({
	plan,
	currentPlanType,
}: {
	plan: Plan
	currentPlanType?: PlanType
}) => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()
	const navigate = useNavigate()
	const current = plan.type === currentPlanType
	const enterprise = plan.type === PlanType.Enterprise
	return (
		<Stack
			p="12"
			paddingBottom="16"
			borderRadius="8"
			border="dividerWeak"
			boxShadow="small"
			width="full"
			gap="20"
		>
			{plan.icon}
			<Text size="large" weight="medium" color="strong">
				{plan.name}
			</Text>
			<h3 style={{ fontWeight: 700 }}>
				${plan.price}
				{plan.price >= 1000 ? '+' : ''}
			</h3>
			<Text size="xxSmall" color="weak" cssClass={style.priceSubtitle}>
				per month
			</Text>
			<Button
				trackingId={`planSelect-${plan.name}`}
				kind="secondary"
				size="small"
				emphasis="high"
				disabled={current}
				iconLeft={enterprise ? <IconSolidChatAlt /> : undefined}
				onClick={() => {
					if (enterprise) {
						// TODO(vkorolik)
					} else {
						navigate(`/w/${workspace_id}/current-plan/update-plan`)
					}
				}}
			>
				{enterprise
					? 'Talk to sales'
					: current
					? 'Current plan'
					: 'Get started'}
			</Button>
			<Stack>
				{plan.descriptions.map((d) => (
					<Box
						style={{
							display: 'grid',
							gap: 4,
							gridTemplateColumns: '14px 1fr',
						}}
						key={d}
					>
						<IconSolidCheck size={14} />
						<Text size="small" weight="medium" color="default">
							{d}
						</Text>
					</Box>
				))}
			</Stack>
		</Stack>
	)
}

const PlanComparisonPage: React.FC = () => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()
	const { data, loading } = useGetBillingDetailsQuery({
		variables: {
			workspace_id: workspace_id!,
		},
	})

	if (loading) {
		return null
	}

	return (
		<Box height="full" style={{ maxWidth: 960 }} margin="auto" py="32">
			<Stack>
				<PlanSelectSteps step="Select plan" />
				<Box
					display="flex"
					gap="12"
					alignItems="stretch"
					justifyContent="space-between"
				>
					{PLANS.map((plan) => (
						<PlanCard
							currentPlanType={data?.billingDetails.plan.type}
							plan={plan}
							key={plan.name}
						/>
					))}
				</Box>
				<Text size="large" weight="bold" color="strong">
					FAQ
				</Text>
				<Box
					display="flex"
					flexDirection="column"
					border="dividerWeak"
					borderRadius="8"
					px="8"
					paddingTop="4"
					paddingBottom="12"
				>
					{FAQ.map((faq) => (
						<Box
							key={faq.question}
							style={{
								display: 'grid',
								gap: 4,
								gridTemplateColumns: '24px 1fr',
							}}
						>
							<IconSolidCheveronDown
								size={24}
								color={
									vars.theme.interactive.fill.secondary
										.content.text
								}
							/>
							<Stack gap="12" paddingTop="6">
								<Text>{faq.question}</Text>
								<Text size="small" color="weak">
									{faq.answer}
								</Text>
							</Stack>
						</Box>
					))}
				</Box>
			</Stack>
		</Box>
	)
}

// TODO(vkorolik)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Modal: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
	return (
		<Box
			width="screen"
			display="flex"
			height="screen"
			position="fixed"
			alignItems="flex-start"
			justifyContent="center"
			style={{
				top: 0,
				left: 0,
				zIndex: '30000',
				overflow: 'hidden',
				backgroundColor: '#6F6E777A',
			}}
		>
			<Box
				display="flex"
				borderRadius="8"
				border="secondary"
				style={{
					marginTop: 'auto',
					marginBottom: 'auto',
					maxWidth: 920,
				}}
				backgroundColor="white"
			>
				{children}
			</Box>
		</Box>
	)
}
export default PlanComparisonPage
