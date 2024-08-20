import { toast } from '@components/Toaster'
import { SavedSegmentEntityType } from '@graph/schemas'
import { colors } from '@highlight-run/ui/colors'
import {
	Box,
	IconSolidCheck,
	IconSolidCheveronDown,
	IconSolidCloudUpload,
	IconSolidDocumentDuplicate,
	IconSolidPencil,
	IconSolidPlus,
	IconSolidSegment,
	IconSolidTrash,
	Menu,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { forEach } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
	useEditSavedSegmentMutation,
	useGetSavedSegmentsQuery,
} from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'

import { CreateSavedSegmentModal } from '../CreateSavedSegmentModal'
import { DeleteSavedSegmentModal } from '../DeleteSavedSegmentModal'
import * as styles from './styles.css'

enum BuilderMode {
	CUSTOM = 'CUSTOM',
	SEGMENT = 'SEGMENT',
	SEGMENT_UPDATE = 'SEGMENT_UPDATE',
}

enum SegmentModalState {
	HIDDEN = 'HIDDEN',
	CREATE = 'CREATE',
	EDIT_NAME = 'EDIT_NAME',
	DELETE = 'DELETE',
}

type UseSavedSegmentsProps = {
	query: string
	entityType?: SavedSegmentEntityType
	projectId: string
	setQuery: (query?: string) => void
}

type SelectedSegment = {
	id: string
	name: string
	query: string
}

export const useSavedSegments = ({
	query,
	setQuery,
	entityType,
	projectId,
}: UseSavedSegmentsProps) => {
	const [segmentModalState, setSegmentModalState] = useState(
		SegmentModalState.HIDDEN,
	)
	const [selectedSegment, setSelectedSegment] =
		useState<SelectedSegment | null>(null)

	const { loading: segmentsLoading, data: segmentData } =
		useGetSavedSegmentsQuery({
			variables: {
				project_id: projectId!,
				entity_type: entityType!,
			},
			skip: !projectId || !entityType,
		})

	const [editSegment] = useEditSavedSegmentMutation({
		refetchQueries: [namedOperations.Query.GetSavedSegments],
	})

	useEffect(() => {
		if (!!selectedSegment) {
			return
		}
		forEach(segmentData?.saved_segments, (segment) => {
			if (segment?.params.query === query) {
				setSelectedSegment({
					id: segment.id,
					name: segment.name,
					query: segment.params?.query || '',
				})
				return
			}
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, segmentData?.saved_segments])

	const selectSegment = useCallback(
		(segment?: SelectedSegment, duplicateQuery?: boolean) => {
			setSelectedSegment(segment || null)
			if (!duplicateQuery) {
				setQuery(segment?.query)
			}
		},
		[setQuery],
	)

	const duplicateSegment = useCallback(() => {
		selectSegment(undefined, true)
		setSegmentModalState(SegmentModalState.CREATE)
	}, [selectSegment, setSegmentModalState])

	const updateSegment = useCallback(() => {
		if (!!selectedSegment) {
			editSegment({
				variables: {
					project_id: projectId!,
					entity_type: entityType as SavedSegmentEntityType,
					id: selectedSegment!.id,
					query: query,
					name: selectedSegment!.name,
				},
			})
				.then(() => {
					toast.success(`Updated '${selectedSegment!.name}'`, {
						duration: 5000,
					})
					selectSegment({
						id: selectedSegment.id,
						name: selectedSegment.name,
						query: query,
					})
				})
				.catch(() => {
					toast.error('Error updating segment!', { duration: 5000 })
				})
		}
	}, [
		editSegment,
		entityType,
		projectId,
		query,
		selectSegment,
		selectedSegment,
	])

	const mode = useMemo(() => {
		if (!!selectedSegment?.query) {
			if (selectedSegment.query === query) {
				return BuilderMode.SEGMENT
			} else {
				return BuilderMode.SEGMENT_UPDATE
			}
		}
		return BuilderMode.CUSTOM
	}, [query, selectedSegment])

	const segmentOptions = useMemo(
		() =>
			(segmentData?.saved_segments || [])
				.map((segment) => ({
					name: segment?.name || '',
					id: segment?.id || '',
					query: segment?.params?.query || '',
				}))
				.sort((a, b) =>
					a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
				),
		[segmentData?.saved_segments],
	)

	const menuOptions = useMemo(() => {
		const segmentMenuOptions = () => {
			return (
				<>
					<Menu.Item
						onClick={(e) => {
							e.stopPropagation()
							selectSegment()
						}}
					>
						<Box
							display="flex"
							alignItems="center"
							width="full"
							gap="2"
						>
							<IconSolidCheck
								size={14}
								color={vars.color.p10}
								style={{
									visibility: !selectedSegment
										? 'visible'
										: 'hidden',
								}}
							/>
							<Text lines="1">- none -</Text>
						</Box>
					</Menu.Item>
					{segmentOptions.map((segment, idx) => {
						const isSelected = selectedSegment?.id === segment.id
						return (
							<Menu.Item
								key={idx}
								onClick={(e) => {
									e.stopPropagation()
									selectSegment(segment)
								}}
							>
								<Box
									display="flex"
									alignItems="center"
									width="full"
									gap="2"
								>
									<IconSolidCheck
										size={14}
										color={vars.color.p10}
										style={{
											visibility: isSelected
												? 'visible'
												: 'hidden',
										}}
									/>
									<Text lines="1">{segment.name}</Text>
								</Box>
							</Menu.Item>
						)
					})}
				</>
			)
		}

		if (!selectedSegment) {
			return (
				<>
					<Box background="n1" borderBottom="secondary" p="8" mb="4">
						<Text
							weight="medium"
							size="xxSmall"
							color="n11"
							userSelect="none"
						>
							Select Segment
						</Text>
					</Box>
					{segmentMenuOptions()}
					<Menu.Divider />
					<Menu.Item
						onClick={(e) => {
							e.preventDefault()
							setSegmentModalState(SegmentModalState.CREATE)
						}}
						disabled={!query.trim()}
					>
						<Box
							display="flex"
							alignItems="center"
							gap="4"
							userSelect="none"
						>
							<IconSolidPlus size={16} color={colors.n9} />
							<Text>New segment</Text>
						</Box>
					</Menu.Item>
				</>
			)
		}

		return (
			<>
				<Box background="n1" borderBottom="secondary" p="8" mb="4">
					<Text
						weight="medium"
						size="xxSmall"
						color="n11"
						userSelect="none"
					>
						Segment settings
					</Text>
				</Box>
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						setSegmentModalState(SegmentModalState.EDIT_NAME)
					}}
				>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						userSelect="none"
					>
						<IconSolidPencil size={16} color={colors.n9} />
						Edit segment name
					</Box>
				</Menu.Item>
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						updateSegment()
					}}
					disabled={
						!query.trim() || mode !== BuilderMode.SEGMENT_UPDATE
					}
				>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						userSelect="none"
					>
						<IconSolidCloudUpload size={16} color={colors.n9} />
						Update segment
					</Box>
				</Menu.Item>
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						duplicateSegment()
					}}
					disabled={!query.trim()}
				>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						userSelect="none"
					>
						<IconSolidDocumentDuplicate
							size={16}
							color={colors.n9}
						/>
						Duplicate segment
					</Box>
				</Menu.Item>
				<Menu.Item>
					<Menu>
						<Menu.Button
							style={{
								paddingLeft: 0,
							}}
							size="small"
							emphasis="low"
							kind="secondary"
							onClick={(e: any) => e.preventDefault()}
						>
							<Box gap="4" display="flex" alignItems="center">
								<IconSolidSegment size={16} color={colors.n9} />
								Select other segment
							</Box>
						</Menu.Button>
						<Menu.List cssClass={styles.menuList}>
							<Box
								background="n1"
								borderBottom="secondary"
								p="8"
								mb="4"
							>
								<Text
									weight="medium"
									size="xxSmall"
									color="n11"
									userSelect="none"
								>
									Select Segment
								</Text>
							</Box>
							{segmentMenuOptions()}
						</Menu.List>
					</Menu>
				</Menu.Item>
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						if (selectedSegment) {
							selectSegment(selectedSegment)
						}
					}}
					disabled={mode !== BuilderMode.SEGMENT_UPDATE}
				>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						userSelect="none"
					>
						<IconSolidSegment size={16} color={colors.n9} />
						Reset to segment filters
					</Box>
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						setSegmentModalState(SegmentModalState.DELETE)
					}}
				>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						userSelect="none"
					>
						<IconSolidTrash size={16} color={colors.n9} />
						Delete current segment
					</Box>
				</Menu.Item>
			</>
		)
	}, [
		duplicateSegment,
		mode,
		query,
		segmentOptions,
		selectSegment,
		selectedSegment,
		updateSegment,
	])

	const SegmentMenu = useMemo(() => {
		if (!entityType) {
			return null
		}

		const buttonProps =
			mode === BuilderMode.SEGMENT_UPDATE
				? {
						kind: 'primary' as const,
						emphasis: 'high' as const,
					}
				: {
						kind: 'secondary' as const,
						emphasis: 'medium' as const,
					}

		return (
			<Menu>
				<Menu.Button
					disabled={segmentsLoading}
					iconLeft={<IconSolidSegment size={12} />}
					iconRight={<IconSolidCheveronDown size={12} />}
					{...buttonProps}
				>
					{selectedSegment?.name && (
						<Text lines="1">{selectedSegment?.name}</Text>
					)}
				</Menu.Button>
				<Menu.List cssClass={styles.menuList}>{menuOptions}</Menu.List>
			</Menu>
		)
	}, [entityType, menuOptions, mode, segmentsLoading, selectedSegment?.name])

	const SegmentModals = useMemo(() => {
		if (!entityType) {
			return null
		}

		return (
			<>
				<CreateSavedSegmentModal
					entityType={entityType as SavedSegmentEntityType}
					query={query}
					showModal={
						segmentModalState === SegmentModalState.CREATE ||
						segmentModalState === SegmentModalState.EDIT_NAME
					}
					onHideModal={() =>
						setSegmentModalState(SegmentModalState.HIDDEN)
					}
					afterCreateHandler={(segmentId, segmentName) => {
						if (query) {
							selectSegment({
								id: segmentId,
								name: segmentName,
								query,
							})
						}
					}}
					currentSegment={selectedSegment}
				/>
				<DeleteSavedSegmentModal
					entityType={entityType as SavedSegmentEntityType}
					showModal={segmentModalState === SegmentModalState.DELETE}
					onHideModal={() => {
						setSegmentModalState(SegmentModalState.HIDDEN)
					}}
					segmentToDelete={selectedSegment}
					afterDeleteHandler={() => {
						selectSegment()
					}}
				/>
			</>
		)
	}, [entityType, query, segmentModalState, selectSegment, selectedSegment])

	if (!entityType) {
		return {}
	}

	return {
		SegmentMenu,
		SegmentModals,
	}
}
