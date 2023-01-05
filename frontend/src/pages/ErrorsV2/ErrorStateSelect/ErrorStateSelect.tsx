import { useAuthContext } from '@authentication/AuthContext'
import { useUpdateErrorGroupStateMutation } from '@graph/hooks'
import { ErrorState } from '@graph/schemas'
import {
	Box,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Menu,
	Stack,
	Text,
} from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { DatePicker, message } from 'antd'
import classNames from 'classnames'
import moment from 'moment'
import React, { useEffect } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import * as styles from './style.css'

enum MenuState {
	Default,
	Snooze,
}

const DATE_FORMAT = 'ddd, h:mm A'

export const ErrorStateSelect: React.FC<{ state: ErrorState | 'Snoozed' }> = ({
	state: initialErrorState,
}) => {
	const menuRef = React.useRef<HTMLDivElement | null>(null)
	const [menuState, setMenuState] = React.useState<MenuState>(
		MenuState.Default,
	)
	const [datepickerOpen, setDatepickerOpen] = React.useState(false)
	const { error_secure_id } = useParams<{ error_secure_id: string }>()
	const [updateErrorGroupState, { loading }] =
		useUpdateErrorGroupStateMutation()
	const [action, setAction] = useQueryParam('action', StringParam)
	const { isLoggedIn } = useAuthContext()
	const ErrorStatuses = Object.keys(ErrorState)

	const handleChange = async (
		newState: ErrorState,
		snoozedUntil?: string,
	) => {
		await updateErrorGroupState({
			variables: {
				secure_id: error_secure_id,
				state: newState,
				snoozed_until: snoozedUntil,
			},
		})

		showStateUpdateMessage(newState)
	}

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
		if (action) {
			const castedAction = action.toUpperCase() as ErrorState
			if (Object.values(ErrorState).includes(castedAction)) {
				handleChange(castedAction)
			}

			setAction(undefined)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [action, error_secure_id])

	return (
		<>
			<Menu popoverRef={menuRef}>
				<Menu.Button
					size="small"
					kind="secondary"
					emphasis="low"
					disabled={loading || !isLoggedIn}
					iconRight={<IconSolidCheveronDown />}
				>
					<Text case="capital">
						{initialErrorState.toLowerCase()}
					</Text>
				</Menu.Button>
				{isLoggedIn && (
					<Menu.List>
						{menuState === MenuState.Default ? (
							<>
								<Menu.Heading>
									<Text>Status</Text>
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
								<Menu.Item
									onClick={(e) => {
										e.preventDefault()
										setDatepickerOpen(true)
									}}
								>
									<Stack
										direction="row"
										justify="space-between"
										align="center"
									>
										<Box color="n11">Pick day</Box>
										<IconSolidCheveronRight />
									</Stack>
								</Menu.Item>
							</>
						)}
					</Menu.List>
				)}
			</Menu>
			{datepickerOpen && (
				<DatePicker
					getPopupContainer={() => menuRef?.current || document.body}
					open
					autoFocus
					showTime
					className={classNames(styles.datepicker)}
					onChange={(datetime) => {
						console.log('::: snoozed to specific date', datetime)
						if (datetime) {
							handleChange(initialErrorState, datetime.format())
						}
						setDatepickerOpen(false)
					}}
				/>
			)}
		</>
	)
}

const showStateUpdateMessage = (newState: ErrorState) => {
	let displayMessage = ''
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

	message.success(displayMessage, 10)
}
