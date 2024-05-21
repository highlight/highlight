import { toast } from '@components/Toaster'
import {
	Box,
	ButtonIcon,
	Dialog,
	IconSolidArrowLeft,
	IconSolidArrowsExpand,
	IconSolidLink,
	IconSolidX,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import { PreviousNextGroup } from '@/components/PreviousNextGroup/PreviousNextGroup'
import { useRelatedResource } from '@/components/RelatedResources/hooks'

type Props = React.PropsWithChildren & {
	path?: string
}

export const PanelHeader: React.FC<Props> = ({ children, path }) => {
	const navigate = useNavigate()
	const dialogStore = Dialog.useContext()!
	const { resource } = useRelatedResource()

	return (
		<Stack
			py="6"
			px="8"
			bb="dividerWeak"
			align="center"
			gap="4"
			direction="row"
		>
			<Stack gap="8" direction="row" align="center" pr="4">
				{resource?.canGoBack && (
					<ButtonIcon
						icon={<IconSolidArrowLeft />}
						emphasis="medium"
						kind="secondary"
						onClick={() => {
							navigate(-1)
						}}
					/>
				)}

				<Pagination />
			</Stack>

			<Stack
				gap="4"
				direction="row"
				alignItems="center"
				flexGrow={1}
				overflow="hidden"
				justifyContent="flex-end"
			>
				{children}
			</Stack>

			{path && (
				<Link to={path}>
					<ButtonIcon
						icon={<IconSolidArrowsExpand />}
						emphasis="low"
						kind="secondary"
						onClick={() => null}
					/>
				</Link>
			)}

			<ButtonIcon
				icon={<IconSolidX />}
				emphasis="low"
				kind="secondary"
				onClick={() => {
					dialogStore.hide()
				}}
			/>
		</Stack>
	)
}

export const PanelHeaderDivider = () => (
	<Box bl="divider" style={{ height: 16, width: 0 }} />
)

export const PanelHeaderCopyLinkButton: React.FC<{ path: string }> = ({
	path,
}) => (
	<Button
		kind="secondary"
		emphasis="low"
		size="small"
		iconLeft={<IconSolidLink />}
		trackingId="related-resource_back-button"
		onClick={() => {
			navigator.clipboard.writeText(window.location.origin + path)
			toast.success('Link copied to clipboard!')
		}}
	>
		Copy link
	</Button>
)

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
		<Stack direction="row" align="center" gap="6">
			<PreviousNextGroup
				onPrev={goToPrevious}
				onNext={goToNext}
				prevShortcut="l"
				nextShortcut="h"
				canMoveBackward={canMoveBackward}
				canMoveForward={canMoveForward}
			/>
			<Text color="weak" size="xSmall">
				{panelPagination.currentIndex + 1}/
				{panelPagination.resources.length}
			</Text>
		</Stack>
	)
}
