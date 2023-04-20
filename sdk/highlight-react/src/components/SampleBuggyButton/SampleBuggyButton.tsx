import React from 'react'

export const SampleBuggyButton = ({
	children,
}: React.PropsWithChildren<{}>) => {
	const [isError, setError] = React.useState(false)

	React.useEffect(() => {
		if (isError) {
			setError(false)

			throw new Error('SampleBuggyButton: Error!!!')
		}
	}, [isError])

	return (
		<button
			type="button"
			className={'buggyButton'}
			onClick={() => setError(true)}
		>
			{children ?? 'Throw an Error'}
		</button>
	)
}
