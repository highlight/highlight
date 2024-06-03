import { Button } from '@components/Button'
import {
	Box,
	Callout,
	IconSolidInformationCircle,
	Text,
} from '@highlight-run/ui/components'
import {
	RequestStatus,
	RequestType,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'

interface Props {
	kind: Tab
	filter?: string
	requestTypes?: RequestType[]
	requestStatuses?: RequestStatus[]
}

const buildList = (values: RequestType[] | RequestStatus[]) => {
	switch (values.length) {
		case 0:
			return ''
		case 1:
			return values[0]
		case 2:
			return `${values[0]} or ${values[1]}`
		default:
			return values.join('/')
	}
}

export const EmptyDevToolsCallout = ({
	kind,
	filter,
	requestTypes = [],
	requestStatuses = [],
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
				style={{
					maxWidth: '340px',
				}}
				title={
					!requestTypes.length && filter?.length
						? `Can't find what you're looking for?`
						: `Couldn't find any recorded ${
								kind === Tab.Console
									? 'console messages'
									: kind === Tab.Network
									? 'network requests'
									: kind.toLocaleLowerCase()
						  }.`
				}
				icon={IconSolidInformationCircle}
			>
				{requestTypes.length ? (
					<>
						<Text color="n11">
							{`No ${
								!requestTypes.includes(RequestType.All)
									? buildList(requestTypes)
									: ''
							} network resources${
								filter !== '' ? ` matching '${filter}'` : ''
							}${
								!requestStatuses?.includes(RequestStatus.All)
									? ' with status ' +
									  buildList(requestStatuses)
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
							Seems like there are no results for your search
							entry. Try search for something else!
						</Text>
					</>
				) : (
					<>
						<Text color="n11">
							Double check your <code>H.init</code> settings to
							ensure this is recorded. If you think something's
							wrong, feel free to reach out to us!
						</Text>
					</>
				)}
				{!requestTypes.length && filter?.length ? null : (
					<Button
						style={{
							maxWidth: 'max-content',
						}}
						kind="secondary"
						emphasis="high"
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
				)}
			</Callout>
		</Box>
	)
}
