import ConnectHighlightWithSlackButton from '@components/Header/components/ConnectHighlightWithSlackButton/ConnectHighlightWithSlackButton'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import LoadingBox from '@components/LoadingBox'
import { Box } from '@highlight-run/ui/components'
import React, { useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { styledVerticalScrollbar } from '@/style/common.css'

import styles from './FullCommentList.module.css'

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
		<Box display="flex" flexDirection="column" height="full">
			{loading && <LoadingBox />}
			{!loading && (
				<>
					{comments.length === 0 ? (
						<div className={styles.noCommentsContainer}>
							<div className={styles.noCommentsTextContainer}>
								<h2>There are no comments yet</h2>
								<p>{noCommentsMessage}</p>
							</div>
							<ConnectHighlightWithSlackButton />
						</div>
					) : (
						<Virtuoso
							className={styledVerticalScrollbar}
							ref={virtuoso}
							overscan={500}
							data={comments}
							itemContent={(index, comment: any) => (
								<Box
									key={comment.id || index}
									px="8"
									mt={index === 0 ? '8' : undefined}
									mb={
										index === comments.length - 1
											? '8'
											: undefined
									}
								>
									{commentRender(comment)}
								</Box>
							)}
						/>
					)}
				</>
			)}
		</Box>
	)
}

export default FullCommentList
