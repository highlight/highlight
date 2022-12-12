import { useAuthContext } from '@authentication/AuthContext'
import { Avatar } from '@components/Avatar/Avatar'
import Button from '@components/Button/Button/Button'
import { ExternalLinkText } from '@components/ExternalLinkText'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { Skeleton } from '@components/Skeleton/Skeleton'
import Tooltip from '@components/Tooltip/Tooltip'
import {
	useGetEnhancedUserDetailsQuery,
	useGetProjectQuery,
	useGetWorkspaceQuery,
	useMarkSessionAsStarredMutation,
} from '@graph/hooks'
import { GetEnhancedUserDetailsQuery } from '@graph/operations'
import {
	Maybe,
	PlanType,
	Session,
	SocialLink,
	SocialType,
} from '@graph/schemas'
import SvgInformationIcon from '@icons/InformationIcon'
import UserCross from '@icons/UserCross'
import { PaywallTooltip } from '@pages/Billing/PaywallTooltip/PaywallTooltip'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { sessionIsBackfilled } from '@pages/Player/utils/utils'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { mustUpgradeForClearbit } from '@util/billing/billing'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import classNames from 'classnames'
import React, { useCallback, useEffect } from 'react'
import {
	FaExternalLinkSquareAlt,
	FaFacebookSquare,
	FaGithubSquare,
	FaLinkedin,
	FaTwitterSquare,
} from 'react-icons/fa'

import UserIdentifier from '../../../components/UserIdentifier/UserIdentifier'
import { ReactComponent as StarIcon } from '../../../static/star.svg'
import { ReactComponent as FilledStarIcon } from '../../../static/star-filled.svg'
import {
	getDisplayNameAndField,
	getIdentifiedUserProfileImage,
} from '../../Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils'
import { useReplayerContext } from '../ReplayerContext'
import styles from './MetadataBox.module.scss'
import { getAbsoluteUrl, getMajorVersion } from './utils/utils'

export const MetadataBox = React.memo(() => {
	const { isLoggedIn } = useAuthContext()
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const { session } = useReplayerContext()
	const { setSearchParams } = useSearchContext()
	const { setShowLeftPanel } = usePlayerConfiguration()

	const [enhancedAvatar, setEnhancedAvatar] = React.useState<string>()
	const [markSessionAsStarred] = useMarkSessionAsStarredMutation({
		update(cache) {
			cache.modify({
				fields: {
					session(existingSession) {
						return {
							...existingSession,
							starred: !existingSession.starred,
						}
					},
				},
			})
		},
	})

	// clear enhanced avatar when session changes
	useEffect(() => {
		setEnhancedAvatar(undefined)
	}, [session_secure_id])

	const created = new Date(session?.created_at ?? 0)
	const customAvatarImage = getIdentifiedUserProfileImage(
		session as Maybe<Session>,
	)
	const backfilled = sessionIsBackfilled(session)

	const geoData = [session?.city, session?.state, session?.country]
		.filter((part) => !!part)
		.join(', ')

	const [displayValue, field] = getDisplayNameAndField(session)
	const searchIdentifier = useCallback(() => {
		const hasIdentifier = !!session?.identifier
		const newSearchParams = {
			...EmptySessionsSearchParams,
		}

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
		<div
			className={classNames(styles.userBox, {
				[styles.backfillShown]: backfilled,
			})}
		>
			{backfilled && (
				<div
					className={styles.backfillContainer}
					onClick={() => {
						window.open(
							'https://docs.highlight.run/identifying-users#BXEtr',
							'_blank',
						)
					}}
				>
					<div className={styles.backfillContent}>
						<div className={styles.backfillUserIcon}>
							<UserCross />
						</div>
						<div>This session was not identified.</div>
						<Tooltip
							placement="leftTop"
							title="This session was not identified. The user information is inferred from a similar session in the same browser. Click to learn more."
							mouseEnterDelay={0}
						>
							<div className={styles.backfillInfoIcon}>
								<SvgInformationIcon />
							</div>
						</Tooltip>
					</div>
				</div>
			)}
			<div className={styles.userMainSection}>
				<div className={styles.userAvatarWrapper}>
					{!session ? (
						<Skeleton circle={true} height={36} width={36} />
					) : (
						<Avatar
							className={styles.avatar}
							seed={session?.identifier ?? ''}
							shape="rounded"
							customImage={customAvatarImage || enhancedAvatar}
						/>
					)}
				</div>
				<div className={styles.headerWrapper}>
					{!session ? (
						<Skeleton
							count={3}
							style={{ height: 20, marginBottom: 5 }}
						/>
					) : (
						<>
							<h4 className={styles.userIdHeader}>
								<UserIdentifier
									displayValue={displayValue}
									className={styles.userIdentifier}
								/>
								{isLoggedIn && (
									<div
										className={styles.starIconWrapper}
										onClick={() => {
											markSessionAsStarred({
												variables: {
													secure_id:
														session_secure_id,
													starred: !session?.starred,
												},
											})
												.then(() => {
													message.success(
														'Updated session status!',
														3,
													)
												})
												.catch(() => {
													message.error(
														'Error updating session status!',
														3,
													)
												})
										}}
									>
										{session?.starred ? (
											<FilledStarIcon
												className={styles.starredIcon}
											/>
										) : (
											<StarIcon
												className={styles.unstarredIcon}
											/>
										)}
									</div>
								)}
							</h4>
							<p className={styles.userIdSubHeader}>
								{created.toLocaleString('en-us', {
									hour: '2-digit',
									minute: '2-digit',
									timeZoneName: 'short',
									day: 'numeric',
									month: 'short',
									weekday: 'long',
									year:
										created.getFullYear() !==
										new Date().getFullYear()
											? 'numeric'
											: undefined,
								})}
							</p>
							{geoData && (
								<p className={styles.userIdSubHeader}>
									<span>{geoData}</span>
								</p>
							)}
							{session?.browser_name && (
								<p className={styles.userIdSubHeader}>
									<span>
										{session.browser_name}{' '}
										{getMajorVersion(
											session.browser_version,
										)}
									</span>
									<span> • </span>
									<span>
										{session.os_name}{' '}
										{getMajorVersion(session.os_version)}
									</span>
								</p>
							)}
							<Button
								className={styles.viewAllSessionsButton}
								trackingId="ViewAllUserSessions"
								type="text"
								onClick={searchIdentifier}
							>
								<ExternalLinkText>
									All Sessions for this User
								</ExternalLinkText>
							</Button>
						</>
					)}
				</div>
			</div>
			<UserDetailsBox setEnhancedAvatar={setEnhancedAvatar} />
		</div>
	)
})

export const UserDetailsBox = React.memo(
	({
		setEnhancedAvatar,
	}: {
		setEnhancedAvatar: (avatar: string) => void
	}) => {
		const { project_id, session_secure_id } = useParams<{
			project_id: string
			session_secure_id: string
		}>()
		const { data: project } = useGetProjectQuery({
			variables: { id: project_id },
		})
		const { data: workspace } = useGetWorkspaceQuery({
			variables: { id: project?.workspace?.id || '' },
			skip: !project?.workspace?.id,
		})
		const { data, loading } = useGetEnhancedUserDetailsQuery({
			variables: { session_secure_id },
			fetchPolicy: 'no-cache',
		})

		useEffect(() => {
			if (data?.enhanced_user_details?.avatar) {
				setEnhancedAvatar(data.enhanced_user_details.avatar)
			}
		}, [setEnhancedAvatar, data])

		if (loading) {
			return null
		}

		if (!data?.enhanced_user_details) {
			if (mustUpgradeForClearbit(workspace?.workspace?.plan_tier)) {
				return (
					<PaywallTooltip tier={PlanType.Startup}>
						<div className={styles.userEnhancedGrid}>
							<div style={{ width: 36 }}>
								<div className={styles.blurred}>
									<Avatar
										seed="test"
										className={styles.avatar}
									/>
								</div>
							</div>
							<div className={styles.enhancedTextSection}>
								<div className={styles.blurred}>
									<SocialComponent
										disabled
										socialLink={
											{
												link: 'http://example.com',
												type: 'Github',
											} as SocialLink
										}
										key="example"
									/>
									SOME INTERESTING DETAILS HERE
								</div>
							</div>
						</div>
					</PaywallTooltip>
				)
			}
			if (!workspace?.workspace?.clearbit_enabled) {
				return (
					<div className={styles.enableClearbit}>
						<a
							href={`/${project_id}/integrations`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Enable Clearbit to collect more user details.
						</a>
					</div>
				)
			}
		}

		if (!hasEnrichedData(data)) {
			return null
		}

		return (
			<div className={styles.userEnhanced}>
				<div className={styles.enhancedTextSection}>
					{loading ? (
						<Skeleton height="2rem" />
					) : (
						<>
							{data?.enhanced_user_details?.name && (
								<h4 id={styles.enhancedName}>
									<span>
										{data?.enhanced_user_details?.name}
									</span>
									<div className={styles.tooltip}>
										<InfoTooltip
											title={`This is enriched information for ${data?.enhanced_user_details?.email}. Highlight shows additional information like social handles, website, title, and company. This feature is enabled via the Clearbit Integration for the Startup plan and above.`}
											size="medium"
											hideArrow
											placement="topLeft"
										/>
									</div>
								</h4>
							)}
							{data?.enhanced_user_details?.bio && (
								<p className={styles.enhancedBio}>
									{data?.enhanced_user_details?.bio}
								</p>
							)}
							{hasDiverseSocialLinks(data) && (
								<div className={styles.enhancedLinksGrid}>
									{data?.enhanced_user_details?.socials?.map(
										(e: any) =>
											e && (
												<SocialComponent
													socialLink={e}
													key={e.type}
												/>
											),
									)}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		)
	},
)

const SocialComponent = ({
	socialLink,
	disabled,
}: {
	socialLink: SocialLink
	disabled?: boolean
}) => {
	const inner = (
		<>
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
			<p className={styles.enhancedSocialText}>{socialLink.type}</p>
		</>
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
		hasDiverseSocialLinks(enhancedData) ||
		0 > 0
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

	if (socials.length === 1 && socials[0]?.type === SocialType.Site) {
		return false
	}

	return true
}
