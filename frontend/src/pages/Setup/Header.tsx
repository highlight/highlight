import {
	Badge,
	Box,
	Heading,
	IconSolidCheveronRight,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { upperFirst } from 'lodash'
import React from 'react'
import { useMatch, useNavigate } from 'react-router-dom'

type Props = React.PropsWithChildren & {
	title: string
	subtitle?: string
}

export const Header: React.FC<Props> = ({ title, subtitle }) => {
	const navigate = useNavigate()
	const breadcrumbs = useSetupBreadcrumbs()

	return (
		<>
			<Stack direction="row" align="center" gap="4">
				{breadcrumbs.map((breadcrumb, index) => (
					<Stack gap="6" direction="row" align="center" key={index}>
						{index > 0 && <IconSolidCheveronRight />}
						{index < breadcrumbs.length - 1 ? (
							<Tag
								kind="secondary"
								emphasis="low"
								shape="basic"
								onClick={() => navigate(breadcrumb.path)}
							>
								{breadcrumb.label}
							</Tag>
						) : (
							<Badge
								kind="white"
								label={breadcrumb.label}
								size="medium"
							/>
						)}
					</Stack>
				))}
			</Stack>
			<Heading mt="16">{title}</Heading>
			<Box my="24">
				<Text>{subtitle}</Text>
			</Box>
		</>
	)
}

export const useSetupBreadcrumbs = () => {
	const areaMatch = useMatch('/:project_id/setup/:area')
	const languageMatch = useMatch('/:project_id/setup/:area/:language')
	const frameworkMatch = useMatch(
		'/:project_id/setup/:area/:language/:framework',
	)
	const match = frameworkMatch ?? languageMatch ?? areaMatch
	const { project_id, area, language, framework } =
		match?.params || ({} as any)

	// Ignoring languages that only have a single entry.
	const ignoreLanguage =
		(area === 'client' && language === 'js') ||
		(area === 'backend-logging' && language === 'http-otlp') ||
		(area === 'backend-logging' && language === 'python')

	const breadcrumbs = [
		{
			path: `/${project_id}/setup/${area}`,
			label: upperFirst(area.replace('-', ' ')),
		},
	]

	if (language && !ignoreLanguage) {
		breadcrumbs.push({
			path: `/${project_id}/setup/${area}/${language}`,
			label: upperFirst(language),
		})
	}

	if (framework) {
		breadcrumbs.push({
			path: `/${project_id}/setup/${area}/${language}/${framework}`,
			label: upperFirst(framework),
		})
	}

	return breadcrumbs
}
