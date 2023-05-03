'use client'

import { Button } from '@/app/components/button'
import { ErrorBoundary } from '@/app/components/error-boundary'
import Link from 'next/link'

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
				<Link href="/isr">
					<Button>Standard ISR: Success</Button>
				</Link>
				<hr />
				<Link href="/isr?error=true">
					<Button>Standard ISR: Error</Button>
				</Link>
				<hr />

				<Link href="/app-directory/isr">
					<Button>App Directory: Success</Button>
				</Link>
				<hr />
				<Link href="/app-directory/isr?error=true">
					<Button>App Directory: Error</Button>
				</Link>
			</ErrorBoundary>
		</div>
	)
}
