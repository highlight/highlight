import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

import { AiOutlineDown } from 'react-icons/ai'
import GoImage from '../../../public/images/language/GoIcon'
import htmlImage from '../../../public/images/language/htmlIcon'
import htmlImageDarkPurple from '../../../public/images/language/htmlIconDarkPurple'
import NextjsImage from '../../../public/images/language/NextjsIcon'
import NodeImage from '../../../public/images/language/NodeIcon'
import ReactImage from '../../../public/images/language/ReactIcon'
import VueImage from '../../../public/images/language/VueIcon'
import { PrimaryLink } from '../../common/Buttons/SecondaryButton'
import { Section } from '../../common/Section/Section'
import { Typography } from '../../common/Typography/Typography'

import styles from '../../Home/Home.module.scss'
import productStyles from '../../Products/Products.module.scss'
import { CodeSnippet } from '../CodeSnippet/CodeSnippet'

export interface SnippetTabObject {
	image: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
	key: string
	content: JSX.Element
	beta?: boolean
}

const SetupDescription = (
	<div className={classNames(styles.sectionText, styles.codeSection)}>
		<div className="flex justify-center min-[1000px]:justify-start">
			<div className={productStyles.highlightedBadge}>
				<Typography type="copy4" emphasis>
					Effortless Setup
				</Typography>
			</div>
		</div>
		<h2>
			Use Highlight{' '}
			<span className={styles.highlightedText}>within minutes</span>
		</h2>
		<Typography type="copy2" onDark>
			{`Installing Highlight is a matter of selecting your frontend framework and adding three lines of code to your app. Highlight is built to be framework agnostic, so regardless of your stack, we have a solution that'll work for your team. You'll be off to the races in a matter of minutes!`}
		</Typography>
		<div className={styles.buttonContainer}>
			<PrimaryLink href="/docs/getting-started">
				Read more about our backend integrations in beta
			</PrimaryLink>
		</div>
	</div>
)

const SNIPPET_TABS = [
	{
		image: ReactImage,
		key: 'react',
		content: (
			<Section noYTopPadding={true} grid>
				<div className={styles.gridSectionImageLeft}>
					<CodeSnippet
						HeaderImage={ReactImage}
						canCopy={true}
						language="jsx"
						content={`import React from 'react';
import App from './App';
import { H } from 'highlight.run';
import { ErrorBoundary } from '@highlight-run/react';

H.init('your-api-key');

ReactDOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById('root')
);`}
					/>
				</div>
				{SetupDescription}
			</Section>
		),
	},
	{
		image: VueImage,
		key: 'vue',
		content: (
			<Section noYTopPadding={true} grid>
				<div className={styles.gridSectionImageLeft}>
					<CodeSnippet
						HeaderImage={VueImage}
						canCopy={true}
						language="javascript"
						content={`import { createApp } from 'vue';
import App from './App.vue';
import { H } from 'highlight.run';

H.init('your-api-key', {
  environment: 'production',
  privacySetting: 'default',
});

createApp(App).mount('#app');`}
					/>
				</div>
				{SetupDescription}
			</Section>
		),
	},
	{
		image: NextjsImage,
		key: 'nextjs',
		content: (
			<Section noYTopPadding={true} grid>
				<div className={styles.gridSectionImageLeft}>
					<CodeSnippet
						HeaderImage={NextjsImage}
						canCopy={true}
						language="javascript"
						content={`import { H } from 'highlight.run';

H.init('your-api-key');

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp`}
					/>
				</div>
				{SetupDescription}
			</Section>
		),
	},
	{
		image: htmlImage,
		key: 'html',
		content: (
			<Section noYTopPadding={true} grid>
				<div className={styles.gridSectionImageLeft}>
					<CodeSnippet
						HeaderImage={htmlImageDarkPurple}
						canCopy={true}
						language="html"
						content={`<html>
    <head>
        <script src="https://cdn.jsdelivr.net/npm/highlight.run@latest"></script>
        <script>
            window.H.init("your-api-key")
        </script>
    </head>
    <body>
        <!-- Your Application -->
    </body>
</html>`}
					/>
				</div>
				{SetupDescription}
			</Section>
		),
	},
	{
		image: GoImage,
		key: 'go',
		beta: true,
		content: (
			<Section noYTopPadding={true} grid>
				<div className={styles.gridSectionImageLeft}>
					<CodeSnippet
						HeaderImage={GoImage}
						canCopy={true}
						language="go"
						content={`import (
  "github.com/highlight/highlight/sdk/highlight-go"
  highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
)

func main() {
  //...
  highlight.Start()
  defer highlight.Stop()
  //...
  r := chi.NewRouter()
  r.Use(highlightChi.Middleware)
}`}
					/>
				</div>
				{SetupDescription}
			</Section>
		),
	},
	{
		image: NodeImage,
		key: 'node',
		beta: true,
		content: (
			<Section noYTopPadding={true} grid>
				<div className={styles.gridSectionImageLeft}>
					<CodeSnippet
						HeaderImage={NodeImage}
						canCopy={true}
						language="javascript"
						content={`import { Handlers } from '@highlight-run/node';

const app = express();

const highlightOptions = {projectID: '<YOUR_PROJECT_ID>'};
const highlightMiddleware = Handlers.middleware(highlightOptions);
const highlightHandler = Handlers.errorHandler(highlightOptions);

// This should be before any other error middleware and after all controllers
app.use(highlightMiddleware);
// This should be before any other error middleware and after all controllers
app.use(highlightHandler);`}
					/>
				</div>
				{SetupDescription}
			</Section>
		),
	},
]

export const SnippetTab = () => {
	const tabs = SNIPPET_TABS
	const [currentTabKey, setCurrentTabKey] = useState(tabs[0]?.key)
	const [currentHoverKey, setCurrentHoverKey] = useState<String>('')
	const [currentTabElement, setCurrentTabElement] = useState(tabs[0])
	const [showDropdown, setShowDropdown] = useState(false)

	useEffect(() => {
		setCurrentTabElement(
			tabs.find((tab) => tab.key === currentTabKey) || tabs[0],
		)
	}, [currentTabKey, setCurrentTabElement, tabs])

	return (
		<div>
			<div
				className={classNames(
					styles.snippetTabs,
					styles.secondaryBackground,
				)}
			>
				{tabs.map((tab) => (
					<div
						key={tab.key}
						className={classNames(styles.snippetTab, {
							[styles.tabSelected]: tab.key === currentTabKey,
						})}
						onClick={() => setCurrentTabKey(tab.key)}
						onMouseEnter={() => setCurrentHoverKey(tab.key)}
						onMouseLeave={() => setCurrentHoverKey('')}
					>
						{tab.beta && (
							<div className={styles.snippetBeta}>
								<Typography type="outline">in beta</Typography>
							</div>
						)}
						<tab.image
							color={
								tab.key === currentTabKey
									? '#EBFF5E'
									: tab.key === currentHoverKey
										? '#23B6E2'
										: '#72E4FC'
							}
							// @ts-ignore
							secondaryColor={
								tab.key === currentTabKey
									? '#0d0225'
									: undefined
							}
						/>
					</div>
				))}
			</div>
			<Section noYBottomPadding={true}>
				<div className={styles.snippetDropdownContainer}>
					<div
						className={styles.snippetDropdown}
						onClick={() => setShowDropdown(!showDropdown)}
					>
						<div className={styles.snippetDropdownValue}>
							<currentTabElement.image
								color={'#72E4FC'}
								// @ts-ignore
								secondaryColor={'#0d0225'}
							/>
						</div>
						<AiOutlineDown />
					</div>
					{showDropdown && (
						<div className={styles.snippetDropdownList}>
							{tabs.map((tab) => (
								<div
									key={tab.key}
									onClick={() => {
										setShowDropdown(false)
										setCurrentTabKey(tab.key)
									}}
								>
									<tab.image
										color={'#72E4FC'}
										// @ts-ignore
										secondaryColor={'#0d0225'}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			</Section>
			<div className={styles.snippetContent}>
				{tabs.map((tab) =>
					tab.key === currentTabKey ? (
						<div key={tab.key}>{tab.content}</div>
					) : (
						<div key={tab.key}></div>
					),
				)}
			</div>
		</div>
	)
}
