import { useMemo } from 'react'
import {
	Badge,
	Box,
	IconSolidCheckCircle,
	IconSolidInformationCircle,
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { quickStartContentReorganized, QuickStartContent } from 'highlight.io'

import CollapsibleSection from '@/components/CollapsibleSection'
import {
	ICON_MAPPINGS,
	PRODUCT_AREAS,
	ProductArea,
} from '@/pages/Connect/constants'

import * as styles from './style.css'

const QUICKSTART_KEYS = Object.keys(quickStartContentReorganized)

type Props = {
	selectedPlatforms: Set<string>
	setSelectedPlatforms: (platforms: Set<string>) => void
}

export const PlatformSelection = ({
	selectedPlatforms,
	setSelectedPlatforms,
}: Props) => {
	const handleSelect = (platform: string, remove: boolean) => {
		if (remove) {
			const newSet = new Set(selectedPlatforms)
			newSet.delete(platform)
			setSelectedPlatforms(newSet)
		} else {
			const newSet = new Set(selectedPlatforms)
			newSet.add(platform)
			setSelectedPlatforms(newSet)
		}
	}

	const selectedLanguageCounts = useMemo(() => {
		const counts: Record<string, number> = {}
		for (const platform of selectedPlatforms) {
			const language = platform.split('_')[0]
			if (counts[language]) {
				counts[language] += 1
			} else {
				counts[language] = 1
			}
		}
		return counts
	}, [selectedPlatforms])

	return (
		<Box width="full">
			{QUICKSTART_KEYS.map((languageKey, index) => {
				const content = (quickStartContentReorganized as any)[
					languageKey
				]
				const contentLength = Object.keys(content.sdks).length
				const lastSection = index === QUICKSTART_KEYS.length - 1
				const selectedCount = selectedLanguageCounts[languageKey]

				return (
					<CollapsibleSection
						key={languageKey}
						title={
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
								width="full"
							>
								<Stack
									direction="row"
									alignItems="center"
									gap="8"
									width="full"
								>
									<Box>{content.title}</Box>
									<Box>
										<Text color="weak">
											{contentLength}
										</Text>
									</Box>
								</Stack>
								{!!selectedCount && (
									<Box display="flex" px="8">
										<Badge
											shape="basic"
											size="small"
											variant="purple"
											label={String(selectedCount)}
										/>
									</Box>
								)}
							</Stack>
						}
						defaultOpen={index === 0}
						hideBorder={lastSection}
					>
						<div className={styles.languageGrid}>
							{Object.keys(content.sdks).map((frameworkKey) => {
								const identifier = `${languageKey}_${frameworkKey}`

								return (
									<LanguageOption
										key={identifier}
										identifier={identifier}
										sdk={content.sdks[frameworkKey]}
										handleSelect={handleSelect}
										selected={selectedPlatforms.has(
											identifier,
										)}
									/>
								)
							})}
						</div>
					</CollapsibleSection>
				)
			})}
		</Box>
	)
}

type LanguageOptionProps = {
	identifier: string
	sdk: QuickStartContent
	handleSelect: (platform: string, remove: boolean) => void
	selected: boolean
}

const LanguageOption: React.FC<LanguageOptionProps> = ({
	identifier,
	sdk,
	handleSelect,
	selected,
}) => {
	const { title, logoKey, products = [] } = sdk
	const handleSelectOption = () => {
		handleSelect(identifier, selected)
	}

	return (
		<Stack
			align="center"
			justifyContent="space-between"
			direction="row"
			background="raised"
			borderRadius="8"
			py="4"
			px="8"
			cursor="pointer"
			as="button"
			border={selected ? 'primaryPressed' : 'dividerWeak'}
			borderWidth="medium"
			onClick={handleSelectOption}
		>
			<Stack direction="row" align="center" gap="10">
				<Box
					alignItems="center"
					display="flex"
					justifyContent="center"
					style={{ height: 40, width: 40 }}
					borderRadius="5"
					border="secondary"
					borderWidth="medium"
				>
					{logoKey && ICON_MAPPINGS.hasOwnProperty(logoKey) ? (
						<img
							alt={title}
							title={title}
							src={(ICON_MAPPINGS as any)[logoKey]}
							style={{ height: 30, width: 30, borderRadius: 5 }}
						/>
					) : (
						<Text userSelect="none" weight="bold" title={title}>
							{title[0].toUpperCase()}
						</Text>
					)}
				</Box>
				<Stack gap="8" align="flex-start" py="4">
					<Text weight="bold" align="left">
						{title}
					</Text>
					{!!products.length && (
						<ProductAreaIcons
							products={products as ProductArea[]}
						/>
					)}
				</Stack>
			</Stack>
			<div
				className={styles.checkbox}
				style={{
					backgroundColor: selected
						? vars.theme.interactive.fill.primary.enabled
						: 'white',
				}}
			>
				<IconSolidCheckCircle color="white" />
			</div>
		</Stack>
	)
}

const ProductAreaIcons = ({ products }: { products: ProductArea[] }) => {
	const Icons = (
		<Box p="4" display="flex" flexDirection="row" gap="4">
			{products.map((product) => {
				const { title, icon } = PRODUCT_AREAS[product]
				return (
					<Badge
						key={title}
						variant="purple"
						label={title}
						iconStart={icon}
						size="small"
					/>
				)
			})}
		</Box>
	)

	return (
		<Tooltip
			trigger={
				<Badge
					label="Products"
					variant="gray"
					size="small"
					iconStart={<IconSolidInformationCircle />}
				/>
			}
			delayed
		>
			{Icons}
		</Tooltip>
	)
}
