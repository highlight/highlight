import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Box } from '@highlight-run/ui/components'
import clsx from 'clsx'

import * as style from './DashboardCard.css'

export const DashboardCard = ({
	id,
	children,
	editing,
}: React.PropsWithChildren<{ id: string; editing: boolean }>) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id })

	const dndStyle = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<Box
			px="8"
			py="6"
			cssClass={clsx(style.graphCard, {
				[style.dragging]: isDragging,
				[style.editing]: editing,
			})}
			ref={setNodeRef}
			style={dndStyle}
			{...attributes}
			{...listeners}
		>
			<Box borderRadius="6" px="8" py="6" cssClass={style.cardInner}>
				{children}
			</Box>
		</Box>
	)
}
