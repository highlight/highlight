import { AdminAvatar } from '@components/Avatar/Avatar'
import { getSlackUrl } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import SvgSlackLogo from '@components/icons/SlackLogo'
import {
	Mention,
	MentionsInput,
	OnChangeHandlerFunc,
} from '@highlight-run/react-mentions'
import { Box, Text } from '@highlight-run/ui'
import { useSlackSync } from '@hooks/useSlackSync'
import { useParams } from '@util/react-router/useParams'
import { splitTaggedUsers } from '@util/string'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import Linkify from 'react-linkify'

import { AdminSuggestion } from '@/components/Comment/utils/utils'
import SlackLoadOrConnect from '@/pages/Alerts/AlertConfigurationCard/SlackLoadOrConnect'

import newCommentFormStyles from '../NewCommentForm.module.scss'
import styles from './CommentTextBody.module.scss'
import mentionsClassNames from './mentions.module.scss'

interface Props {
	commentText: string
	placeholder?: string
	onChangeHandler?: OnChangeHandlerFunc
	suggestions?: AdminSuggestion[]
	onDisplayTransformHandler?: (_id: string, display: string) => string
	suggestionsPortalHost?: Element
	newInput?: boolean
	inputRef?: React.RefObject<HTMLTextAreaElement>
}

const CommentTextBody = ({
	commentText,
	placeholder,
	onChangeHandler,
	suggestions = [],
	onDisplayTransformHandler,
	suggestionsPortalHost,
	newInput,
	inputRef,
}: Props) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const slackUrl = getSlackUrl(project_id ?? '')
	const [shouldAutoFocus, setShouldAutoFocus] = useState(!!onChangeHandler)
	const { slackLoading, syncSlack } = useSlackSync()

	useEffect(() => {
		if (shouldAutoFocus) {
			const textarea = document.querySelector(
				`.${newCommentFormStyles.commentInputContainer} textarea`,
			) as HTMLTextAreaElement | null
			if (textarea) {
				textarea.focus()
			}
			setShouldAutoFocus(false)
		}
	}, [shouldAutoFocus])

	const mentions = commentText.split('@')
	const latestMention = `@${mentions.at(-1)}`

	const isSlackIntegrated = suggestions.some(
		(suggestion) =>
			suggestion.display?.includes('#') ||
			(suggestion.display && suggestion.display[0] == '@'),
	)

	if (!newInput) {
		const pieces = []
		for (const { matched, value } of splitTaggedUsers(commentText)) {
			if (matched) {
				pieces.push(
					<Box
						as="span"
						cssClass={styles.commentLink}
						key={pieces.length}
					>
						{value}
					</Box>,
				)
			} else {
				pieces.push(
					<Linkify
						key={pieces.length}
						componentDecorator={(
							decoratedHref: string,
							decoratedText: string,
							key: number,
						) => (
							<a
								target="_blank"
								rel="noreferrer"
								href={decoratedHref}
								key={key}
								className={styles.commentLink}
							>
								{decoratedText}
							</a>
						)}
					>
						{value}
					</Linkify>,
				)
			}
		}

		return (
			<Text size="small" color="moderate">
				{pieces}
			</Text>
		)
	}

	return (
		<MentionsInput
			inputRef={inputRef}
			value={commentText}
			className="mentions"
			classNames={mentionsClassNames}
			onFocus={syncSlack}
			onChange={onChangeHandler}
			placeholder={placeholder}
			autoFocus={shouldAutoFocus}
			aria-readonly={!onChangeHandler}
			suggestionsPortalHost={suggestionsPortalHost}
			allowSuggestionsAboveCursor
			listHeader={
				<div className={styles.suggestionHeader}>
					{isSlackIntegrated ? (
						<>
							<p>Tag a user or Slack account</p>
						</>
					) : (
						<p>
							Tag a user (
							<a href={slackUrl}>Enable Slack Mentions</a>)
						</p>
					)}
				</div>
			}
			noResultsMessage={
				<>
					<p className={styles.noResultsMessage}>
						<SlackLoadOrConnect
							isLoading={slackLoading}
							searchQuery={latestMention}
						/>
					</p>
				</>
			}
		>
			<Mention
				className={mentionsClassNames.mentionsMention}
				trigger="@"
				data={suggestions}
				displayTransform={onDisplayTransformHandler}
				appendSpaceOnAdd
				renderSuggestion={(
					suggestion,
					search,
					highlightedDisplay,
					index,
					focused,
				) => (
					<Suggestion
						focused={focused}
						highlightedDisplay={highlightedDisplay}
						index={index}
						search={search}
						suggestion={suggestion as AdminSuggestion}
					/>
				)}
			/>
		</MentionsInput>
	)
}

export default CommentTextBody

const Suggestion = ({
	suggestion,
}: {
	suggestion: AdminSuggestion
	search: string
	highlightedDisplay: React.ReactNode
	index: number
	focused: boolean
}) => {
	return (
		<div className={styles.suggestionContainer}>
			<div className={styles.avatarContainer}>
				{['@', '#'].includes((suggestion?.name || '')[0]) && (
					<div className={styles.slackLogoContainer}>
						<SvgSlackLogo className={styles.slackLogo} />
					</div>
				)}
				<AdminAvatar
					adminInfo={{
						name: suggestion.name,
						email: suggestion.email,
						photo_url: suggestion.photoUrl,
					}}
					size={35}
				/>
			</div>
			<div className={styles.adminText}>
				<span className={styles.longValue}>{suggestion.display}</span>
				{suggestion.display !== suggestion.id && (
					<span className={clsx(styles.email, styles.longValue)}>
						{suggestion.email}
					</span>
				)}
			</div>
		</div>
	)
}
