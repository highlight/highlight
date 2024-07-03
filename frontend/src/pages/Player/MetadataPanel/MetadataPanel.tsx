import { useAuthContext } from '@authentication/AuthContext'
import LoadingBox from '@components/LoadingBox'
import { TableList, TableListItem } from '@components/TableList/TableList'
import { toast } from '@components/Toaster'
import { Box, ButtonLink } from '@highlight-run/ui/components'
import { formatShortTime } from '@pages/Home/components/KeyPerformanceIndicators/utils/utils'
import { getChromeExtensionURL } from '@pages/Player/SessionLevelBar/utils/utils'
import { bytesToPrettyString } from '@util/string'
import _, { capitalize } from 'lodash'

import CollapsibleSection from '@/components/CollapsibleSection'
import { useSearchContext } from '@/components/Search/SearchContext'
import { styledVerticalScrollbar } from '@/style/common.css'

import { useReplayerContext } from '../ReplayerContext'
import { formatSize } from '../Toolbar/DevToolsWindowV2/utils'
import * as style from './MetadataPanel.css'

enum MetadataSection {
	Session = 'Session',
	User = 'User',
	Device = 'Device',
	Environment = 'Environment',
}

type Field = {
	type: string
	name: string
	value: string
}

const MetadataPanel = () => {
	const { session, browserExtensionScriptURLs } = useReplayerContext()
	const { onSubmit } = useSearchContext()
	const { isHighlightAdmin } = useAuthContext()

	const sessionData: TableListItem[] = [
		{
			keyDisplayValue: 'Environment',
			valueDisplayValue: session?.environment || 'Production',
			valueInfoTooltipMessage: (
				<>
					You can set the environment based on where the session is
					recorded.{' '}
					<a
						href="https://docs.highlight.run/api#w0-highlightoptions"
						target="_blank"
						rel="noopener noreferrer"
					>
						Learn more about environments.
					</a>
				</>
			),
		},
		{
			keyDisplayValue: 'App Version',
			valueDisplayValue: session?.app_version || 'App Version Not Set',
			valueInfoTooltipMessage: (
				<>
					This is the app version for your application. You can set
					the version to help categorize what version of the app a
					user was using.{' '}
					<a
						href="https://docs.highlight.run/api#w0-highlightoptions"
						target="_blank"
						rel="noopener noreferrer"
					>
						Learn more about setting the version.
					</a>
				</>
			),
		},
		{
			keyDisplayValue: 'Privacy Settings',
			valueDisplayValue: privacyModeValue(
				session?.privacy_setting,
				session?.enable_strict_privacy,
			),
			valueInfoTooltipMessage: (
				<>
					{privacyModeDescription(
						session?.privacy_setting,
						session?.enable_strict_privacy,
					)}{' '}
					<a
						href="https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/privacy"
						target="_blank"
						rel="noreferrer"
					>
						Learn more about Strict Privacy Mode.
					</a>
				</>
			),
		},
		{
			keyDisplayValue: 'Record Network Request Contents',
			lines: '1',
			valueDisplayValue: session?.enable_recording_network_contents
				? 'Enabled'
				: 'Disabled',
			valueInfoTooltipMessage: (
				<>
					This specifies whether Highlight records the status codes,
					headers, and bodies for XML/Fetch requests made in your app.{' '}
					<a
						href="https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/recording-network-requests-and-responses"
						target="_blank"
						rel="noopener noreferrer"
					>
						Learn more about recording network requests and
						responses.
					</a>
				</>
			),
		},
	]

	if (session?.length) {
		sessionData.push({
			keyDisplayValue: 'Duration',
			valueDisplayValue: formatShortTime(session.length / 1000),
		})
	}
	if (session?.active_length) {
		sessionData.push({
			keyDisplayValue: 'Active Duration',
			valueDisplayValue: formatShortTime(session.active_length / 1000),
		})
	}

	// Data exposed to Highlight employees.
	if (isHighlightAdmin) {
		if (session?.object_storage_enabled) {
			sessionData.push({
				keyDisplayValue: 'Session Size',
				valueDisplayValue: session?.payload_size
					? `${formatSize(session.payload_size)}`
					: 'Unknown',
			})
		}
		sessionData.push({
			keyDisplayValue: 'Client Version',
			valueDisplayValue: session?.client_version || 'Unknown',
		})
		sessionData.push({
			keyDisplayValue: 'Firstload Version',
			valueDisplayValue: session?.firstload_version || 'Unknown',
		})
		if (session?.client_config) {
			sessionData.push({
				keyDisplayValue: 'Client Config',
				valueDisplayValue: JSON.parse(session.client_config),
			})
		}
	}

	const userData: TableListItem[] = [
		{
			keyDisplayValue: 'Identifer',
			valueDisplayValue: session?.identifier || 'Not Set',
			valueInfoTooltipMessage: !session?.identifier && (
				<>
					Did you know that you can enrich sessions with additional
					metadata? They'll show up here. You can{' '}
					<a
						href="https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/identifying-sessions"
						target="_blank"
						rel="noreferrer"
					>
						learn more here
					</a>
					.
				</>
			),
		},
		{
			keyDisplayValue: 'Locale',
			valueDisplayValue: session?.language || 'Unknown',
		},
	]

	const parsedFields = session?.fields?.filter((f) => {
		return (
			f && f.type === 'user' && f.name !== 'identifier' && f.value.length
		)
	}) as Field[]
	parsedFields?.forEach((field) => {
		if (field.name !== 'avatar') {
			userData.push({
				keyDisplayValue: field.name,
				valueDisplayValue: field.value,
			})
		}
	})

	if (session?.user_properties) {
		for (const [k, v] of Object.entries(
			JSON.parse(session?.user_properties),
		)) {
			if (k !== 'avatar') {
				userData.push({
					keyDisplayValue: k,
					valueDisplayValue: v?.toString(),
				})
			}
		}
	}

	if (session?.city) {
		userData.push({
			keyDisplayValue: 'Location',
			valueDisplayValue: `${session?.city}, ${session?.state} ${session?.postal}`,
		})
	}

	const deviceData: TableListItem[] = []

	if (session?.fingerprint) {
		deviceData.push({
			keyDisplayValue: 'Device ID',
			valueDisplayValue: (
				<ButtonLink
					onClick={(e) => {
						e.stopPropagation()

						toast.success(
							`Showing sessions created by device #${session.fingerprint}`,
						)
						onSubmit(`device_id=${session.fingerprint}`)
					}}
				>
					#{session?.fingerprint}
				</ButtonLink>
			),
		})
	}

	if (session && session?.deviceMemory !== 0) {
		deviceData.push({
			keyDisplayValue: 'RAM',
			valueDisplayValue: bytesToPrettyString(
				session.deviceMemory! * 1024 * 1024,
			),
		})
	}

	const environmentData: TableListItem[] = browserExtensionScriptURLs.map(
		(scriptUrl) => ({
			keyDisplayValue: 'Browser Extension',
			valueDisplayValue: (
				<a
					href={getChromeExtensionURL(scriptUrl)}
					target="_blank"
					rel="noreferrer"
				>
					{scriptUrl}
				</a>
			),
			valueInfoTooltipMessage:
				"Highlight detected a browser extension is installed and might interfere with your app's behavior.",
		}),
	)
	if (!session) {
		return (
			<Box cssClass={style.container}>
				<LoadingBox />
			</Box>
		)
	}

	const data = Object.entries({
		[MetadataSection.Session]: sessionData,
		[MetadataSection.User]: userData,
		[MetadataSection.Device]: deviceData,
		[MetadataSection.Environment]: environmentData,
	}).map(([key, values]) => {
		return [
			key,
			_.sortBy(
				_.uniqBy(values, (x) => x.keyDisplayValue),
				(x) => x.keyDisplayValue,
			),
		] as const
	})
	return (
		<Box cssClass={style.container}>
			<Box cssClass={[style.metadataPanel, styledVerticalScrollbar]}>
				{data.map(([key, value]) => {
					return (
						<CollapsibleSection title={key} key={key}>
							<Box
								key={`${session.secure_id}-${key}`}
								px="12"
								display="flex"
								justifyContent="space-between"
								alignItems="center"
							>
								<TableList data={value} />
							</Box>
						</CollapsibleSection>
					)
				})}
			</Box>
		</Box>
	)
}

const privacyModeValue = (
	privacySetting?: string | null,
	legacyPrivacyEnabled?: boolean | null,
): string => {
	if (!!privacySetting) {
		return capitalize(privacySetting)
	}

	if (legacyPrivacyEnabled) {
		return 'Strict Privacy Enabled (deprecated)'
	} else {
		return 'Strict Privacy Disabled (deprecated)'
	}
}

const privacyModeDescription = (
	privacySetting?: string | null,
	legacyPrivacyEnabled?: boolean | null,
): string => {
	if (privacySetting === 'strict') {
		return 'Text and images in this session are obfuscated.'
	} else if (privacySetting === 'none') {
		return 'This session is recording all content on the page.'
	} else if (privacySetting === 'default') {
		return 'This session is obfuscating personal identifiable information, but all images and other text is recoreded.'
	}

	if (legacyPrivacyEnabled) {
		return 'Text and images in this session are obfuscated (deprecated).'
	} else {
		return 'This session is recording all content on the page (deprecated).'
	}
}

export default MetadataPanel
