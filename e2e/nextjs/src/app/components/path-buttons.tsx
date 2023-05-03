'use client'

import { Button } from '@/app/components/button'
import { ErrorBoundary } from '@/app/components/error-boundary'

export function PathButtons() {
	return (
		<div
			className="path-buttons"
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
					.path-buttons a {
						display: inline-grid;
					}			
				`,
				}}
			/>
			<ErrorBoundary>
				<a href="/isr/success">
					<Button>Standard ISR: Success</Button>
				</a>
				<hr />
				<a href="/isr/error">
					<Button>Standard ISR: Error</Button>
				</a>
				<hr />

				<a href="/app-directory/isr/success">
					<Button>App Directory: Success</Button>
				</a>
				<hr />
				<a href="/app-directory/isr/error">
					<Button>App Directory: Error</Button>
				</a>
			</ErrorBoundary>
		</div>
	)
}
