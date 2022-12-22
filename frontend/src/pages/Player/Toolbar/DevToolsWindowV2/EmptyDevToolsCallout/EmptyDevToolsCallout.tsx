import { useAuthContext } from '@authentication/AuthContext'
import {
	Box,
	Button,
	Callout,
	IconCubeTransparent,
	Stack,
	Text,
} from '@highlight-run/ui'
import { RequestType, Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { showIntercom } from '@util/window'
import React from 'react'

interface Props {
	kind: Tab
	filter?: string
	requestType?: RequestType
}

export const EmptyDevToolsCallout = ({ kind, filter, requestType }: Props) => {
	const { admin } = useAuthContext()

	return (
		<Box
			height="full"
			width="full"
			display="flex"
			alignItems="center"
			justifyContent="center"
		>
			<Callout
				border
				title={`Couldn't find any recorded ${
					kind === Tab.Console
						? 'console messages'
						: kind === Tab.Network
						? 'network requests'
						: kind === Tab.Performance
						? 'performance profiles'
						: kind.toLocaleLowerCase()
				}.`}
				icon={() => (
					<Box
						borderRadius="5"
						style={{
							alignItems: 'center',
							backgroundColor: '#E9E9E9',
							display: 'flex',
							height: 22,
							justifyContent: 'center',
							textAlign: 'center',
							width: 22,
						}}
					>
						<IconCubeTransparent size={14} color="#777777" />
					</Box>
				)}
			>
				{requestType ? (
					<>
						<Text color="n11">
							{`No ${
								requestType !== RequestType.All
									? requestType.toLocaleLowerCase()
									: ''
							} network resources${
								filter !== '' ? ` matching '${filter}'` : ''
							}.`}
						</Text>
						<Text color="n11">
							If you expected to see data here, please make sure{' '}
							<code>networkRecording</code> is set to{' '}
							<code>true</code>.
						</Text>
					</>
				) : filter?.length ? (
					<>
						<Text color="n11">
							Nothing matched filter '{filter}'
						</Text>
						<Text color="n11">
							If you think something's wrong, feel free to reach
							out to us!
						</Text>
					</>
				) : (
					<>
						<Text color="n11">
							Double check your <code>H.init</code> settings to
							ensure this is recorded.
						</Text>
						<Text color="n11">
							If you think something's wrong, feel free to reach
							out to us!
						</Text>
					</>
				)}
				<Stack direction="row" gap="8">
					<Button
						kind="secondary"
						onClick={() => showIntercom({ admin })}
					>
						Contact
					</Button>
					<Button
						kind="secondary"
						emphasis="low"
						onClick={() => {
							window.open(
								kind === Tab.Console
									? 'https://www.highlight.io/docs/session-replay/console-messages'
									: 'https://www.highlight.io/docs/error-monitoring/grouping-errors',
								'_blank',
							)
						}}
					>
						Learn more
					</Button>
				</Stack>
			</Callout>
		</Box>
	)
}
