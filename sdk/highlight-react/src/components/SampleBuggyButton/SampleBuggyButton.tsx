import React from 'react'

export const SampleBuggyButton = ({
	children,
}: React.PropsWithChildren<{}>) => {
	const [isError, setError] = React.useState(false)
	if (isError) {
		throw new Error('something bad happened - this is a sample test error')
	}
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
