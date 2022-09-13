import { getInitSnippet } from '@pages/Setup/util'
import React from 'react'

import { CodeBlock } from '../CodeBlock/CodeBlock'
import { Section } from '../SetupPage'

interface Props {
	projectVerboseId: string
}

export const AngularSetup = ({ projectVerboseId }: Props) => {
	return (
		<>
			<Section title="Installing the SDK">
				<p>Install the Highlight package.</p>
				<CodeBlock text="npm install highlight.run" language="shell" />
				<p>or with Yarn:</p>
				<CodeBlock text="yarn add highlight.run" language="shell" />
				<p>or with pnpm:</p>
				<CodeBlock text="pnpm add highlight.run" language="shell" />
			</Section>

			<Section title="Initializing Highlight" defaultOpen>
				<p>
					In your Angular entrypoint (likely your{' '}
					<code>src/main.ts</code> file), initialize the SDK by
					importing Highlight:{' '}
				</p>
				<CodeBlock
					text={`import { H } from 'highlight.run';`}
					language="javascript"
				/>
				<p>
					and then calling{' '}
					<code>{getInitSnippet(projectVerboseId)}</code> You can
					further configure how Highlight records with the init{' '}
					<a
						href="https://docs.highlight.run/api#w0-highlightoptions"
						target="_blank"
						rel="noreferrer"
					>
						options
					</a>
					, like this:
				</p>
				<p>
					<CodeBlock
						language="javascript"
						text={`${getInitSnippet(projectVerboseId, true)}`}
					/>
				</p>
			</Section>
		</>
	)
}
