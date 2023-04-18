import './globals.css'

export const metadata = {
	title: 'Highlight Next Demo',
	description: 'Check out how Highligt works with Next.js',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
