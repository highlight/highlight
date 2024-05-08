import {
	Box,
	Button,
	Callout,
	IconSolidPlus,
	IconSolidXCircle,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useNavigate } from 'react-router-dom'

export const EmptyDashboardCallout = () => {
	const navigate = useNavigate()

	return (
		<Box
			height="full"
			width="full"
			display="flex"
			alignItems="center"
			justifyContent="center"
		>
			<Callout
				border
				style={{
					maxWidth: '340px',
				}}
				title="No visualizations created"
				icon={() => (
					<Box
						borderRadius="5"
						style={{
							alignItems: 'center',
							backgroundColor: '#E9E9E9',
							display: 'flex',
							height: 22,
							justifyContent: 'center',
							textAlign: 'center',
							width: 22,
						}}
					>
						<IconSolidXCircle size={14} color="#777777" />
					</Box>
				)}
			>
				<Text color="n11">
					It seems like this dashboard is empty. Get started by adding
					your first graph!
				</Text>
				<Stack direction="row" gap="8">
					<Button
						emphasis="high"
						kind="secondary"
						iconLeft={<IconSolidPlus />}
						onClick={() => {
							navigate({
								pathname: 'new',
								search: location.search,
							})
						}}
					>
						Add graph
					</Button>
					<Button
						emphasis="low"
						kind="secondary"
						onClick={() => {
							window.open(
								'https://www.highlight.io/docs/general/product-features/metrics/overview',
								'_blank',
							)
						}}
					>
						Learn more
					</Button>
				</Stack>
			</Callout>
		</Box>
	)
}
