import {
	Box,
	ButtonIcon,
	Dialog,
	IconSolidArrowsExpand,
	IconSolidX,
	Stack,
} from '@highlight-run/ui/components'
import { useNavigate } from 'react-router-dom'

import { PreviousNextGroup } from '@/components/PreviousNextGroup/PreviousNextGroup'
import { useRelatedResource } from '@/components/RelatedResources/hooks'

type Props = {
	path: string
}

export const PanelHeader: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	path,
}) => {
	const navigate = useNavigate()
	const dialogStore = Dialog.useContext()!

	return (
		<Box
			py="6"
			px="8"
			bb="dividerWeak"
			display="flex"
			alignItems="center"
			justifyContent="space-between"
		>
			<Stack gap="4" direction="row" alignItems="center">
				<ButtonIcon
					icon={<IconSolidArrowsExpand />}
					emphasis="low"
					kind="secondary"
					onClick={() => {
						navigate(path)
					}}
				/>

				<Pagination />
			</Stack>

			<Stack gap="4" direction="row" alignItems="center">
				{children}

				<ButtonIcon
					icon={<IconSolidX />}
					emphasis="low"
					kind="secondary"
					onClick={() => {
						dialogStore.hide()
					}}
				/>
			</Stack>
		</Box>
	)
}

const Pagination = () => {
	const { set, panelPagination } = useRelatedResource()

	if (!panelPagination?.resources.length) {
		return null
	}

	const canMoveForward =
		(panelPagination?.currentIndex ?? 0) <
		(panelPagination?.resources.length ?? 0) - 1
	const canMoveBackward = (panelPagination?.currentIndex ?? 0) > 0

	return (
		<PreviousNextGroup
			onPrev={() => {
				const nextIndex = panelPagination.currentIndex - 1

				if (panelPagination?.onChange) {
					panelPagination.onChange(
						panelPagination.resources[nextIndex],
					)
				}

				set(panelPagination.resources[nextIndex], {
					...panelPagination,
					currentIndex: nextIndex,
				})
			}}
			prevShortcut="h"
			onNext={() => {
				const nextIndex = panelPagination.currentIndex + 1

				if (panelPagination?.onChange) {
					panelPagination.onChange(
						panelPagination.resources[nextIndex],
					)
				}

				set(panelPagination.resources[nextIndex], {
					...panelPagination,
					currentIndex: nextIndex,
				})
			}}
			nextShortcut="l"
			canMoveBackward={canMoveBackward}
			canMoveForward={canMoveForward}
		/>
	)
}
