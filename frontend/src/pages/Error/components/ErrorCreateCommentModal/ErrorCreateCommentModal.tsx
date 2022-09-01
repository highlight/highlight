import { GetErrorGroupQuery } from '@graph/operations'
import { NewCommentModal } from '@pages/Player/Toolbar/NewCommentModal/NewCommentModal'
import useWindowSize from '@rehooks/window-size'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

export enum CreateModalType {
	None,
	Comment,
	Issue,
}
interface Props {
	onClose: () => void
	show: CreateModalType
	parentRef?: React.RefObject<HTMLDivElement>
	data?: GetErrorGroupQuery
}

export const ErrorCreateCommentModal = ({
	onClose,
	show,
	parentRef,
	data,
}: Props) => {
	const pRef = React.useRef<HTMLDivElement>(null)
	const { error_secure_id } = useParams<{
		error_secure_id: string
	}>()

	const { innerWidth, innerHeight } = useWindowSize()

	const currentUrl = `${
		window.location.port !== ''
			? 'https://app.highlight.run'
			: window.location.origin
	}${window.location.pathname}`

	return (
		<NewCommentModal
			mask={true}
			title={
				show === CreateModalType.Comment
					? 'Add a Comment'
					: 'Attach an Issue'
			}
			newCommentModalRef={parentRef ?? pRef}
			commentModalPosition={
				show !== CreateModalType.None
					? {
							x: innerWidth / 2 - 250,
							y: innerHeight / 2 - 210,
					  }
					: undefined
			}
			onCancel={onClose}
			commentTime={0}
			error_secure_id={error_secure_id}
			errorTitle={data?.error_group?.event?.join('')}
			currentUrl={currentUrl}
		/>
	)
}
