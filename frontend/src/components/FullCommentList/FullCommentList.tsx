import ConnectHighlightWithSlackButton from '@components/Header/components/ConnectHighlightWithSlackButton/ConnectHighlightWithSlackButton'
import LoadingBox from '@components/LoadingBox'
import classNames from 'classnames'
import React, { useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import styles from './FullCommentList.module.scss'

interface Props {
	loading: boolean
	comments?: any[]
	commentRender: (comment: any) => React.ReactNode
	noCommentsMessage: string
}

const FullCommentList = ({
	loading,
	comments = [],
	commentRender,
	noCommentsMessage,
}: Props) => {
	const virtuoso = useRef<VirtuosoHandle>(null)

	return (
		<div className={styles.commentStream}>
			{loading && <LoadingBox height={90} />}
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
						itemContent={(index, comment: any) => (
							<div
								key={comment.id || index}
								className={classNames(styles.comment, {
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
