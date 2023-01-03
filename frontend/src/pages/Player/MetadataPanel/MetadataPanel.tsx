import { useAuthContext } from '@authentication/AuthContext'
import { formatShortTime } from '@pages/Home/components/KeyPerformanceIndicators/utils/utils'
import { getChromeExtensionURL } from '@pages/Player/SessionLevelBar/utils/utils'
import { bytesToPrettyString } from '@util/string'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Link } from 'react-router-dom'

import DataCard from '../../../components/DataCard/DataCard'
import KeyValueTable, {
	KeyValueTableRow,
} from '../../../components/KeyValueTable/KeyValueTable'
import { EmptySessionsSearchParams } from '../../Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '../../Sessions/SearchContext/SearchContext'
import { useReplayerContext } from '../ReplayerContext'
import { formatSize } from '../Toolbar/DevToolsWindow/ResourcePage/ResourcePage'
import styles from './MetadataPanel.module.scss'

type Field = {
	type: string
	name: string
	value: string
}

const MetadataPanel = () => {
	const { session, browserExtensionScriptURLs } = useReplayerContext()
	const { setSearchParams, removeSelectedSegment } = useSearchContext()
	const { isHighlightAdmin } = useAuthContext()

	const [parsedFields, setParsedFields] = useState<Field[]>([])

	useEffect(() => {
		const fields = session?.fields?.filter((f) => {
			return (
				f &&
				f.type === 'user' &&
				f.name !== 'identifier' &&
				f.value.length
			)
		}) as Field[]
		setParsedFields(fields)
	}, [session?.fields])

	const sessionData: KeyValueTableRow[] = [
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
			renderType: 'string',
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
			renderType: 'string',
		},
		{
			keyDisplayValue: 'Strict Privacy',
			valueDisplayValue: session?.enable_strict_privacy
				? 'Enabled'
				: 'Disabled',
			renderType: 'string',
			valueInfoTooltipMessage: (
				<>
					{session?.enable_strict_privacy
						? 'Text and images in this session are obfuscated.'
						: 'This session is recording all content on the page.'}{' '}
					<a
						href="https://docs.highlight.run/privacy"
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
			valueDisplayValue: session?.enable_recording_network_contents
				? 'Enabled'
				: 'Disabled',
			renderType: 'string',
			valueInfoTooltipMessage: (
				<>
					This specifies whether Highlight records the status codes,
					headers, and bodies for XML/Fetch requests made in your app.{' '}
					<a
						href="https://docs.highlight.run/recording-network-requests-and-responses"
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
			renderType: 'string',
		})
	}
	if (session?.active_length) {
		sessionData.push({
			keyDisplayValue: 'Active Duration',
			valueDisplayValue: formatShortTime(session.active_length / 1000),
			renderType: 'string',
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
				renderType: 'string',
			})
		}
		sessionData.push({
			keyDisplayValue: 'Client Version',
			valueDisplayValue: session?.client_version || 'Unknown',
			renderType: 'string',
		})
		sessionData.push({
			keyDisplayValue: 'Firstload Version',
			valueDisplayValue: session?.firstload_version || 'Unknown',
			renderType: 'string',
		})
		if (session?.client_config) {
			sessionData.push({
				keyDisplayValue: 'Client Config',
				valueDisplayValue: JSON.parse(session.client_config),
				renderType: 'json',
			})
		}
	}

	const userData: KeyValueTableRow[] = [
		{
			keyDisplayValue: 'Identifer',
			valueDisplayValue: session?.identifier || 'Not Set',
			valueInfoTooltipMessage: !session?.identifier && (
				<>
					Did you know that you can enrich sessions with additional
					metadata? They'll show up here. You can{' '}
					<a
						href="https://docs.highlight.run/identifying-users"
						target="_blank"
						rel="noreferrer"
					>
						learn more here
					</a>
					.
				</>
			),
			renderType: 'string',
		},
		{
			keyDisplayValue: 'Locale',
			valueDisplayValue: session?.language || 'Unknown',
			renderType: 'string',
		},
	]

	if (session?.city) {
		userData.push({
			keyDisplayValue: 'Location',
			valueDisplayValue: `${session?.city}, ${session?.state} ${session?.postal}`,
			renderType: 'string',
		})
	}

	parsedFields?.forEach((field) => {
		if (field.name !== 'avatar') {
			userData.push({
				keyDisplayValue: field.name,
				valueDisplayValue: field.value,
				renderType: 'string',
			})
		}
	})

	const deviceData: KeyValueTableRow[] = []

	if (session?.fingerprint) {
		deviceData.push({
			keyDisplayValue: 'Device ID',
			valueDisplayValue: (
				<Link
					to={window.location.pathname}
					onClick={() => {
						message.success(
							`Showing sessions created by device #${session.fingerprint}`,
						)
						removeSelectedSegment()
						setSearchParams({
							...EmptySessionsSearchParams,
							device_id: session.fingerprint?.toString(),
						})
					}}
				>
					#{session?.fingerprint}
				</Link>
			),
			renderType: 'string',
		})
	}

	if (session && session?.deviceMemory !== 0) {
		deviceData.push({
			keyDisplayValue: 'RAM',
			valueDisplayValue: bytesToPrettyString(
				session.deviceMemory! * 1024 * 1024,
			),
			renderType: 'string',
		})
	}

	const environmentData: KeyValueTableRow[] = browserExtensionScriptURLs.map(
		(scriptUrl) => ({
			keyDisplayValue: 'Browser Extension',
			renderType: 'react-node',
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

	return (
		<div className={styles.metadataPanel}>
			{!session ? (
				<Skeleton
					count={4}
					height={35}
					style={{
						marginTop: 8,
						marginBottom: 8,
					}}
				/>
			) : (
				<>
					<DataCard title="Session">
						<KeyValueTable data={sessionData} />
					</DataCard>
					<DataCard title="User">
						<KeyValueTable data={userData} />
					</DataCard>

					<DataCard title="Device">
						<KeyValueTable data={deviceData} />
					</DataCard>

					<DataCard title="Environment">
						<KeyValueTable data={environmentData} />
					</DataCard>
				</>
			)}
		</div>
	)
}

export default MetadataPanel
