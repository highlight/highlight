import { useAuthContext } from '@authentication/AuthContext'
import { toast } from '@components/Toaster'
import { useUpdateErrorGroupStateMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ErrorState, Maybe } from '@graph/schemas'
import {
	Badge,
	Box,
	DatePicker, // Use the Highlight UI DatePicker
	IconSolidCheck,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Menu,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { 
    addDays, 
    addHours, 
    addWeeks, 
    format, 
    isBefore, 
    set, 
    startOfIsoWeek 
} from 'date-fns' // Migration from moment to date-fns
import React, { useCallback, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation, useNavigate } from 'react-router-dom'

import * as styles from './style.css'

enum MenuState {
	Default,
	Snooze,
}

const DATE_FORMAT = 'iii, h:mm a'
const MESSAGE_KEY = 'update-message'

type Props = {
	errorSecureId: string
	snoozedUntil?: Maybe<string>
	state: ErrorState
}

export const ErrorStateSelect: React.FC<Props> = (props) => (
	<Menu placement="bottom-end">
		<ErrorStateSelectImpl {...props} />
	</Menu>
)

const ErrorStateSelectImpl: React.FC<Props> = ({
	errorSecureId,
	snoozedUntil,
	state: initialErrorState,
}) => {
	const menu = Menu.useContext()!
	const mState = menu.getState()
	const [menuState, setMenuState] = React.useState<MenuState>(
		MenuState.Default,
	)

	const [updateErrorGroupState] = useUpdateErrorGroupStateMutation({
		refetchQueries: [
			namedOperations.Query.GetErrorGroup,
			namedOperations.Query.GetErrorGroups,
		],
		awaitRefetchQueries: true,
	})

	const { isLoggedIn } = useAuthContext()
	const ErrorStatuses = Object.keys(ErrorState)
	const now = new Date()
	const snoozed = snoozedUntil && isBefore(now, new Date(snoozedUntil))

	const handleChange = useCallback(
		async (newState: ErrorState, newSnoozedUntil?: string) => {
			if (
				initialErrorState === newState &&
				!snoozed &&
				!newSnoozedUntil &&
				!errorSecureId
			) {
				return
			}

			showStateUpdateMessage(newState, newSnoozedUntil)
			setMenuState(MenuState.Default)

			await updateErrorGroupState({
				variables: {
					secure_id: errorSecureId,
					state: newState,
					snoozed_until: newSnoozedUntil ?? null,
				},
				optimisticResponse: {
					updateErrorGroupState: {
						secure_id: errorSecureId,
						state: newState,
						snoozed_until: newSnoozedUntil ?? null,
						__typename: 'ErrorGroup',
					},
				},
				onError: async () => {
					toast.destroy(MESSAGE_KEY)
					toast.error(
						'There was an issue updating the state of this error. Please try again.',
					)
				},
			})
		},
		[errorSecureId, initialErrorState, snoozed, updateErrorGroupState],
	)

	const navigate = useNavigate()
	const location = useLocation()

	const snoozeMenuItems = () => [
		{
			title: '1 Hour',
			time: addHours(now, 1),
		},
		{
			title: 'Tomorrow',
			time: set(addDays(now, 1), { hours: 8, minutes: 0 }),
		},
		{
			title: 'Next Week',
			time: addHours(startOfIsoWeek(addWeeks(now, 1)), 8),
		},
	]

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
	}, [errorSecureId])

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
		[mState.open, errorSecureId],
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
				<Stack direction="row" align="center" gap="4">
					<Text case="capital">{initialErrorState.toLowerCase()}</Text>
					{snoozed && (
						<Text color="n9" size="xSmall" weight="regular">
							(Until {format(new Date(snoozedUntil!), DATE_FORMAT)})
						</Text>
					)}
				</Stack>
			</Menu.Button>
			{isLoggedIn && (
				<Menu.List cssClass={styles.menu}>
					{menuState === MenuState.Default ? (
						<>
							<Menu.Heading>
								<Stack direction="row" align="center" justify="space-between" width="full">
									<Text weight="bold" size="xSmall" color="n11">Status</Text>
									<Badge variant="gray" size="small" label="e" />
								</Stack>
							</Menu.Heading>
							{ErrorStatuses.map((option) => (
								<Menu.Item
									onClick={() => handleChange(option.toUpperCase() as ErrorState)}
									key={option}
								>
									<Stack direction="row" gap="8" align="center">
										<Box style={{ height: 16, width: 16 }}>
											{!snoozed && initialErrorState.toLowerCase() === option.toLowerCase() && (
												<IconSolidCheck size={16} />
											)}
										</Box>
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
								<Stack direction="row" justify="space-between" align="center" width="full">
									<Stack direction="row" gap="8" align="center">
										<Box style={{ height: 16, width: 16 }}>
											{snoozed && <IconSolidCheck size={16} />}
										</Box>
										<Text>Snooze</Text>
									</Stack>
									<IconSolidCheveronRight size={16} />
								</Stack>
							</Menu.Item>
						</>
					) : (
						<>
							<Menu.Heading>
								<Text weight="bold" size="xSmall" color="n11">Until</Text>
							</Menu.Heading>
							{snoozeMenuItems().map((option, index) => (
								<Menu.Item
									key={index}
									onClick={() => handleChange(initialErrorState, option.time.toISOString())}
								>
									<Stack direction="row" justify="space-between" width="full">
										<Text color="n11">{option.title}</Text>
										<Text color="n9">{format(option.time, DATE_FORMAT)}</Text>
									</Stack>
								</Menu.Item>
							))}
							<Menu.Divider />
							<Box padding="8">
								<DatePicker
									placeholder="Select day and time"
									onChange={(date) => {
										if (date) {
											handleChange(initialErrorState, date.toISOString()).then(() => {
												menu.setOpen(false)
											})
										}
									}}
								/>
							</Box>
						</>
					)}
				</Menu.List>
			)}
		</>
	)
}

const showStateUpdateMessage = (newState: ErrorState, snoozedUntil?: string) => {
	let displayMessage = ''
	if (snoozedUntil && isBefore(new Date(), new Date(snoozedUntil))) {
		displayMessage = `This error is snoozed until ${format(new Date(snoozedUntil), DATE_FORMAT)}. You will not receive any alerts.`
	} else {
		switch (newState) {
			case ErrorState.Open:
				displayMessage = `This error is set to Open.`
				break
			case ErrorState.Ignored:
				displayMessage = `This error is set to Ignored.`
				break
			case ErrorState.Resolved:
				displayMessage = `This error is set to Resolved.`
				break
		}
	}
	toast.success(displayMessage, { duration: 10000, id: MESSAGE_KEY })
}