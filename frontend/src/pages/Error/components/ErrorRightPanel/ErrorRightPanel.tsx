import { GetErrorGroupQuery, GetRecentErrorsQuery } from '@graph/operations'
import React from 'react'

import Card from '../../../../components/Card/Card'
import Tabs from '../../../../components/Tabs/Tabs'
import ErrorComments from '../ErrorComments/ErrorComments'
import ErrorFullCommentList from './components/ErrorFullCommentList/ErrorFullCommentList'
import ErrorMetadata from './components/ErrorMetadata/ErrorMetadata'
import ErrorSessionList from './components/ErrorSessionList/ErrorSessionList'
import styles from './ErrorRightPanel.module.scss'

interface Props {
	errorGroup?: GetErrorGroupQuery
	recentErrors?: GetRecentErrorsQuery
	recentErrorsLoading: boolean
	parentRef?: React.RefObject<HTMLDivElement>
	onClickCreateComment?: () => void
	deepLinkedCommentId?: string | null
}

const ErrorRightPanel = ({
	errorGroup,
	recentErrors,
	recentErrorsLoading,
	parentRef,
	onClickCreateComment,
	deepLinkedCommentId,
}: Props) => {
	const errorCommentsRef = React.useRef(null)
	return (
		<Card noPadding className={styles.rightPanel}>
			<Tabs
				centered
				noPadding
				tabs={[
					{
						key: 'Sessions',
						panelContent: (
							<div className={styles.tabContainer}>
								<ErrorSessionList
									recentErrors={recentErrors}
									loading={recentErrorsLoading}
								/>
							</div>
						),
					},
					{
						key: 'Metadata',
						panelContent: (
							<div className={styles.tabContainer}>
								<ErrorMetadata errorGroup={errorGroup} />
							</div>
						),
					},
					{
						key: 'Comments',
						panelContent: (
							<div
								className={styles.commentsTabContainer}
								ref={errorCommentsRef}
							>
								<ErrorFullCommentList
									errorGroup={errorGroup}
									parentRef={errorCommentsRef}
									deepLinkedCommentId={deepLinkedCommentId}
								/>
								<div className={styles.createCommentContainer}>
									<ErrorComments
										parentRef={parentRef}
										onClickCreateComment={
											onClickCreateComment
										}
									/>
								</div>
							</div>
						),
					},
				]}
				id="ErrorPageRightPanel"
			/>
		</Card>
	)
}

export default ErrorRightPanel
