import React from 'react'

import { CodeBlock } from '../CodeBlock/CodeBlock'
import { Section } from '../SetupPage'

interface Props {
	projectVerboseId: string
}

export const GatsbySetup = ({ projectVerboseId }: Props) => {
	return (
		<>
			<Section title="Installing the SDK">
				<p>Install the Highlight Gatsby plugin.</p>
				<CodeBlock
					text="npm install @highlight-run/gatsby-plugin-highlight"
					language="shell"
				/>
				<p>or with Yarn:</p>
				<CodeBlock
					text="yarn add @highlight-run/gatsby-plugin-highlight"
					language="shell"
				/>
				<p>or with pnpm:</p>
				<CodeBlock
					text="pnpm add @highlight-run/gatsby-plugin-highlight"
					language="shell"
				/>
			</Section>

			<Section title="Initializing Highlight">
				<p>
					Register Highlight as a Gatsby plugin in your application.
					In <code>gatsby-config.js</code>:
				</p>
				<CodeBlock
					language="javascript"
					text={`module.exports = {
  plugins: [
    {
      resolve: "@highlight-run/gatsby-plugin-highlight",
      options: {
        orgID: "${projectVerboseId}",
        enableStrictPrivacy: false,
      }
    },
  ]
}`}
				/>
				<p>
					You can{' '}
					<a
						href="https://github.com/highlight-run/example-gatsby"
						target="_blank"
						rel="noreferrer"
					>
						Gatsby example application here
					</a>
					.
				</p>
			</Section>
		</>
	)
}
