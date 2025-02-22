import { LinkButton } from '@components/LinkButton'
import {
	Badge,
	Box,
	IconSolidCheck,
	IconSolidExternalLink,
	Stack,
	Text,
} from '@highlight-run/ui/components'

import { PRODUCT_AREA_KEYS, PRODUCT_AREAS, ProductArea } from '../constants'
import * as styles from './style.css'

export const FeatureHealthCheck: React.FC = () => {
	return (
		<Stack pt="2" gap="8">
			<Text color="moderate">Health</Text>
			<div className={styles.featureGrid}>
				{PRODUCT_AREA_KEYS.map((area: ProductArea) => (
					<FeatureIntegrationCheck key={area} product={area} />
				))}
			</div>
		</Stack>
	)
}

type FeatureIntegrationCheckProps = {
	product: ProductArea
}

const FeatureIntegrationCheck: React.FC<FeatureIntegrationCheckProps> = ({
	product,
}) => {
	const { title, icon, link, useIntegration, hidden } = PRODUCT_AREAS[product]
	const { integrated } = useIntegration()

	if (hidden) {
		return null
	}

	return (
		<Stack
			borderRadius="6"
			p="2"
			gap="2"
			background={integrated ? 'informative' : 'secondaryPressed'}
		>
			<Stack
				direction="row"
				align="center"
				justifyContent="space-between"
				p="8"
				borderRadius="6"
				background="default"
			>
				<Badge variant="outlineGray" label={title} iconStart={icon} />
				<LinkButton
					trackingId={`health-check-${product}`}
					to={link}
					iconRight={<IconSolidExternalLink />}
					kind="secondary"
					size="xSmall"
					disabled={!integrated}
				>
					View
				</LinkButton>
			</Stack>
			<Box py="2" display="flex" justifyContent="center">
				{integrated ? (
					<Box display="flex" gap="4" align="center">
						<IconSolidCheck color="#6346AF" />
						<Text color="informative" size="xSmall">
							Installation complete
						</Text>
					</Box>
				) : (
					<Box py="4">
						<Text color="moderate" size="xSmall">
							Waiting...
						</Text>
					</Box>
				)}
			</Box>
		</Stack>
	)
}
