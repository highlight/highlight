import { useAuthContext } from '@authentication/AuthContext'
import { useUpdateErrorGroupStateMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ErrorState, Maybe } from '@graph/schemas'
import {
	Badge,
	Box,
	IconSolidCheck,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Menu,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { DatePicker, message } from 'antd'
import moment from 'moment'
import React, { useCallback, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation, useNavigate } from 'react-router-dom'

import * as styles from './style.css'

enum MenuState {
	Default,
	Snooze,
}

const DATE_FORMAT = 'ddd, h:mm A'
const MESSAGE_KEY = 'update-message'

type Props = {
	state: ErrorState
	snoozedUntil?: Maybe<string>
}

export const ErrorStateSelect: React.FC<Props> = ({ state, snoozedUntil }) => (
	<Menu placement="bottom-end">
		{/* Rendering inside wrapper so we can work with menu state via useMenu. */}
		<ErrorStateSelectImpl state={state} snoozedUntil={snoozedUntil} />
	</Menu>
)

const ErrorStateSelectImpl: React.FC<Props> = ({
	state: initialErrorState,
	snoozedUntil,
}) => {
	const menuRef = React.useRef<HTMLDivElement | null>(null)
	const menu = Menu.useContext()!
	const mState = menu.getState()
	const [menuState, setMenuState] = React.useState<MenuState>(
		MenuState.Default,
	)

	const { error_secure_id } = useParams<{ error_secure_id: string }>()
	const [updateErrorGroupState] = useUpdateErrorGroupStateMutation({
		refetchQueries: [
			namedOperations.Query.GetErrorGroup,
			namedOperations.Query.GetErrorGroupsClickhouse,
		],
		awaitRefetchQueries: true,
	})

	const { isLoggedIn } = useAuthContext()
	const ErrorStatuses = Object.keys(ErrorState)
	const snoozed = snoozedUntil && moment().isBefore(moment(snoozedUntil))

	const handleChange = useCallback(
		async (newState: ErrorState, newSnoozedUntil?: string) => {
			if (
				initialErrorState === newState &&
				!snoozed &&
				!newSnoozedUntil &&
				!error_secure_id
			) {
				return
			}

			showStateUpdateMessage(newState, newSnoozedUntil)
			setMenuState(MenuState.Default)

			await updateErrorGroupState({
				variables: {
					secure_id: error_secure_id!,
					state: newState,
					snoozed_until: newSnoozedUntil ?? null,
				},
				optimisticResponse: {
					updateErrorGroupState: {
						secure_id: error_secure_id!,
						state: newState,
						snoozed_until: newSnoozedUntil ?? null,
						__typename: 'ErrorGroup',
					},
				},
				onError: async () => {
					message.destroy(MESSAGE_KEY)
					message.error(
						'There was an issue updating the state of this error. Please try again.',
					)
				},
			})
		},
		[error_secure_id, initialErrorState, snoozed, updateErrorGroupState],
	)

	const navigate = useNavigate()
	const location = useLocation()

	const snoozeMenuItems = () => [
		{
			title: '1 Hour',
			time: moment().add(1, 'hour'),
		},
		{
			title: 'Tomorrow',
			time: moment().add(1, 'day').set({ hour: 8, minute: 0 }),
		},
		{
			title: 'Next Week',
			time: moment().add(1, 'week').startOf('isoWeek').add(8, 'hours'),
		},
	]

	// Sets the state based on the query parameters. This is used for action
	// buttons in our Slack and Discord integrations.
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search)
		const action = urlParams.get('action')

		if (action) {
			if (action.toLowerCase() === 'snooze') {
				setTimeout(() => {
					setMenuState(MenuState.Snooze)
					menu.setOpen(true)
					mState.baseElement?.focus()
				}, 300)
			} else {
				const castedAction = action.toUpperCase() as ErrorState

				if (Object.values(ErrorState).includes(castedAction)) {
					handleChange(castedAction).then(() => {
						const searchParams = new URLSearchParams(
							location.search,
						)
						searchParams.delete('action')
						navigate(
							`${location.pathname}?${searchParams.toString()}`,
							{ replace: true },
						)
					})
				}
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error_secure_id])

	// Reset menu state on close.
	useEffect(() => {
		if (!mState.open) {
			setMenuState(MenuState.Default)
		}
	}, [mState.open])

	useHotkeys(
		'e',
		() => {
			menu.setOpen(!mState.open)
			mState.baseElement?.focus()
		},
		[mState.open, error_secure_id],
	)

	return (
		<>
			<Menu.Button
				size="small"
				kind="secondary"
				emphasis="medium"
				disabled={!isLoggedIn}
				iconRight={<IconSolidCheveronDown />}
			>
				<Text case="capital">
					{initialErrorState.toLowerCase()}{' '}
					{snoozed && (
						<span style={{ textTransform: 'none' }}>
							(Snoozed until{' '}
							{moment(snoozedUntil).format(DATE_FORMAT)})
						</span>
					)}
				</Text>
			</Menu.Button>
			{isLoggedIn && (
				<Menu.List cssClass={styles.menu}>
					{menuState === MenuState.Default ? (
						<>
							<Menu.Heading>
								<Text weight="bold" size="xSmall" color="n11">
									Status
								</Text>
								<Badge variant="gray" size="small" label="e" />
							</Menu.Heading>
							{ErrorStatuses.map((option) => (
								<Menu.Item
									onClick={() =>
										handleChange(
											option.toUpperCase() as ErrorState,
										)
									}
									key={option}
								>
									<Stack
										direction="row"
										gap="4"
										align="center"
									>
										<div style={{ height: 16, width: 16 }}>
											{!snoozed &&
												initialErrorState.toLowerCase() ===
													option.toLowerCase() && (
													<IconSolidCheck size={16} />
												)}
										</div>
										<Text>{option}</Text>
									</Stack>
								</Menu.Item>
							))}

							<Menu.Divider />
							<Menu.Item
								onClick={(e) => {
									e.preventDefault()
									setMenuState(MenuState.Snooze)
								}}
							>
								<Stack
									direction="row"
									justify="space-between"
									align="center"
									width="full"
								>
									<Stack
										direction="row"
										gap="4"
										align="center"
									>
										<div
											style={{
												height: 16,
												width: 16,
											}}
										>
											{snoozed && (
												<IconSolidCheck size={16} />
											)}
										</div>
										<Text>Snooze</Text>
									</Stack>
									<IconSolidCheveronRight size={16} />
								</Stack>
							</Menu.Item>
						</>
					) : (
						<>
							<Menu.Heading>
								<Text weight="bold" size="xSmall" color="n11">
									Until
								</Text>
							</Menu.Heading>
							{snoozeMenuItems().map((option, index) => (
								<Menu.Item
									key={index}
									onClick={() =>
										handleChange(
											initialErrorState,
											option.time.format(),
										)
									}
								>
									<Stack
										direction="row"
										gap="0"
										flex="stretch"
									>
										<Box color="n11" flex="stretch">
											{option.title}
										</Box>
										<Box
											color="n9"
											flex="stretch"
											whiteSpace="nowrap"
										>
											{option.time.format(DATE_FORMAT)}
										</Box>
									</Stack>
								</Menu.Item>
							))}
							<Menu.Divider />
							<Menu.Item onClick={(e) => e.preventDefault()}>
								<div ref={menuRef} />
								<DatePicker
									getPopupContainer={() =>
										menuRef?.current || document.body
									}
									format="YYYY-MM-DD hh:mm"
									showTime={{ format: 'hh:mm' }}
									showNow={false}
									placement="bottomRight"
									placeholder="Select day and time"
									className={styles.datepicker}
									onChange={(datetime) => {
										if (datetime) {
											handleChange(
												initialErrorState,
												datetime.format(),
											).then(() => {
												menu.setOpen(false)
											})
										}
									}}
								/>
							</Menu.Item>
						</>
					)}
				</Menu.List>
			)}
		</>
	)
}

const showStateUpdateMessage = (
	newState: ErrorState,
	snoozedUntil?: string,
) => {
	let displayMessage = ''

	if (snoozedUntil && moment().isBefore(moment(snoozedUntil))) {
		displayMessage = `This error is snoozed until ${moment(
			snoozedUntil,
		).format(
			DATE_FORMAT,
		)}. You will not receive any alerts even if a new error gets thrown.`
	} else {
		switch (newState) {
			case ErrorState.Open:
				displayMessage = `This error is set to Open. You will receive alerts when a new error gets thrown.`
				break
			case ErrorState.Ignored:
				displayMessage = `This error is set to Ignored. You will not receive any alerts even if a new error gets thrown.`
				break
			case ErrorState.Resolved:
				displayMessage = `This error is set to Resolved. You will receive alerts when a new error gets thrown.`
				break
		}
	}

	message.success({ content: displayMessage, key: MESSAGE_KEY }, 10)
}
