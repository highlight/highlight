import { Avatar } from '@components/Avatar/Avatar'
import { TableList, TableListItem } from '@components/TableList/TableList'
import { useGetEnhancedUserDetailsQuery } from '@graph/hooks'
import { GetEnhancedUserDetailsQuery } from '@graph/operations'
import { Maybe, Session, SocialLink, SocialType } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	IconSolidExternalLink,
	IconSolidQuestionMarkCircle,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { sessionIsBackfilled } from '@pages/Player/utils/utils'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import {
	getDisplayName,
	getDisplayNameAndField,
	getIdentifiedUserProfileImage,
} from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'
import { useParams } from '@util/react-router/useParams'
import { copyToClipboard, validateEmail } from '@util/string'
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

import { RelatedResourceButtons } from '@/pages/Player/MetadataBox/RelatedResourceButtons'
import { buildQueryStateString } from '@/util/url/params'

import { useReplayerContext } from '../ReplayerContext'
import * as style from './MetadataBox.css'
import { getAbsoluteUrl, getMajorVersion } from './utils/utils'

export const MetadataBox = React.memo(() => {
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const { session, sessionMetadata } = useReplayerContext()
	const { setSearchQuery } = useSearchContext()
	const { setShowLeftPanel } = usePlayerConfiguration()

	const [enhancedAvatar, setEnhancedAvatar] = React.useState<string>()

	const { data, loading } = useGetEnhancedUserDetailsQuery({
		variables: { session_secure_id: session_secure_id! },
		skip: !session_secure_id,
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
				lines: '1',
			},
			{
				keyDisplayValue: 'UserID',
				valueDisplayValue: session?.fingerprint?.toString(),
			},
			{
				keyDisplayValue: 'Location',
				valueDisplayValue: geoData,
			},
			...(session?.ip?.length
				? [
						{
							keyDisplayValue: 'IP',
							valueDisplayValue: session?.ip,
						},
				  ]
				: []),
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
		if (!session) return

		const displayName = getDisplayName(session)
		const userParam = validateEmail(displayName) ? 'email' : 'identifier'

		setSearchQuery((query) => {
			const params = session.identified
				? { [`user_${userParam}`]: displayName }
				: { session_device_id: String(session.fingerprint) }

			return buildQueryStateString({
				query,
				...params,
			})
		})

		setShowLeftPanel(true)
	}, [session, setSearchQuery, setShowLeftPanel])

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
									'https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/identifying-sessions#what-happens-before-a-user-is-identified',
									'_blank',
								)
							}}
						>
							<Tag kind="secondary" emphasis="low" size="small">
								<Box display="flex" alignItems="center">
									<Tooltip
										placement="top-start"
										trigger={
											<Box display="flex">
												<IconSolidQuestionMarkCircle
													size={18}
												/>
											</Box>
										}
									>
										<Text color="moderate" size="xSmall">
											This session was not identified. The
											user information is inferred from a
											similar session in the same browser.
											Click to learn more.
										</Text>
									</Tooltip>
								</Box>
							</Tag>
						</Box>
					)}
				</Box>
				<ButtonIcon
					kind="secondary"
					emphasis="low"
					shape="square"
					size="small"
					icon={<IconSolidExternalLink />}
					onClick={searchIdentifier}
				/>
			</Box>
			<Box display="flex" justifyContent="center" pb="8">
				<RelatedResourceButtons
					secureSessionId={session_secure_id}
					disableErrors={!session?.has_errors}
					startDate={new Date(sessionMetadata.startTime)}
					endDate={new Date(sessionMetadata.endTime)}
				/>
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
		return <span className={style.enhancedSocial}>{inner}</span>
	}
	return (
		<a
			className={style.enhancedSocial}
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
