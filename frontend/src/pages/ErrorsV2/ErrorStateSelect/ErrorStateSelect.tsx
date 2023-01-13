import { useAuthContext } from '@authentication/AuthContext'
import { useUpdateErrorGroupStateMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ErrorState, Maybe } from '@graph/schemas'
import {
	Badge,
	Box,
	IconSolidCheveronDown,
	Menu,
	Stack,
	Text,
	useMenu,
} from '@highlight-run/ui'
import { indexeddbCache } from '@util/db'
import { useParams } from '@util/react-router/useParams'
import { wait } from '@util/time'
import { DatePicker, message } from 'antd'
import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useHistory } from 'react-router-dom'

import * as styles from './style.css'

enum MenuState {
	Default,
	Snooze,
}

const DATE_FORMAT = 'ddd, h:mm A'

export const ErrorStateSelect: React.FC<{
	state: ErrorState
	snoozedUntil?: Maybe<string>
}> = ({ state: initialErrorState, snoozedUntil }) => {
	const [menuState, setMenuState] = React.useState<MenuState>(
		MenuState.Default,
	)
	const [errorState, setErrorState] = useState<ErrorState>(initialErrorState)

	const { error_secure_id } = useParams<{ error_secure_id: string }>()
	const [updateErrorGroupState, { loading }] =
		useUpdateErrorGroupStateMutation({
			refetchQueries: [
				namedOperations.Query.GetErrorGroup,
				namedOperations.Query.GetErrorGroupsOpenSearch,
			],
			onQueryUpdated: async (observable) => {
				await indexeddbCache.deleteItem({
					operation: observable.queryName ?? '',
					variables: observable.variables,
				})
				await wait(500)
				await observable.refetch()
			},
			awaitRefetchQueries: true,
		})

	const { isLoggedIn } = useAuthContext()
	const ErrorStatuses = Object.keys(ErrorState)
	const snoozed = snoozedUntil && moment().isBefore(moment(snoozedUntil))

	const handleChange = useCallback(
		async (newState: ErrorState, snoozedUntil?: string) => {
			if (initialErrorState === newState && !snoozed) return
			await updateErrorGroupState({
				variables: {
					secure_id: error_secure_id,
					state: newState,
					snoozed_until: snoozedUntil,
				},
				onCompleted: async () => {
					showStateUpdateMessage(newState, snoozedUntil)
					setMenuState(MenuState.Default)
					setErrorState(newState)
				},
			})
		},
		[error_secure_id, initialErrorState, snoozed, updateErrorGroupState],
	)

	const history = useHistory()
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

	// Sets the state based on the query parameters. This is used for the Slack deep-linked messages.
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search)
		const action = urlParams.get('action')
		if (action) {
			const castedAction = action.toUpperCase() as ErrorState
			if (Object.values(ErrorState).includes(castedAction)) {
				handleChange(castedAction).then(() => {
					const searchParams = new URLSearchParams(location.search)
					searchParams.delete('action')
					history.replace(
						`${
							history.location.pathname
						}?${searchParams.toString()}`,
					)
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error_secure_id])

	return (
		<>
			<Menu
				placement="bottom-end"
				onVisibilityChange={(open) => {
					if (!open) {
						setMenuState(MenuState.Default)
					}
				}}
			>
				<MenuHandler />
				<Menu.Button
					size="small"
					kind="secondary"
					emphasis="low"
					disabled={loading || !isLoggedIn}
					iconRight={<IconSolidCheveronDown />}
				>
					<Text case="capital">
						{errorState.toLowerCase()}{' '}
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
									<Text
										weight="bold"
										size="xSmall"
										color="n11"
									>
										Status
									</Text>
									<Badge
										variant="grey"
										size="tiny"
										label="e"
									/>
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
										{option}
									</Menu.Item>
								))}

								<Menu.Item
									onClick={(e) => {
										e.preventDefault()
										setMenuState(MenuState.Snooze)
									}}
								>
									Snooze
								</Menu.Item>
							</>
						) : (
							<>
								<Menu.Heading>
									<Text
										weight="bold"
										size="xSmall"
										color="n11"
									>
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
											justify="space-between"
										>
											<Box color="n11">
												{option.title}
											</Box>
											<Box color="n9">
												{option.time.format(
													DATE_FORMAT,
												)}
											</Box>
										</Stack>
									</Menu.Item>
								))}
								<Menu.Divider />
								<DatepickerMenuItem
									onChange={handleChange}
									state={initialErrorState}
								/>
							</>
						)}
					</Menu.List>
				)}
			</Menu>
		</>
	)
}

const DatepickerMenuItem: React.FC<{
	onChange: (newState: ErrorState, snoozedUntil?: string) => Promise<void>
	state: ErrorState
}> = ({ onChange, state }) => {
	const menuRef = React.useRef<HTMLDivElement | null>(null)
	const menu = useMenu()

	return (
		<Menu.Item onClick={(e) => e.preventDefault()}>
			<div ref={menuRef} />
			<DatePicker
				getPopupContainer={() => menuRef?.current || document.body}
				format="YYYY-MM-DD hh:mm"
				showTime={{ format: 'hh:mm' }}
				showNow={false}
				placement="bottomRight"
				placeholder="Select day and time"
				className={styles.datepicker}
				onChange={(datetime) => {
					if (datetime) {
						onChange(state, datetime.format()).then(() => {
							menu.setOpen(false)
						})
					}
				}}
			/>
		</Menu.Item>
	)
}

const MenuHandler: React.FC = () => {
	const menu = useMenu()

	useHotkeys(
		'e',
		() => {
			menu.setOpen(!menu.open)
			menu.baseRef.current?.focus()
		},
		[menu.open],
	)

	return <></>
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

	message.success(displayMessage, 10)
}
