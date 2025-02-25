import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
	Badge,
	Box,
	Button,
	IconSolidArrowsExpand,
	IconSolidBell,
	IconSolidCursorClick,
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
import useLocalStorage from '@rehooks/local-storage'

export const DashboardCard = ({
	id,
	onClone,
	onDelete,
	onDownload,
	onCreateAlert,
	onExpand,
	onEdit,
	children,
}: React.PropsWithChildren<{
	id: string
	onClone?: () => void
	onDelete?: () => void
	onDownload?: () => void
	onCreateAlert?: () => void
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

	const [hasDrilledDown] = useLocalStorage<boolean>(
		'highlight-used-drilldown',
		false,
	)

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
				<Box>
					<Box
						style={{
							position: 'absolute',
							left: 0,
							width: '80%',
							zIndex: 2,
							lineHeight: '24px',
							height: '24px',
							cursor: isDragging ? 'grabbing' : 'grab',
						}}
						ref={setActivatorNodeRef}
						{...listeners}
					/>
					{graphHover && (
						<Box cssClass={style.buttonContainer}>
							<Box>
								{onExpand && (
									<Button
										size="xSmall"
										emphasis="low"
										kind="secondary"
										iconLeft={<IconSolidArrowsExpand />}
										onClick={onExpand}
									/>
								)}
								{onEdit !== undefined && (
									<Button
										size="xSmall"
										emphasis="low"
										kind="secondary"
										iconLeft={<IconSolidPencil />}
										onClick={onEdit}
									/>
								)}
								<Menu>
									<Menu.Button
										size="xSmall"
										emphasis="low"
										kind="secondary"
										iconLeft={<IconSolidDotsHorizontal />}
									/>
									<Menu.List>
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
										{onCreateAlert && (
											<Menu.Item
												onClick={(e) => {
													e.stopPropagation()
													onCreateAlert()
												}}
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconSolidBell />
													Create alert
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
													Clone graph
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
													Delete graph
												</Box>
											</Menu.Item>
										)}
									</Menu.List>
								</Menu>
							</Box>
							{!hasDrilledDown && (
								<Badge
									variant="gray"
									size="small"
									iconStart={<IconSolidCursorClick />}
									label="Click to drilldown"
									cssClass={style.drilldownHint}
								/>
							)}
						</Box>
					)}
					{children}
				</Box>
			</Box>
		</Box>
	)
}
