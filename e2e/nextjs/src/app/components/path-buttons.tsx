'use client'

import { Button } from '@/app/components/button'
import { ErrorBoundary } from '@/app/components/error-boundary'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function PathButtons() {
	const router = useRouter()
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
				<Link href="/ssr">
					<Button>Standard ISR: Success</Button>
				</Link>
				<hr />
				<Link href="/ssr?error=true">
					<Button>Standard ISR: Error</Button>
				</Link>
				<hr />
				<Link href="/app-router/ssr">
					<Button>App Router: Success</Button>
				</Link>
				<hr />
				<Link href="/app-router/ssr?error=true">
					<Button>App Router: Error</Button>
				</Link>
				<hr />
				<Link href="/redirect?shouldRedirect=true">
					<Button>Redirect (link)</Button>
				</Link>
				<Link href="/app-router/redirect?shouldRedirect=true">
					<Button>App Router: Redirect (link)</Button>
				</Link>
				<Button
					onClick={() => {
						router.push(`/redirect`)
					}}
				>
					Redirect (redirect)
				</Button>
				<hr />
			</ErrorBoundary>
		</div>
	)
}
