import { Button } from '@components/Button'
import { Box, Callout, IconSolidCubeTransparent, Text } from '@highlight-run/ui'
import {
	RequestStatus,
	RequestType,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'

interface Props {
	kind: Tab
	filter?: string
	requestType?: RequestType
	requestStatus?: RequestStatus
}

export const EmptyDevToolsCallout = ({
	kind,
	filter,
	requestType,
	requestStatus,
}: Props) => {
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
						<IconSolidCubeTransparent size={14} color="#777777" />
					</Box>
				)}
			>
				{requestType ? (
					<>
						<Text color="n11">
							{`No ${
								requestType !== RequestType.All
									? requestType
									: ''
							} network resources${
								filter !== '' ? ` matching '${filter}'` : ''
							}${
								requestStatus !== RequestStatus.All
									? ' with status ' + requestStatus
									: ''
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
				<Button
					kind="secondary"
					emphasis="low"
					onClick={() => {
						window.open(
							kind === Tab.Console
								? 'https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/console-messages'
								: 'https://www.highlight.io/docs/general/product-features/error-monitoring/grouping-errors',
							'_blank',
						)
					}}
					trackingId="emptyDevToolsLearnMore"
				>
					Learn more
				</Button>
			</Callout>
		</Box>
	)
}
