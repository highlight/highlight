import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
	Badge,
	Box,
	Button,
	IconSolidArrowsExpand,
	IconSolidCursorClick,
	IconSolidDesktopComputer,
	IconSolidDocumentDownload,
	IconSolidDotsHorizontal,
	IconSolidDuplicate,
	IconSolidPencil,
	IconSolidTrash,
	Menu,
} from '@highlight-run/ui/components'
import clsx from 'clsx'

import * as style from './DashboardCard.css'
import { useState } from 'react'

export const DashboardCard = ({
	id,
	onClone,
	onDelete,
	onDownload,
	onExpand,
	onEdit,
	children,
}: React.PropsWithChildren<{
	id: string
	onClone?: () => void
	onDelete?: () => void
	onDownload?: () => void
	onExpand?: () => void
	onEdit?: () => void
}>) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id })

	const dndStyle = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	const [graphHover, setGraphHover] = useState(false)

	return (
		<Box
			px="8"
			py="6"
			cssClass={clsx(style.graphCard, {
				[style.cardDragging]: isDragging,
			})}
			onMouseEnter={() => {
				setGraphHover(true)
			}}
			onMouseLeave={() => {
				setGraphHover(false)
			}}
		>
			<Box
				borderRadius="6"
				px="8"
				py="6"
				cssClass={style.cardInner}
				position="relative"
				ref={setNodeRef}
				style={dndStyle}
				{...attributes}
			>
				{graphHover && (
					<Box cssClass={style.buttonContainer}>
						<Box>
							<Button
								size="xSmall"
								emphasis="low"
								kind="secondary"
								iconLeft={
									<IconSolidArrowsExpand
										style={{
											cursor: isDragging
												? 'grabbing'
												: 'grab',
										}}
									/>
								}
								ref={setActivatorNodeRef}
								{...listeners}
								style={{
									cursor: isDragging ? 'grabbing' : 'grab',
								}}
							/>
							{onEdit !== undefined && (
								<Button
									size="xSmall"
									emphasis="low"
									kind="secondary"
									iconLeft={<IconSolidPencil />}
									onClick={onEdit}
								/>
							)}
							{(onExpand || onDelete || onClone) && (
								<Menu>
									<Menu.Button
										size="xSmall"
										emphasis="low"
										kind="secondary"
										iconLeft={<IconSolidDotsHorizontal />}
										onClick={(e: any) => {
											e.stopPropagation()
										}}
									/>
									<Menu.List>
										{onExpand && (
											<Menu.Item
												onClick={(e) => {
													e.stopPropagation()
													onExpand()
												}}
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconSolidDesktopComputer />
													Expand metric view
												</Box>
											</Menu.Item>
										)}
										{onDownload && (
											<Menu.Item
												onClick={(e) => {
													e.stopPropagation()
													onDownload()
												}}
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconSolidDocumentDownload />
													Download CSV
												</Box>
											</Menu.Item>
										)}
										{onClone && (
											<Menu.Item
												onClick={(e) => {
													e.stopPropagation()
													onClone()
												}}
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconSolidDuplicate />
													Clone metric view
												</Box>
											</Menu.Item>
										)}
										{onDelete && (
											<Menu.Item
												onClick={(e) => {
													e.stopPropagation()
													onDelete()
												}}
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconSolidTrash />
													Delete metric view
												</Box>
											</Menu.Item>
										)}
									</Menu.List>
								</Menu>
							)}
						</Box>
						<Badge
							variant="gray"
							size="small"
							iconStart={<IconSolidCursorClick />}
							label="Click to drilldown"
							cssClass={style.drilldownHint}
						/>
					</Box>
				)}
				{children}
			</Box>
		</Box>
	)
}
