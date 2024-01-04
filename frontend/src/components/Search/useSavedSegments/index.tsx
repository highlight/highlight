import { SavedSegmentEntityType } from '@graph/schemas'
import { colors } from '@highlight-run/ui/colors'
import {
	Box,
	IconSolidCheveronDown,
	IconSolidCloudUpload,
	IconSolidDocumentDuplicate,
	IconSolidPencil,
	IconSolidPlusCircle,
	IconSolidRefresh,
	IconSolidSave,
	IconSolidSegment,
	IconSolidTrash,
	Menu,
	Text,
} from '@highlight-run/ui/components'
import { message } from 'antd'
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
	entityType?: 'Log' | 'Trace'
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
				entity_type: entityType as SavedSegmentEntityType,
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
					message.success(`Updated '${selectedSegment!.name}'`, 5)
					selectSegment({
						id: selectedSegment.id,
						name: selectedSegment.name,
						query: query,
					})
				})
				.catch(() => {
					message.error('Error updating segment!', 5)
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

	const segmentActionButton = useMemo(() => {
		if (mode === BuilderMode.CUSTOM) {
			return (
				<Menu.Button
					kind="secondary"
					emphasis="medium"
					iconLeft={<IconSolidSave size={12} />}
					onClick={(e: React.MouseEvent) => {
						e.preventDefault()
						setSegmentModalState(SegmentModalState.CREATE)
					}}
					disabled={!query.trim()}
				>
					Save
				</Menu.Button>
			)
		} else if (
			mode === BuilderMode.SEGMENT_UPDATE ||
			mode === BuilderMode.SEGMENT
		) {
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
				<Menu.Button
					iconLeft={<IconSolidSegment size={12} />}
					iconRight={<IconSolidCheveronDown size={12} />}
					{...buttonProps}
				>
					<Text lines="1">{selectedSegment?.name}</Text>
				</Menu.Button>
			)
		}
	}, [mode, query, selectedSegment?.name])

	const alteredSegmentSettings = useMemo(() => {
		return (
			<>
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						updateSegment()
					}}
					disabled={!query.trim()}
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
						<IconSolidPlusCircle size={16} color={colors.n9} />
						Save as a new segment
					</Box>
				</Menu.Item>
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						if (selectedSegment) {
							selectSegment(selectedSegment)
						}
					}}
				>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						userSelect="none"
					>
						<IconSolidRefresh size={16} color={colors.n9} />
						Reset to segment filters
					</Box>
				</Menu.Item>

				<Menu.Divider />
			</>
		)
	}, [duplicateSegment, query, selectSegment, selectedSegment, updateSegment])

	const SegmentMenu = useMemo(() => {
		if (!entityType) {
			return null
		}

		return (
			<>
				<Menu placement="bottom-end">
					{segmentActionButton}
					<Menu.List cssClass={styles.menuList}>
						<Box
							background="n2"
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
								Segment settings
							</Text>
						</Box>
						{mode === BuilderMode.SEGMENT_UPDATE
							? alteredSegmentSettings
							: null}

						<Menu.Item
							onClick={(e) => {
								e.stopPropagation()
								setSegmentModalState(
									SegmentModalState.EDIT_NAME,
								)
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
								duplicateSegment()
							}}
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
								Delete segment
							</Box>
						</Menu.Item>
					</Menu.List>
				</Menu>

				<Menu>
					<Menu.Button
						kind="secondary"
						disabled={segmentsLoading}
						emphasis="medium"
						icon={<IconSolidSegment size={12} />}
					/>
					<Menu.List cssClass={styles.menuList}>
						<Box
							background="n2"
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
								Segments
							</Text>
						</Box>
						{segmentOptions.map((segment, idx) => (
							<Menu.Item
								key={idx}
								onClick={(e) => {
									e.stopPropagation()
									selectSegment(segment)
								}}
							>
								<Text lines="1">{segment.name}</Text>
							</Menu.Item>
						))}
						{segmentOptions.length > 0 && <Menu.Divider />}
						<Menu.Item
							onClick={(e) => {
								e.stopPropagation()
								selectSegment()
							}}
						>
							Reset to defaults
						</Menu.Item>
					</Menu.List>
				</Menu>
			</>
		)
	}, [
		alteredSegmentSettings,
		duplicateSegment,
		entityType,
		mode,
		segmentActionButton,
		segmentOptions,
		segmentsLoading,
		selectSegment,
	])

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
