'use client'

import { trpc } from '@/app/_utils/trpc'
import { Button } from '@/app/components/button'

export const TrpcQueries = trpc.withTRPC(function TrpcQueries() {
	const helloWorld = trpc.helloWorld.useQuery({ message: 'Hello Chris' })
	const throwError = trpc.throwError.useMutation()

	return (
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
			{!helloWorld.data ? (
				<p>Hello World payload: {JSON.stringify(helloWorld.data)}</p>
			) : (
				<div>loading...</div>
			)}

			<Button
				onClick={() => {
					throwError.mutateAsync()
				}}
			>
				Throw tRPC Mutation Error
			</Button>
		</div>
	)
})
