import { Button } from '@/components/Button'
import { cmdKey } from '@/components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import { Badge, Stack } from '@highlight-run/ui/components'
import { useGraphContext } from '@pages/Graphing/context/GraphContext'
import { useEffect, useState } from 'react'

export const RunQueryButton = ({ onRunQuery }: { onRunQuery: () => void }) => {
	const { queryStartTime } = useGraphContext()
	const [timeElapsed, setTimeElapsed] = useState<number | undefined>()
	useEffect(() => {
		if (queryStartTime === undefined) {
			setTimeElapsed(undefined)
		} else {
			setTimeElapsed(
				Math.floor(
					(new Date().getTime() - queryStartTime.getTime()) / 1000,
				),
			)
			const interval = setInterval(() => {
				setTimeElapsed(
					Math.floor(
						(new Date().getTime() - queryStartTime.getTime()) /
							1000,
					),
				)
			}, 1000)
			return () => clearInterval(interval)
		}
	}, [queryStartTime])

	return (
		<Button
			onClick={onRunQuery}
			loading={queryStartTime !== undefined}
			trackingId="RunQueryButton"
		>
			<Stack direction="row" align="center" gap="4">
				{queryStartTime !== undefined
					? `${timeElapsed ?? 0}s`
					: 'Run query'}
				{queryStartTime === undefined && (
					<Badge variant="outlinePurple" label={`${cmdKey} Enter`} />
				)}
			</Stack>
		</Button>
	)
}
