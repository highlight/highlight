import Image from 'next/image'
import { Inter } from '@next/font/google'
import { H } from 'highlight.run'
import styles from './page.module.css'
import HelloButton from '@/components/HelloButton'

H.init('1jdkoe52', {
	debug: {
		clientInteractions: true,
		domRecording: true,
	},
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
	tracingOrigins: true,
	scriptUrl: 'http://localhost:8080/dist/index.js',
	backendUrl: 'https://localhost:8082/public',
})

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
	return (
		<main className={styles.main}>
			<div className={styles.description}>
				<p>
					Get started by editing&nbsp;
					<code className={styles.code}>src/app/page.tsx</code>
				</p>
				<div>
					<a
						href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
						By{' '}
						<Image
							src="/vercel.svg"
							alt="Vercel Logo"
							className={styles.vercelLogo}
							width={100}
							height={24}
							priority
						/>
					</a>
				</div>
			</div>

			<div className={styles.center}>
				<Image
					className={styles.logo}
					src="/next.svg"
					alt="Next.js Logo"
					width={180}
					height={37}
					priority
				/>
				<div className={styles.thirteen}>
					<Image
						src="/thirteen.svg"
						alt="13"
						width={40}
						height={31}
						priority
					/>
				</div>
			</div>

			<HelloButton />

			<div className={styles.grid}>
				<a
					href="https://beta.nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
					className={styles.card}
					target="_blank"
					rel="noopener noreferrer"
				>
					<h2 className={inter.className}>
						Docs <span>-&gt;</span>
					</h2>
					<p className={inter.className}>
						Find in-depth information about Next.js features and
						API.
					</p>
				</a>

				<a
					href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
					className={styles.card}
					target="_blank"
					rel="noopener noreferrer"
				>
					<h2 className={inter.className}>
						Templates <span>-&gt;</span>
					</h2>
					<p className={inter.className}>
						Explore the Next.js 13 playground.
					</p>
				</a>

				<a
					href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
					className={styles.card}
					target="_blank"
					rel="noopener noreferrer"
				>
					<h2 className={inter.className}>
						Deploy <span>-&gt;</span>
					</h2>
					<p className={inter.className}>
						Instantly deploy your Next.js site to a shareable URL
						with Vercel.
					</p>
				</a>
			</div>
		</main>
	)
}
