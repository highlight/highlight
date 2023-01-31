import { Avatar } from '@components/Avatar/Avatar'
import { TableList, TableListItem } from '@components/TableList/TableList'
import Tooltip from '@components/Tooltip/Tooltip'
import { useGetEnhancedUserDetailsQuery } from '@graph/hooks'
import { GetEnhancedUserDetailsQuery } from '@graph/operations'
import { Maybe, Session, SocialLink, SocialType } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	IconSolidExternalLink,
	Tag,
	Text,
} from '@highlight-run/ui'
import UserCross from '@icons/UserCross'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { sessionIsBackfilled } from '@pages/Player/utils/utils'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { useParams } from '@util/react-router/useParams'
import { copyToClipboard } from '@util/string'
import { message } from 'antd'
import clsx from 'clsx'
import { capitalize } from 'lodash'
import React, { useCallback, useEffect, useMemo } from 'react'
import {
	FaExternalLinkSquareAlt,
	FaFacebookSquare,
	FaGithubSquare,
	FaLinkedin,
	FaTwitterSquare,
} from 'react-icons/fa'

import {
	getDisplayNameAndField,
	getIdentifiedUserProfileImage,
} from '../../Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils'
import { useReplayerContext } from '../ReplayerContext'
import * as style from './MetadataBox.css'
import styles from './MetadataBox.module.scss'
import { getAbsoluteUrl, getMajorVersion } from './utils/utils'

export const MetadataBox = React.memo(() => {
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const { session } = useReplayerContext()
	const { setSearchParams } = useSearchContext()
	const { setShowLeftPanel } = usePlayerConfiguration()

	const [enhancedAvatar, setEnhancedAvatar] = React.useState<string>()

	const { data, loading } = useGetEnhancedUserDetailsQuery({
		variables: { session_secure_id },
		fetchPolicy: 'no-cache',
		onError: () => {
			setEnhancedAvatar(undefined)
		},
		onCompleted: (data) => {
			if (data?.enhanced_user_details?.avatar) {
				setEnhancedAvatar(data.enhanced_user_details.avatar)
			}
		},
	})

	// clear enhanced avatar when session changes
	useEffect(() => {
		setEnhancedAvatar(undefined)
	}, [session_secure_id])

	const customAvatarImage = getIdentifiedUserProfileImage(
		session as Maybe<Session>,
	)
	const backfilled = sessionIsBackfilled(session)

	const [displayValue, field] = getDisplayNameAndField(session)

	const userData = useMemo(() => {
		const created = new Date(session?.created_at ?? 0)
		const geoData = [session?.state, session?.country]
			.filter((part) => !!part)
			.join(', ')

		const userProps: TableListItem[] = [
			{
				keyDisplayValue: capitalize(field ?? 'Email'),
				valueDisplayValue: displayValue,
			},
			{
				keyDisplayValue: 'UserID',
				valueDisplayValue: session?.fingerprint?.toString(),
			},
			{
				keyDisplayValue: 'Location',
				valueDisplayValue: geoData,
			},
			{
				keyDisplayValue: 'Browser',
				valueDisplayValue:
					session?.browser_name && session?.browser_version
						? `${session.browser_name} ${getMajorVersion(
								session.browser_version,
						  )}`
						: undefined,
			},
			{
				keyDisplayValue: 'OS',
				valueDisplayValue:
					session?.os_name && session?.os_version
						? `${session.os_name} ${getMajorVersion(
								session.os_version,
						  )}`
						: undefined,
			},
			{
				keyDisplayValue: 'Time',
				valueDisplayValue: created.toLocaleString('en-us', {
					hour: '2-digit',
					minute: '2-digit',
					timeZoneName: 'short',
					day: 'numeric',
					month: 'short',
					weekday: 'long',
					year:
						created.getFullYear() !== new Date().getFullYear()
							? 'numeric'
							: undefined,
				}),
			},
		]
		const enhancedUserDataTooltipMessage =
			`This is enriched information for ${data?.enhanced_user_details?.email}. ` +
			`Highlight shows additional information like social handles, website, title, and company. ` +
			`This feature is enabled via the Clearbit Integration for the Startup plan and above.`

		let enrichedData: TableListItem[] = []
		if (!loading && hasEnrichedData(data)) {
			enrichedData = [
				{
					keyDisplayValue: 'Name',
					valueDisplayValue: data?.enhanced_user_details?.name,
					valueInfoTooltipMessage: enhancedUserDataTooltipMessage,
				},
				{
					keyDisplayValue: 'Email',
					valueDisplayValue: data?.enhanced_user_details?.email,
					valueInfoTooltipMessage: enhancedUserDataTooltipMessage,
				},
				{
					keyDisplayValue: 'Bio',
					valueDisplayValue: data?.enhanced_user_details?.bio,
					lines: '3',
					valueInfoTooltipMessage: enhancedUserDataTooltipMessage,
				},
			]
			if (data?.enhanced_user_details?.socials?.length) {
				enrichedData.push({
					keyDisplayValue: 'Socials',
					valueDisplayValue: (
						<Box
							display="flex"
							gap="8"
							style={{
								overflowY: 'hidden',
								overflowX: 'auto',
							}}
						>
							{data?.enhanced_user_details?.socials?.map(
								(e: any) =>
									e && (
										<SocialComponent
											socialLink={e}
											key={e.type}
										/>
									),
							)}
						</Box>
					),
					valueInfoTooltipMessage: enhancedUserDataTooltipMessage,
				})
			}
		}
		return [...userProps, ...enrichedData]
	}, [data, displayValue, field, loading, session])

	const searchIdentifier = useCallback(() => {
		const hasIdentifier = !!session?.identifier
		const newSearchParams = {
			...EmptySessionsSearchParams,
		}

		// TODO: Fix redirect
		if (hasIdentifier && field !== null) {
			newSearchParams.user_properties = [
				{
					id: '0',
					name: field,
					value: displayValue,
				},
			]
		} else if (session?.fingerprint) {
			newSearchParams.device_id = session.fingerprint.toString()
		}

		setSearchParams(newSearchParams)
		setShowLeftPanel(true)
	}, [
		displayValue,
		field,
		session?.fingerprint,
		session?.identifier,
		setSearchParams,
		setShowLeftPanel,
	])

	return (
		<Box display="flex" flexDirection="column" style={{ width: 300 }}>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				py="6"
				px="8"
				style={{ height: 44 }}
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					gap="8"
					onClick={() => {
						copyToClipboard(displayValue)
						message.success(`Copied identifier ${displayValue}`, 3)
					}}
				>
					<Avatar
						className={style.avatar}
						seed={session?.identifier ?? ''}
						shape="rounded"
						customImage={customAvatarImage || enhancedAvatar}
					/>
					<Text weight="bold" cssClass={style.defaultText} lines="1">
						{displayValue}
					</Text>
					{backfilled && (
						<Box
							display="flex"
							alignItems="center"
							onClick={() => {
								window.open(
									'https://docs.highlight.run/identifying-users#BXEtr',
									'_blank',
								)
							}}
						>
							<Tag kind="secondary" emphasis="low" size="small">
								<Box display="flex" alignItems="center">
									<Tooltip
										placement="leftTop"
										title="This session was not identified. The user information is inferred from a similar session in the same browser. Click to learn more."
										mouseEnterDelay={0}
									>
										<div
											className={styles.backfillUserIcon}
										>
											<UserCross />
										</div>
									</Tooltip>
								</Box>
							</Tag>
						</Box>
					)}
				</Box>
				<Box display="flex" alignItems="center">
					<ButtonIcon
						kind="secondary"
						emphasis="low"
						shape="square"
						size="small"
						icon={<IconSolidExternalLink />}
						onClick={searchIdentifier}
					/>
				</Box>
			</Box>
			<Box
				borderTop="secondary"
				display="flex"
				flexDirection="column"
				padding="12"
				paddingBottom="6"
				gap="4"
			>
				<TableList truncateable loading={loading} data={userData} />
			</Box>
		</Box>
	)
})

const SocialComponent = ({
	socialLink,
	disabled,
}: {
	socialLink: SocialLink
	disabled?: boolean
}) => {
	const inner = (
		<Box
			display="inline-flex"
			gap="4"
			alignItems="center"
			style={{ height: 14 }}
		>
			{socialLink?.type === SocialType.Github ? (
				<FaGithubSquare />
			) : socialLink?.type === SocialType.Facebook ? (
				<FaFacebookSquare />
			) : socialLink?.type === SocialType.Twitter ? (
				<FaTwitterSquare />
			) : socialLink?.type === SocialType.Site ? (
				<FaExternalLinkSquareAlt />
			) : socialLink?.type === SocialType.LinkedIn ? (
				<FaLinkedin />
			) : (
				<></>
			)}
			<Text size="xSmall" cssClass={clsx(style.secondaryText)}>
				{socialLink.type}
			</Text>
		</Box>
	)
	if (disabled) {
		return <span className={styles.enhancedSocial}>{inner}</span>
	}
	return (
		<a
			className={styles.enhancedSocial}
			href={getAbsoluteUrl(socialLink.link ?? '')}
			target="_blank"
			rel="noopener noreferrer"
		>
			{inner}
		</a>
	)
}

const hasEnrichedData = (enhancedData?: GetEnhancedUserDetailsQuery) => {
	if (!enhancedData) {
		return false
	}

	const { enhanced_user_details } = enhancedData

	return (
		(!!enhanced_user_details?.avatar &&
			enhanced_user_details?.avatar !== '') ||
		(!!enhanced_user_details?.bio && enhanced_user_details?.bio !== '') ||
		(!!enhanced_user_details?.name && enhanced_user_details?.name !== '') ||
		hasDiverseSocialLinks(enhancedData)
	)
}

const hasDiverseSocialLinks = (enhancedData?: GetEnhancedUserDetailsQuery) => {
	if (!enhancedData) {
		return false
	}

	const { enhanced_user_details } = enhancedData
	if (!enhanced_user_details) {
		return false
	}

	const { socials } = enhanced_user_details
	if (!socials) {
		return false
	}

	if (!socials.length) {
		return false
	}

	return !(socials.length === 1 && socials[0]?.type === SocialType.Site)
}
