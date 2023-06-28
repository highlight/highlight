import { useParams } from '@util/react-router/useParams'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { PreviousNextGroup } from '@/components/PreviousNextGroup/PreviousNextGroup'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import { Maybe } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import analytics from '@/util/analytics'

type Props = {
	data: GetErrorInstanceQuery | undefined
}

export const PreviousNextInstance = ({ data }: Props) => {
	const { error_secure_id } = useParams<{
		error_secure_id: string
		error_object_id: string
	}>()

	const { projectId } = useProjectId()
	const navigate = useNavigate()

	const goToErrorInstance = (
		errorInstanceId: Maybe<string> | undefined,
		direction: 'next' | 'previous',
	) => {
		if (!errorInstanceId || Number(errorInstanceId) === 0) {
			return
		}

		navigate({
			pathname: `/${projectId}/errors/${error_secure_id}/instances/${errorInstanceId}`,
			search: window.location.search,
		})

		analytics.track('Viewed error instance', {
			direction,
		})
	}

	const errorInstance = data?.error_instance

	useHotkeys(']', () => goToErrorInstance(errorInstance?.next_id, 'next'), [
		errorInstance?.next_id,
	])
	useHotkeys(
		'[',
		() => goToErrorInstance(errorInstance?.previous_id, 'previous'),
		[errorInstance?.previous_id],
	)

	return (
		<PreviousNextGroup
			canMoveBackward={
				!!errorInstance && Number(errorInstance.previous_id) !== 0
			}
			canMoveForward={
				!!errorInstance && Number(errorInstance.next_id) !== 0
			}
			prevShortcut="["
			nextShortcut="]"
			onPrev={() =>
				goToErrorInstance(errorInstance?.previous_id, 'previous')
			}
			onNext={() => goToErrorInstance(errorInstance?.next_id, 'next')}
			as="tag"
		/>
	)
}
