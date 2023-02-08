import ConnectHighlightWithSlackButton from '@components/Header/components/ConnectHighlightWithSlackButton/ConnectHighlightWithSlackButton'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import LoadingBox from '@components/LoadingBox'
import React, { useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { styledVerticalScrollbar } from 'style/common.css'

import styles from './FullCommentList.module.scss'

interface Props {
	loading: boolean
	comments?: any[]
	commentRender: (comment: any) => React.ReactNode
	noCommentsMessage: string
}

const FullCommentList = ({
	loading: isLoadingComments,
	comments = [],
	commentRender,
	noCommentsMessage,
}: Props) => {
	const virtuoso = useRef<VirtuosoHandle>(null)
	const { loading: isLoadingSlack } = useSlackBot()

	const loading = isLoadingComments || isLoadingSlack
	return (
		<div className={styles.commentStream}>
			{loading && <LoadingBox />}
			{!loading && comments.length === 0 ? (
				<div className={styles.noCommentsContainer}>
					<div className={styles.noCommentsTextContainer}>
						<h2>There are no comments yet</h2>
						<p>{noCommentsMessage}</p>
					</div>
					<ConnectHighlightWithSlackButton />
				</div>
			) : (
				<>
					<Virtuoso
						ref={virtuoso}
						overscan={500}
						data={comments}
						className={styledVerticalScrollbar}
						itemContent={(index, comment: any) => (
							<div
								key={comment.id || index}
								className={clsx(styles.comment, {
									[styles.firstComment]: index === 0,
								})}
							>
								{commentRender(comment)}
							</div>
						)}
					/>
				</>
			)}
		</div>
	)
}

export default FullCommentList
