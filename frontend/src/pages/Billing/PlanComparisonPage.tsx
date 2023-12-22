import {
	Box,
	IconSolidOfficeBuilding,
	IconSolidPuzzle,
	IconSolidReceiptTax,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'

import * as style from './PlanComparisonPage.css'

type Plan = {
	name: string
	description: string
	icon: React.ReactNode
	price: number
}

const PLANS = [
	{
		name: 'Free',
		description:
			'Best for individuals getting started with monitoring their app.',
		icon: <IconSolidReceiptTax size="24" color={vars.color.p9} />,
		price: 0,
	},
	{
		name: 'Pro',
		description:
			'Best for small teams getting comfortable with observability for their production application.',
		icon: <IconSolidPuzzle size="24" color={vars.color.r9} />,
		price: 50,
	},
	{
		name: 'Enterprise',
		description:
			'Best for large organizations with complex requirements and large-scale deployments.',
		icon: (
			<IconSolidOfficeBuilding
				size="24"
				color={vars.theme.static.content.default}
			/>
		),
		price: 3000,
	},
] as Plan[]

const PlanCard = ({ plan }: { plan: Plan }) => {
	return (
		<Stack
			p="12"
			borderRadius="8"
			border="dividerWeak"
			width="full"
			gap="20"
		>
			{plan.icon}
			<Text size="large" weight="bold" color="strong">
				{plan.name}
			</Text>
			<Text size="small" weight="medium" color="default">
				{plan.description}
			</Text>
			<h3>${plan.price}</h3>
			<Text size="xxSmall" color="weak" cssClass={style.priceSubtitle}>
				per month, billed annually
			</Text>
			<Box borderBottom="divider" />
		</Stack>
	)
}

type PlanComparisonPageProps = {}

const PlanComparisonPage = ({}: PlanComparisonPageProps) => {
	// TODO(vkorolik) implement
	return (
		<Box height="full" style={{ maxWidth: 720 }} margin="auto" py="32">
			<Stack>
				<Box
					display="flex"
					gap="12"
					alignItems="center"
					justifyContent="space-between"
				>
					{PLANS.map((plan) => (
						<PlanCard plan={plan} key={plan.name} />
					))}
				</Box>
			</Stack>
		</Box>
	)
}

export default PlanComparisonPage
