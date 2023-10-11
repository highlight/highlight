'use client'

import { trpc } from '@/app/_utils/trpc'

export const TrpcQueries = trpc.withTRPC(function TrpcQueries() {
	const helloWorld = trpc.helloWorld.useQuery({ message: 'Hello Chris' })

	return !helloWorld.data ? (
		<div>loading...</div>
	) : (
		<div
			className="trpc-buttons"
			style={{
				display: 'grid',
				gridTemplateColumns: '20rem',
				gridGap: '1rem',
				padding: '2rem',
			}}
		>
			<style
				dangerouslySetInnerHTML={{
					__html: `
					.trpc-buttons a {
						display: inline-grid;
					}			
				`,
				}}
			/>
			<p>Hello World payload: {JSON.stringify(helloWorld.data)}</p>
		</div>
	)
})
