import { useGetGraphTemplatesQuery } from '@/graph/generated/hooks'
import { Graph } from '@/graph/generated/schemas'
import {
	Box,
	ButtonIcon,
	IconSolidChartSquareBar,
	IconSolidChartSquareLine,
	IconSolidLocationMarker,
	IconSolidTable,
	IconSolidX,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import * as style from './TemplateMenu.css'
import { vars } from '@highlight-run/ui/vars'

type ApplyTemplate = (template: Graph | undefined) => void

interface Props {
	onClose: () => void
	previewTemplate: ApplyTemplate
	applyTemplate: ApplyTemplate
}

const TemplateMenu = ({ previewTemplate, applyTemplate, onClose }: Props) => {
	const { data } = useGetGraphTemplatesQuery()
	return (
		<Box>
			<Box
				display="flex"
				alignItems="center"
				userSelect="none"
				px="8"
				py="4"
				bb="secondary"
				justifyContent="space-between"
			>
				<Text
					size="xxSmall"
					color="secondaryContentText"
					weight="medium"
				>
					Templates
				</Text>
				<ButtonIcon
					kind="secondary"
					emphasis="none"
					size="minimal"
					onClick={onClose}
					icon={
						<IconSolidX
							size={14}
							color={
								vars.theme.interactive.fill.secondary.content
									.text
							}
						/>
					}
				/>
			</Box>
			<Box cssClass={style.templateGrid}>
				{data?.graph_templates.map((t) => (
					<Box key={t.id} p="12">
						<Box flexDirection="column" display="flex" gap="8">
							<button
								className={style.templatePreview}
								onMouseEnter={() => previewTemplate(t)}
								onMouseLeave={() => previewTemplate(undefined)}
								onClick={() => applyTemplate(t)}
							>
								{t.type === 'Line chart' && (
									<IconSolidChartSquareLine
										size={64}
										color={
											vars.theme.static.content.default
										}
									/>
								)}
								{t.type === 'Bar chart' && (
									<IconSolidChartSquareBar
										size={64}
										color={
											vars.theme.static.content.default
										}
									/>
								)}
								{t.type === 'Funnel chart' && (
									<IconSolidLocationMarker
										size={64}
										color={
											vars.theme.static.content.default
										}
									/>
								)}
								{t.type === 'Table' && (
									<IconSolidTable
										size={64}
										color={
											vars.theme.static.content.default
										}
									/>
								)}
							</button>
							<Box width="full">
								<Text
									lines="1"
									size="small"
									weight="medium"
									cssClass={style.templateTitle}
								>
									{t.title}
								</Text>
							</Box>
							<Box>
								<Tooltip
									trigger={
										<Text
											lines="1"
											size="small"
											weight="medium"
											cssClass={style.templateDescription}
										>
											{t.description}
										</Text>
									}
									delayed
								>
									{t.description}
								</Tooltip>
							</Box>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	)
}

export default TemplateMenu
