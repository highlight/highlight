import { useGetGraphTemplatesQuery } from '@/graph/generated/hooks'
import { Graph } from '@/graph/generated/schemas'
import { Box, ButtonIcon, IconSolidX, Text } from '@highlight-run/ui/components'
import * as style from './TemplateMenu.css'
import { vars } from '@highlight-run/ui/vars'

type ApplyTemplate = (template: Graph | undefined) => void

interface Props {
	onClose: () => void
	previewTemplate: ApplyTemplate
	applyTemplate: ApplyTemplate
}

const TemplateMenu = ({ previewTemplate, applyTemplate, onClose }: Props) => {
	const { data, loading } = useGetGraphTemplatesQuery()
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
						<Box
							flexDirection="column"
							display="flex"
							gap="8"
							onMouseEnter={() => previewTemplate(t)}
							onMouseLeave={() => previewTemplate(undefined)}
							onClick={() => applyTemplate(t)}
						>
							<Box cssClass={style.templatePreview}> </Box>
							<Box width="full">
								<Text
									lines="1"
									size="small"
									color="default"
									weight="medium"
								>
									{t.title}
								</Text>
							</Box>
							<Box>
								<Text
									lines="1"
									size="small"
									color="secondaryContentText"
									weight="medium"
								>
									{t.description}
								</Text>
							</Box>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	)
}

export default TemplateMenu
