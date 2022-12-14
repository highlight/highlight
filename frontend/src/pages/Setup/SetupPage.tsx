import { LoadingOutlined } from '@ant-design/icons'
import { useAuthContext } from '@authentication/AuthContext'
import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { IntercomInlineMessage } from '@components/IntercomMessage/IntercomMessage'
import { RadioGroup } from '@components/RadioGroup/RadioGroup'
import { useGetProjectQuery } from '@graph/hooks'
import { GetProjectQuery } from '@graph/operations'
import { Admin } from '@graph/schemas'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { getInitSnippet } from '@pages/Setup/util'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { useBackendIntegrated } from '@util/integrated'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { Spin } from 'antd'
import classNames from 'classnames'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import Skeleton from 'react-loading-skeleton'
import { useHistory } from 'react-router'

import ButtonLink from '../../components/Button/ButtonLink/ButtonLink'
import Collapsible from '../../components/Collapsible/Collapsible'
import SvgSlackLogo from '../../components/icons/SlackLogo'
import LeadAlignLayout from '../../components/layout/LeadAlignLayout'
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss'
import { ReactComponent as CheckIcon } from '../../static/verify-check-icon.svg'
import { AngularSetup } from './Angular/AngularSetup'
import { CodeBlock } from './CodeBlock/CodeBlock'
import { GatsbySetup } from './Gatsby/GatsbySetup'
import { IntegrationDetector } from './IntegrationDetector/IntegrationDetector'
import styles from './SetupPage.module.scss'

interface SetupStep {
	displayName: string
	path: string
	action?: () => void
	completed: boolean | undefined
	loading: boolean
	tooltip?: string
}

enum PlatformType {
	Html = 'Other',
	React = 'React',
	Vue = 'Vue.js',
	NextJs = 'Next.js',
	SvelteKit = 'SvelteKit',
	Gatsby = 'Gatsby.js',
	Angular = 'Angular',
}

enum BackendPlatformType {
	Express = 'Express',
	NextJs = 'Next.js',
	Go = 'Go',
}

const SetupPage = ({ integrated }: { integrated: boolean }) => {
	const history = useHistory()
	const { admin } = useAuthContext()
	const { project_id, step = 'client' } = useParams<{
		project_id: string
		step: string
	}>()
	const [platform, setPlatform] = useLocalStorage(
		`selectedSetupPlatform-${project_id}`,
		PlatformType.React,
	)
	const [backendPlatform, setBackendPlatform] = useLocalStorage(
		`selectedSetupBackendPlatform-${project_id}`,
		BackendPlatformType.Express,
	)
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	const { data, loading } = useGetProjectQuery({
		variables: { id: project_id },
	})
	const [steps, setSteps] = useState<SetupStep[]>([])
	const {
		integrated: isBackendIntegrated,
		loading: isBackendIntegratedLoading,
	} = useBackendIntegrated()
	const { isSlackConnectedToWorkspace, loading: isSlackConnectedLoading } =
		useSlackBot()
	const { isLinearIntegratedWithProject, loading: isLinearConnectedLoading } =
		useLinearIntegration()

	useEffect(() => {
		const STEPS: SetupStep[] = []
		STEPS.push({
			displayName: 'Client SDK',
			path: 'client',
			action: () => {
				history.push(`/${project_id}/setup/client`)
			},
			loading: !integrated && integrated !== false,
			completed: integrated,
		})
		STEPS.push({
			displayName: 'Backend SDK (Beta)',
			path: 'backend',
			action: () => {
				history.push(`/${project_id}/setup/backend`)
			},
			loading: isBackendIntegratedLoading,
			completed: isBackendIntegrated,
		})
		STEPS.push({
			displayName: 'Features/Integrations',
			path: 'more',
			action: () => {
				history.push(`/${project_id}/setup/more`)
			},
			loading: isSlackConnectedLoading || isLinearConnectedLoading,
			completed:
				isSlackConnectedToWorkspace || isLinearIntegratedWithProject,
		})
		setSteps(STEPS)
	}, [
		history,
		integrated,
		isBackendIntegrated,
		isBackendIntegratedLoading,
		isLinearConnectedLoading,
		isLinearIntegratedWithProject,
		isSlackConnectedLoading,
		isSlackConnectedToWorkspace,
		project_id,
	])

	return (
		<>
			<Helmet>
				<title>Setup: {platform}</title>
			</Helmet>
			<LeadAlignLayout maxWidth={1000}>
				<div className={styles.flexLayout}>
					<div className={styles.leftColumn}>
						<div className={styles.fieldsBox}>
							<h3>Setup Status</h3>
							<ul className={styles.setupStepsContainer}>
								{steps.map((s) => (
									<li
										key={s.displayName}
										className={classNames(
											styles.flexLayout,
											{
												[styles.selected]:
													s.path === step,
											},
										)}
										onClick={s.action ? s.action : () => {}}
									>
										<div
											className={classNames(
												styles.checkWrapper,
												{
													[styles.checkWrapperIncomplete]:
														s.completed == false,
													[styles.checkWrapperCompleted]:
														s.completed,
												},
											)}
										>
											{s.loading ? (
												<div>
													<Spin
														indicator={
															<LoadingOutlined
																className={
																	styles.loadingIcon
																}
															/>
														}
													/>
												</div>
											) : (
												<CheckIcon
													className={classNames(
														styles.checkIcon,
													)}
												/>
											)}
										</div>{' '}
										{s.displayName}
									</li>
								))}
							</ul>
						</div>
					</div>
					<div>
						{step === 'client' && (
							<ClientSetup
								admin={admin}
								platform={platform}
								setPlatform={setPlatform}
								project_id={projectIdRemapped}
								projectData={data}
								projectLoading={loading}
								integrated={integrated}
							/>
						)}
						{step === 'backend' && (
							<BackendSetup
								admin={admin}
								backendPlatform={backendPlatform}
								setBackendPlatform={setBackendPlatform}
								projectData={data}
								projectLoading={loading}
								integrated={isBackendIntegrated}
							/>
						)}
						{step === 'more' && (
							<MoreSetup
								project_id={projectIdRemapped}
								projectData={data}
								projectLoading={loading}
								integrated={integrated}
							/>
						)}
					</div>
				</div>
			</LeadAlignLayout>
		</>
	)
}

const ClientSetup = ({
	admin,
	platform,
	setPlatform,
	project_id,
	projectData,
	projectLoading,
	integrated,
}: {
	admin: Admin | undefined
	platform: PlatformType
	setPlatform: (newValue: PlatformType) => void
	project_id: string
	projectData: GetProjectQuery | undefined
	projectLoading: boolean
	integrated: boolean
}) => {
	return (
		<>
			<div className={styles.headingWrapper}>
				<h2>Your Highlight Snippet</h2>
			</div>
			<p className={layoutStyles.subTitle}>
				Setup Highlight in your web application!
			</p>
			<RadioGroup<PlatformType>
				style={{ marginTop: 20, marginBottom: 20 }}
				selectedLabel={platform}
				labels={[
					PlatformType.React,
					PlatformType.Vue,
					PlatformType.NextJs,
					PlatformType.SvelteKit,
					PlatformType.Gatsby,
					PlatformType.Angular,
					PlatformType.Html,
				]}
				onSelect={(p: PlatformType) => setPlatform(p)}
			/>
			{!projectData?.project ||
			!projectData?.workspace ||
			projectLoading ? (
				<Skeleton
					height={75}
					count={3}
					style={{ borderRadius: 8, marginBottom: 14 }}
				/>
			) : (
				<div className={styles.stepsContainer}>
					{platform === PlatformType.Html && (
						<Section title="Is This for Me?" defaultOpen>
							<p>
								These steps apply to other types of apps and
								websites where you have access to a file like{' '}
								<code>index.html</code>.
							</p>
							<p>Some examples are:</p>
							<ul>
								<li>WordPress</li>
								<li>Webflow</li>
								<li>Shopify</li>
								<li>Squarespace</li>
							</ul>
							<p>
								If you're not sure how to integrate or have any
								questions feel free to{' '}
								<IntercomInlineMessage defaultMessage="Hi! I need help integrating Highlight.">
									message us
								</IntercomInlineMessage>
								!
							</p>
						</Section>
					)}
					{platform === PlatformType.Html ||
					platform === PlatformType.SvelteKit ? (
						<HtmlInstructions
							projectVerboseId={projectData?.project?.verbose_id}
						/>
					) : platform === PlatformType.Gatsby ? (
						<GatsbySetup
							projectVerboseId={projectData?.project?.verbose_id}
						/>
					) : platform === PlatformType.Angular ? (
						<AngularSetup
							projectVerboseId={projectData?.project?.verbose_id}
						/>
					) : (
						<JsAppInstructions
							projectVerboseId={projectData?.project?.verbose_id}
							platform={platform}
						/>
					)}
					<Section
						defaultOpen
						title={
							<span className={styles.sectionTitleWithIcon}>
								Verify Installation
								{integrated && (
									<IntegrationDetector
										verbose={false}
										integrated={integrated}
									/>
								)}
							</span>
						}
						id="highlightIntegration"
					>
						<p>
							Please follow the setup instructions above to
							install Highlight. It should take less than a minute
							for us to detect installation.
						</p>
						<div className={styles.integrationContainer}>
							<IntegrationDetector
								integrated={integrated}
								verbose={true}
							/>
							{integrated && (
								<ButtonLink
									to={`/${project_id}/sessions`}
									trackingId="ViewSessionFromSetupPage"
								>
									View Session
								</ButtonLink>
							)}
						</div>
					</Section>
					<Section title="Identifying Users">
						<p>
							To tag sessions with user specific identifiers
							(name, email, etc.), you can call the
							<code>
								{`${
									platform === PlatformType.Html
										? 'window.'
										: ''
								}H.identify()`}
							</code>{' '}
							method in your app. Here's an example:
						</p>
						<CodeBlock
							language="javascript"
							onCopy={() => {
								analytics.track(
									'Copied Code Snippet (Highlight Event)',
									{ copied: 'code snippet' },
								)
							}}
							text={`${
								platform === PlatformType.Html ? 'window.' : ''
							}H.identify('${
								admin?.email || 'eliza@gmail.com'
							}', {
  id: '8909b017-c0d9-4cc2-90ae-fb519c9e028a',
  phone: '867-5309'
});`}
						/>
					</Section>
					{platform === PlatformType.React ||
						(platform === PlatformType.NextJs && (
							<Section title="React Error Boundary">
								<p>
									Highlight's{' '}
									<code>@highlight-run/react</code> package
									includes React components to improve both
									the developer and customer experience. We
									recommend using our{' '}
									<code>{'<ErrorBoundary/>'}</code> to catch
									errors and provide an error recovery
									mechanism for your users.
								</p>
								<CodeBlock
									language="javascript"
									onCopy={() => {
										analytics.track(
											'Copied Code Snippet (Highlight Event)',
											{ copied: 'code snippet' },
										)
									}}
									text={`import { ErrorBoundary } from '@highlight-run/react';

const App = () => {
  return (
    <ErrorBoundary showDialog>
      <YourMainAppComponent />
    </ErrorBoundary>
  );
};`}
								/>
								<p>
									You can test your{' '}
									<code>{'<ErrorBoundary/>'}</code> by using
									the <code>{'<SampleBuggyButton/>'}</code>{' '}
									imported from the
									<code>@highlight-run/react</code> package.
									Adding the button to your page and clicking
									it should show you the error recovery dialog
									if configured correctly.
								</p>

								<div className={styles.integrationContainer}>
									<ButtonLink
										anchor
										href="https://docs.highlight.run/reactjs-integration"
										trackingId="SetupPageDocsReact"
									>
										Learn More about the React Package
									</ButtonLink>
								</div>
							</Section>
						))}
					<Section
						title={
							<span className={styles.sectionTitleWithIcon}>
								Read the Docs
							</span>
						}
						id="slackAlerts"
					>
						<p>
							Interested in learning how Highlight can help you
							move faster? Check out our docs!
						</p>
						<p>Some things you'll learn more about are:</p>
						<ul>
							<li>
								<a
									href="https://docs.highlight.run/comments"
									target="_blank"
									rel="noreferrer"
								>
									Collaborating with comments
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/user-feedback"
									target="_blank"
									rel="noreferrer"
								>
									Collecting user feedback with retained
									context
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/network-devtools"
									target="_blank"
									rel="noreferrer"
								>
									Debugging network requests
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/deployment-overview"
									target="_blank"
									rel="noreferrer"
								>
									On-prem
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/sourcemaps"
									target="_blank"
									rel="noreferrer"
								>
									Getting more useful error stack traces if
									you don't ship sourcemap
								</a>
							</li>
						</ul>

						<div className={styles.integrationContainer}>
							<ButtonLink
								anchor
								href="https://docs.highlight.run/"
								trackingId="SetupPageDocs"
							>
								Read the Docs
							</ButtonLink>
						</div>
					</Section>
				</div>
			)}
		</>
	)
}

const BackendSetup = ({
	backendPlatform,
	setBackendPlatform,
	projectData,
	projectLoading,
	integrated,
}: {
	admin: Admin | undefined
	backendPlatform: BackendPlatformType
	setBackendPlatform: (newValue: BackendPlatformType) => void
	projectData: GetProjectQuery | undefined
	projectLoading: boolean
	integrated: boolean
}) => {
	return (
		<>
			<div className={styles.headingWrapper}>
				<h2>Your Backend Integrations</h2>
			</div>
			<p className={layoutStyles.subTitle}>
				Setup Highlight in your backend!
			</p>
			<RadioGroup<BackendPlatformType>
				style={{ marginTop: 20, marginBottom: 20 }}
				selectedLabel={backendPlatform}
				labels={[
					BackendPlatformType.Express,
					BackendPlatformType.NextJs,
					BackendPlatformType.Go,
				]}
				onSelect={(p: BackendPlatformType) => setBackendPlatform(p)}
			/>
			{!projectData?.project ||
			!projectData?.workspace ||
			projectLoading ? (
				<Skeleton
					height={75}
					count={3}
					style={{ borderRadius: 8, marginBottom: 14 }}
				/>
			) : (
				<div className={styles.stepsContainer}>
					{backendPlatform === BackendPlatformType.NextJs ? (
						<NextBackendInstructions />
					) : backendPlatform === BackendPlatformType.Express ? (
						<ExpressBackendInstructions />
					) : (
						<GoBackendInstructions />
					)}
					<Section title="Frontend Configuration" defaultOpen>
						<p>
							Ensure that your client Highlight snippet is
							initialized with the below settings included.{' '}
						</p>
						<CodeBlock
							text={`H.init("<YOUR_PROJECT_ID>", {
    ...
    tracingOrigins: true,
    networkRecording: {
        enabled: true,
        recordHeadersAndBody: true
    },
    ...
});`}
							language="javascript"
						/>
					</Section>
					<Section
						defaultOpen
						title={
							<span className={styles.sectionTitleWithIcon}>
								Verify Backend Installation
								{integrated && (
									<IntegrationDetector
										verbose={false}
										integrated={integrated}
									/>
								)}
							</span>
						}
						id="highlightIntegration"
					>
						<p>
							Please follow the setup instructions above to
							install Highlight on your backend. It should take
							less than a minute for us to detect installation.
						</p>
						<div className={styles.integrationContainer}>
							<IntegrationDetector
								integrated={integrated}
								verbose={true}
							/>
						</div>
					</Section>
					<Section
						title={
							<span className={styles.sectionTitleWithIcon}>
								Read the Docs
							</span>
						}
						id="slackAlerts"
					>
						<p>
							Interested in learning how Highlight can help you
							move faster? Check out our docs!
						</p>
						<p>Some things you'll learn more about are:</p>
						<ul>
							<li>
								<a
									href="https://docs.highlight.run/comments"
									target="_blank"
									rel="noreferrer"
								>
									Collaborating with comments
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/user-feedback"
									target="_blank"
									rel="noreferrer"
								>
									Collecting user feedback with retained
									context
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/network-devtools"
									target="_blank"
									rel="noreferrer"
								>
									Debugging network requests
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/deployment-overview"
									target="_blank"
									rel="noreferrer"
								>
									On-prem
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/sourcemaps"
									target="_blank"
									rel="noreferrer"
								>
									Getting more useful error stack traces if
									you don't ship sourcemap
								</a>
							</li>
						</ul>

						<div className={styles.integrationContainer}>
							<ButtonLink
								anchor
								href="https://docs.highlight.run/"
								trackingId="SetupPageDocs"
							>
								Read the Docs
							</ButtonLink>
						</div>
					</Section>
				</div>
			)}
		</>
	)
}

const MoreSetup = ({
	project_id,
	projectData,
	projectLoading,
	integrated,
}: {
	project_id: string
	projectData: GetProjectQuery | undefined
	projectLoading: boolean
	integrated: boolean
}) => {
	return (
		<>
			<div className={styles.headingWrapper}>
				<h2>Your Highlight Tools</h2>
			</div>
			<p className={layoutStyles.subTitle}>
				More superpowers from Highlight!
			</p>
			{!projectData?.project ||
			!projectData?.workspace ||
			projectLoading ? (
				<Skeleton
					height={75}
					count={3}
					style={{ borderRadius: 8, marginBottom: 14 }}
				/>
			) : (
				<div className={styles.stepsContainer}>
					<Section
						title={
							<span className={styles.sectionTitleWithIcon}>
								Enable Slack Alerts
								{projectData.workspace.slack_webhook_channel ? (
									<IntegrationDetector
										verbose={false}
										integrated={integrated}
									/>
								) : (
									<SvgSlackLogo height="15" width="15" />
								)}
							</span>
						}
						id="slackAlerts"
						defaultOpen
					>
						<p>
							Get notified of different events happening in your
							application like:
						</p>
						<ul>
							<li>Errors thrown</li>
							<li>New users</li>
							<li>A new feature is used</li>
							<li>User submitting feedback</li>
						</ul>
						<div className={styles.integrationContainer}>
							<ButtonLink
								to={`/${project_id}/alerts`}
								trackingId="ConfigureAlertsFromSetupPage"
							>
								Configure Your Alerts
							</ButtonLink>
						</div>
					</Section>
					<Section
						title={
							<span className={styles.sectionTitleWithIcon}>
								Integrations
							</span>
						}
						id="integrations"
						defaultOpen
					>
						<p>
							Supercharge your workflows and attach Highlight with
							the tools you use everyday such as:
						</p>
						<ul>
							<li>Slack</li>
							<li>Linear</li>
						</ul>
						<div className={styles.integrationContainer}>
							<ButtonLink
								to={`/${project_id}/integrations`}
								trackingId="ConfigureIntegrationsFromSetupPage"
							>
								Enable Integrations
							</ButtonLink>
						</div>
					</Section>
					<Section
						title={
							<span className={styles.sectionTitleWithIcon}>
								Proxying Highlight
							</span>
						}
						id="proxying"
						defaultOpen
					>
						<p>
							If you're not seeing sessions or errors on
							Highlight, chances are that requests to Highlight
							are being blocked. This can happen for different
							reasons such as a third-party browser extensions,
							browser configuration, or VPN settings.
						</p>
						<p>
							One way we can avoid this is by setting up proxy
							from your domain to Highlight. To do this, you will
							need access to your domain's DNS settings.
						</p>
						<div className={styles.integrationContainer}>
							<ButtonLink
								href="https://docs.highlight.run/proxying-highlight"
								trackingId="ProxyDocsFromSetupPage"
								anchor
							>
								Set Up Proxy
							</ButtonLink>
						</div>
					</Section>
					<Section
						title={
							<span className={styles.sectionTitleWithIcon}>
								Read the Docs
							</span>
						}
						id="docs"
						defaultOpen
					>
						<p>
							Interested in learning how Highlight can help you
							move faster? Check out our docs!
						</p>
						<p>Some things you'll learn more about are:</p>
						<ul>
							<li>
								<a
									href="https://docs.highlight.run/comments"
									target="_blank"
									rel="noreferrer"
								>
									Collaborating with comments
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/user-feedback"
									target="_blank"
									rel="noreferrer"
								>
									Collecting user feedback with retained
									context
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/network-devtools"
									target="_blank"
									rel="noreferrer"
								>
									Debugging network requests
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/deployment-overview"
									target="_blank"
									rel="noreferrer"
								>
									On-prem
								</a>
							</li>
							<li>
								<a
									href="https://docs.highlight.run/sourcemaps"
									target="_blank"
									rel="noreferrer"
								>
									Getting more useful error stack traces if
									you don't ship sourcemap
								</a>
							</li>
						</ul>

						<div className={styles.integrationContainer}>
							<ButtonLink
								anchor
								href="https://docs.highlight.run/"
								trackingId="SetupPageDocs"
							>
								Read the Docs
							</ButtonLink>
						</div>
					</Section>
				</div>
			)}
		</>
	)
}

const HtmlInstructions = ({
	projectVerboseId,
}: {
	projectVerboseId: string
}) => {
	return (
		<Section title="Installing the SDK" defaultOpen>
			<p>
				Copy and paste the <code>{'<script>'}</code> below into the
				<code>{'<head>'}</code> of every page you wish to record.
			</p>
			<div>
				<CodeBlock
					language="html"
					onCopy={() => {
						analytics.track('Copied Script (Highlight Event)', {
							copied: 'script',
						})
					}}
					text={`<script src="https://cdn.jsdelivr.net/npm/highlight.run@latest"></script>
<script>window.H.init('${projectVerboseId}'${
						isOnPrem
							? ', {backendUrl: "' + GetBaseURL() + '/public"}'
							: ''
					})</script>`}
				/>
			</div>
		</Section>
	)
}

const NextBackendInstructions = () => {
	return (
		<>
			<Section title="Vercel Integration" defaultOpen>
				<p>
					If your app runs on Vercel, you can{' '}
					<a href="https://vercel.com/integrations/highlight/new">
						install the Highlight integration
					</a>{' '}
					to automatically update your environment variables with API
					keys for source map uploading.
				</p>
			</Section>
			<Section title="Installing the SDK" defaultOpen>
				<p>
					Install the
					<code>@highlight-run/next</code> package.
				</p>
				<CodeBlock
					text="npm install @highlight-run/next"
					language="shell"
				/>
				<p>or with Yarn:</p>
				<CodeBlock
					text="yarn add @highlight-run/next"
					language="shell"
				/>
			</Section>
			<Section title="Wrapping your Next Config" defaultOpen>
				<p>
					In <code>next.config.js</code>, use{' '}
					<code>withHighlightConfig</code> to wrap your config. This
					will automatically configure source map uploading and
					proxying for Highlight requests.
				</p>
				<p>
					<CodeBlock
						language="javascript"
						text={`import { withHighlightConfig } from "@highlight-run/next";

export default withHighlightConfig({
	// your next.config.js options here
})`}
					/>
				</p>
			</Section>
			<Section title="Initializing Highlight on the Backend" defaultOpen>
				<p>Initialize the SDK by importing Highlight like so: </p>
				<CodeBlock
					text={`import { Highlight } from '@highlight-run/next';`}
					language="javascript"
				/>
				<p>
					and then defining it in a common file. You can configure how
					Highlight records with the{' '}
					<a
						href="https://docs.highlight.run/api#w0-highlightoptions"
						target="_blank"
						rel="noreferrer"
					>
						options
					</a>
					.
				</p>
				<p>
					<CodeBlock
						language="javascript"
						text={`const highlightOptions = {};
export const withHighlight = Highlight(highlightOptions);`}
					/>
				</p>
				<p>
					Wrap each of your route handlers in <code>/api/</code> using
					<code>withHighlight</code>
				</p>
				<p>
					<CodeBlock
						language="javascript"
						text={`import { withHighlight } from "./common";

const handler = async (req, res) => {
  res.status(200).json({ name: "Jay" });
};

export default withHighlight(handler);`}
					/>
				</p>
			</Section>
		</>
	)
}

const ExpressBackendInstructions = () => {
	return (
		<>
			<Section title="Installing the SDK" defaultOpen>
				<p>
					Install the
					<code>@highlight-run/node</code> package.
				</p>
				<CodeBlock
					text="npm install @highlight-run/node"
					language="shell"
				/>
				<p>or with Yarn:</p>
				<CodeBlock
					text="yarn add @highlight-run/node"
					language="shell"
				/>
			</Section>
			<Section title="Initializing Highlight on the Backend" defaultOpen>
				<p>Initialize the SDK by importing Highlight like so: </p>
				<CodeBlock
					text={`import { Highlight } from '@highlight-run/node';`}
					language="javascript"
				/>
				<p>
					and then calling as soon as you can in your site's startup
					process. You can configure how Highlight records with the{' '}
					<a
						href="https://docs.highlight.run/api#w0-highlightoptions"
						target="_blank"
						rel="noreferrer"
					>
						options
					</a>
					.
				</p>
				<p>
					<CodeBlock
						language="javascript"
						text={`const highlightOptions = {};
const highlightHandler = Highlight.Handlers.errorHandler(highlightOptions);
`}
					/>
				</p>
				<p>
					<CodeBlock
						language="javascript"
						text={`import { Highlight } from "@highlight-run/node";

const app = express();

const highlightOptions = {};
const highlightHandler = Highlight.Handlers.errorHandler(highlightOptions);

// This should be before any other error middleware and after all controllers
app.use(highlightHandler);`}
					/>
				</p>
			</Section>
		</>
	)
}

const GoBackendInstructions = () => {
	return (
		<>
			<Section title="Installing the SDK" defaultOpen>
				<p>
					Install the
					<code>highlight-go</code> package.
				</p>
				<CodeBlock
					text="go get -u github.com/highlight-run/highlight-go"
					language="shell"
				/>
			</Section>
			<Section title="Initializing Highlight on the Backend" defaultOpen>
				<p>
					Add the following lines to your application's main{' '}
					<code>(func main)</code> function:
				</p>
				<CodeBlock
					text={`import (
    "github.com/highlight-run/highlight-go"
)

func main() {
    //...application logic...
    highlight.Start()
    defer highlight.Stop()
    //...application logic...
}
                    `}
					language="go"
				/>
				<p>
					and then using a Highlight middleware in your app's router:
				</p>
				<p>
					If you're using <code>go-chi/chi</code>:
				</p>
				<p>
					<CodeBlock
						language="go"
						text={`import (
    highlightChi "github.com/highlight-run/highlight-go/middleware/chi"
)

func main() {
    //...
    r := chi.NewRouter()
    r.Use(highlightChi.Middleware)
    //...
}`}
					/>
				</p>
				<p>
					If you're using <code>gin-gonic/gin</code>:
				</p>
				<p>
					<CodeBlock
						language="go"
						text={`import (
    highlightGin "github.com/highlight-run/highlight-go/middleware/gin"
)

func main() {
    //...
    r := gin.Default()
    r.Use(highlightGin.Middleware())
    //...
}`}
					/>
				</p>
				<p>
					You'll need to instrument your endpoint handlers to specify
					how you want to track errors or other events.
					<div className={styles.integrationContainer}>
						<ButtonLink
							anchor
							href="https://docs.highlight.run/go-backend"
							trackingId="SetupPageBackend"
						>
							See an Example
						</ButtonLink>
					</div>
				</p>
			</Section>
		</>
	)
}

const JsAppInstructions = ({
	platform,
	projectVerboseId,
}: {
	platform: PlatformType
	projectVerboseId: string
}) => {
	return (
		<>
			<Section title="Installing the SDK" defaultOpen>
				{platform === PlatformType.React ||
				platform === PlatformType.NextJs ? (
					<>
						<p>
							Install the <code>highlight.run</code> and{' '}
							<code>@highlight-run/react</code> packages.
						</p>
						<CodeBlock
							text="npm install highlight.run @highlight-run/react"
							language="shell"
						/>
						<p>or with Yarn:</p>
						<CodeBlock
							text="yarn add highlight.run @highlight-run/react"
							language="shell"
						/>
					</>
				) : (
					<>
						<p>
							Install the <code>highlight.run</code> package.
						</p>
						<CodeBlock
							text="npm install highlight.run"
							language="shell"
						/>
						<p>or with Yarn:</p>
						<CodeBlock
							text="yarn add highlight.run"
							language="shell"
						/>
					</>
				)}
			</Section>
			<Section title="Initializing Highlight" defaultOpen>
				<p>Initialize the SDK by importing Highlight like so: </p>
				<CodeBlock
					text={`import { H } from 'highlight.run';`}
					language="javascript"
				/>
				<p>
					and then calling{' '}
					<code>{getInitSnippet(projectVerboseId)}</code> as soon as
					you can in your site's startup process. You can configure
					how Highlight records with the{' '}
					<a
						href="https://docs.highlight.run/api#w0-highlightoptions"
						target="_blank"
						rel="noreferrer"
					>
						options
					</a>
					.
				</p>
				<p>
					{platform !== PlatformType.NextJs ? (
						<CodeBlock
							language="javascript"
							text={`${getInitSnippet(projectVerboseId, true)}`}
						/>
					) : (
						<CodeBlock
							language="javascript"
							text={`${getInitSnippet(
								projectVerboseId,
							)} // ${projectVerboseId} is your PROJECT_ID`}
						/>
					)}
				</p>
				<p>
					In{' '}
					{platform === PlatformType.React
						? 'React'
						: platform === PlatformType.Vue
						? 'Vue'
						: 'Next.js'}
					, it can be called at the top of your main component's file
					like this:
				</p>
				{platform === PlatformType.React ? (
					<CodeBlock
						language="javascript"
						text={`import React from 'react';
import App from './App';
import { H } from 'highlight.run';
import { ErrorBoundary } from '@highlight-run/react';

${getInitSnippet(projectVerboseId)}

ReactDOM.render(
  <ErrorBoundary showDialog>
    <App />
  </ErrorBoundary>,
  document.getElementById('root')
);`}
					/>
				) : platform === PlatformType.Vue ? (
					<CodeBlock
						language="javascript"
						text={`import { createApp } from 'vue';
import App from './App.vue';
import { H } from 'highlight.run';

${getInitSnippet(projectVerboseId, true)}

createApp(App).mount('#app');`}
					/>
				) : (
					<CodeBlock
						language="javascript"
						text={`import { H } from 'highlight.run';

${getInitSnippet(projectVerboseId)}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp`}
					/>
				)}
			</Section>
		</>
	)
}

type SectionProps = {
	title: string | React.ReactNode
	id?: string
	defaultOpen?: boolean
}

export const Section: FunctionComponent<
	React.PropsWithChildren<SectionProps>
> = ({ children, id, title, defaultOpen }) => {
	return (
		<Collapsible title={title} id={id} defaultOpen={defaultOpen}>
			{children}
		</Collapsible>
	)
}

export default SetupPage
