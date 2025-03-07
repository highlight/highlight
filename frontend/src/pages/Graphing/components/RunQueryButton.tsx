import { Button } from '@/components/Button'
import { useGraphContext } from '@pages/Graphing/context/GraphContext'
import { useEffect, useState } from 'react'

export const RunQueryButton = ({
	sqlInternal,
	setSql,
}: {
	sqlInternal: string
	setSql: (s: string) => void
}) => {
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
			onClick={() => {
				setSql(sqlInternal)
			}}
			loading={queryStartTime !== undefined}
			trackingId="RunQueryButton"
		>
			{queryStartTime !== undefined
				? `${timeElapsed ?? 0}s`
				: 'Run query'}
		</Button>
	)
}
