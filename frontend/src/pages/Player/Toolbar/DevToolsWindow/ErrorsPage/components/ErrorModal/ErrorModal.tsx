import Alert from '@components/Alert/Alert'
import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { Skeleton } from '@components/Skeleton/Skeleton'
import { useGetErrorGroupQuery } from '@graph/hooks'
import { ErrorFrequencyGraph } from '@pages/Player/Toolbar/DevToolsWindow/ErrorsPage/components/ErrorFrequencyGraph/ErrorFrequencyGraph'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useHistory } from 'react-router'

import Button from '../../../../../../../components/Button/Button/Button'
import { ErrorObject } from '../../../../../../../graph/generated/schemas'
import ErrorBody from '../../../../../../Error/components/ErrorBody/ErrorBody'
import ErrorTitle from '../../../../../../Error/components/ErrorTitle/ErrorTitle'
import StackTraceSection from '../../../../../../Error/components/StackTraceSection/StackTraceSection'
import styles from './ErrorModal.module.scss'

interface Props {
	error: ErrorObject
	showRequestAlert: boolean
}

const ErrorModal = ({ error, showRequestAlert }: Props) => {
	const { data, loading } = useGetErrorGroupQuery({
		variables: { secure_id: error.error_group_secure_id },
	})
	const history = useHistory()
	const { project_id } = useParams<{ project_id: string }>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	return (
		<div className={styles.container}>
			<div>
				{showRequestAlert && (
					<Alert
						type="warning"
						trackingId="UnmatchedBackendError"
						message="Request data not found"
						className={styles.alertContainer}
						description={
							<>
								The network resource associated with this error
								could not be found. This could happen if the
								tracingOrigins parameter of H.init() was not
								configured correctly, or if the user's browser
								failed to push the network resource data while
								the session was being recorded.
							</>
						}
					/>
				)}

				<div className={styles.titleContainer}>
					{data ? (
						<ErrorTitle
							errorGroup={data.error_group}
							showShareButton={false}
							errorObject={error}
						/>
					) : (
						<Skeleton height="57px" />
					)}
				</div>

				<div className={styles.errorBodyContainer}>
					{data ? (
						<ErrorBody
							errorGroup={data.error_group}
							errorObject={error}
						/>
					) : (
						<Skeleton height="217px" />
					)}
				</div>

				<h3>Stack Trace</h3>
				{data ? (
					<StackTraceSection
						errorGroup={data.error_group}
						loading={loading}
						compact={true}
					/>
				) : (
					<Skeleton
						height="212px"
						count={5}
						containerClassName={styles.stackTraceLoadingWrapper}
					/>
				)}

				{data ? (
					<ErrorFrequencyGraph errorGroup={data.error_group} />
				) : (
					<Skeleton height="353px" />
				)}
				<div className={styles.actionsContainer}>
					<Button
						trackingId="GoToErrorPageFromSessionErrorModal"
						type="primary"
						onClick={() => {
							history.push(
								`/${projectIdRemapped}/errors/${error.error_group_secure_id}`,
							)
						}}
					>
						Error Page
					</Button>
				</div>
			</div>
		</div>
	)
}

export default ErrorModal
