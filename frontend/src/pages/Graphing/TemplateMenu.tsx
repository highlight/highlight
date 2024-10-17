import { useGetGraphTemplatesQuery } from '@/graph/generated/hooks'
import { Graph } from '@/graph/generated/schemas'
import {
	Box,
	IconSolidDotsHorizontal,
	Menu,
} from '@highlight-run/ui/components'

type ApplyTemplate = (template: Graph | undefined) => void

interface Props {
	previewTemplate: ApplyTemplate
	applyTemplate: ApplyTemplate
}

const TemplateMenu = ({ previewTemplate, applyTemplate }: Props) => {
	const { data, loading } = useGetGraphTemplatesQuery()
	return (
		<Menu placement="bottom-end">
			<Menu.Button
				emphasis="medium"
				kind="secondary"
				icon={<IconSolidDotsHorizontal />}
				disabled={loading}
			>
				Templates
			</Menu.Button>
			<Menu.List>
				{data?.graph_templates.map((t) => (
					<Menu.Item
						key={t.id}
						onMouseEnter={() => previewTemplate(t)}
						onMouseLeave={() => previewTemplate(undefined)}
						onClick={() => applyTemplate(t)}
					>
						<Box display="flex" alignItems="center" gap="4">
							{t.title}
						</Box>
					</Menu.Item>
				))}
			</Menu.List>
		</Menu>
	)
}

export default TemplateMenu
