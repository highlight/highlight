import {
	Box,
	ButtonIcon,
	Dialog,
	IconSolidArrowsExpand,
	IconSolidX,
	Stack,
} from '@highlight-run/ui/components'
import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
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

	const canMoveForward =
		(panelPagination?.currentIndex ?? 0) <
		(panelPagination?.resources.length ?? 0) - 1
	const canMoveBackward = (panelPagination?.currentIndex ?? 0) > 0

	const goToPrevious = useCallback(() => {
		if (!canMoveBackward || !panelPagination?.resources.length) {
			return
		}

		const nextIndex = panelPagination.currentIndex - 1

		if (panelPagination?.onChange) {
			panelPagination.onChange(panelPagination.resources[nextIndex])
		}

		set(panelPagination.resources[nextIndex], {
			...panelPagination,
			currentIndex: nextIndex,
		})
	}, [canMoveBackward, panelPagination, set])

	const goToNext = useCallback(() => {
		if (!canMoveForward || !panelPagination?.resources.length) {
			return
		}

		const nextIndex = panelPagination.currentIndex + 1

		if (panelPagination?.onChange) {
			panelPagination.onChange(panelPagination.resources[nextIndex])
		}

		set(panelPagination.resources[nextIndex], {
			...panelPagination,
			currentIndex: nextIndex,
		})
	}, [canMoveForward, panelPagination, set])

	useHotkeys('l', goToPrevious, [goToPrevious])
	useHotkeys('h', goToNext, [goToNext])

	if (!panelPagination?.resources.length) {
		return null
	}

	return (
		<PreviousNextGroup
			onPrev={goToPrevious}
			onNext={goToNext}
			prevShortcut="l"
			nextShortcut="h"
			canMoveBackward={canMoveBackward}
			canMoveForward={canMoveForward}
		/>
	)
}
