import { LoadingOutlined } from '@ant-design/icons'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { RadioGroup } from '@components/RadioGroup/RadioGroup'
import { useGetProjectQuery } from '@graph/hooks'
import { GetProjectQuery } from '@graph/operations'
import { Box, Text } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { useBackendIntegrated } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import { message, Spin } from 'antd'
import clsx from 'clsx'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import Skeleton from 'react-loading-skeleton'
import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router'

import ButtonLink from '../../components/Button/ButtonLink/ButtonLink'
import Collapsible from '../../components/Collapsible/Collapsible'
import SvgSlackLogo from '../../components/icons/SlackLogo'
import LeadAlignLayout from '../../components/layout/LeadAlignLayout'
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss'
import { ReactComponent as CheckIcon } from '../../static/verify-check-icon.svg'
import { CodeBlock } from './CodeBlock/CodeBlock'
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

// The keys of these *_OPTIONS variables must match what we get back from the
// quickstart endpoint in the docs.
const PLATFORM_OPTIONS = {
	client: 'Client',
	server: 'Server',
	other: 'Other',
} as const

const CLIENT_FRAMEWORK_OPTIONS = {
	angular: 'Angular',
	react: 'React',
	next: 'Next',
	vue: 'Vue',
	gatsby: 'Gatsby',
	other: 'Other',
}

const OTHER_OPTIONS = {
	'self-host': 'Self Host',
	'dev-deploy': 'Dev Deploy',
}

const BACKEND_LANGUAGE_OPTIONS = {
	python: 'Python',
	go: 'Go',
	js: 'JavaScript',
} as const

const BACKEND_FRAMEWORK_OPTIONS = {
	flask: 'Flask',
	django: 'Django',
	fastapi: 'FastAPI',
	other: 'Other',
	'aws-lambda': 'AWS Lambda',
	'azure-functions': 'Azure Functions',
	'google-cloud-functions': 'Google Cloud Functions',
	gqlgen: 'GQLGen',
	fiber: 'Fiber',
	chi: 'Chi',
	mux: 'Mux',
	gin: 'Gin',
	apollo: 'Apollo',
	cloudflare: 'Cloudflare',
	express: 'Express',
	firebase: 'Firebase',
	nodejs: 'Node.js',
	trpc: 'tRPC',
} as const

type ClientFrameworkKey = keyof typeof CLIENT_FRAMEWORK_OPTIONS
type ClientFrameworkLabel = typeof CLIENT_FRAMEWORK_OPTIONS[ClientFrameworkKey]
type BackendLanguageKey = keyof typeof BACKEND_LANGUAGE_OPTIONS
type BackendLanguageLabel = typeof BACKEND_LANGUAGE_OPTIONS[BackendLanguageKey]
type BackendFrameworkKey = keyof typeof BACKEND_FRAMEWORK_OPTIONS
type BackendFrameworkLabel =
	typeof BACKEND_FRAMEWORK_OPTIONS[BackendFrameworkKey]

type Guide = {
	subtitle: string
	entries: Array<{
		title: string
		content: string
		code?: {
			text: string
			language: string
		}
	}>
}

type Guides = {
	client: {
		[key: string]: Guide
	}
	server: {
		[key: string]: {
			[key: string]: Guide
		}
	}
	other: {
		[key: string]: Guide
	}
}

const SetupPage = ({ integrated }: { integrated: boolean }) => {
	const navigate = useNavigate()
	const { project_id, step = 'client' } = useParams<{
		project_id: string
		step: string
	}>()
	const { data } = useGetProjectQuery({
		variables: { id: project_id! },
		skip: !project_id,
	})

	const { projectId } = useProjectId()
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
				navigate(`/${project_id}/setup/client`)
			},
			loading: !integrated && integrated !== false,
			completed: integrated,
		})
		STEPS.push({
			displayName: 'Backend SDK',
			path: 'backend',
			action: () => {
				navigate(`/${project_id}/setup/backend`)
			},
			loading: isBackendIntegratedLoading,
			completed: isBackendIntegrated,
		})
		STEPS.push({
			displayName: 'Features/Integrations',
			path: 'more',
			action: () => {
				navigate(`/${project_id}/setup/more`)
			},
			loading: isSlackConnectedLoading || isLinearConnectedLoading,
			completed:
				isSlackConnectedToWorkspace || isLinearIntegratedWithProject,
		})
		setSteps(STEPS)
	}, [
		integrated,
		isBackendIntegrated,
		isBackendIntegratedLoading,
		isLinearConnectedLoading,
		isLinearIntegratedWithProject,
		isSlackConnectedLoading,
		isSlackConnectedToWorkspace,
		navigate,
		project_id,
	])

	const [docs, setDocs] = useState<Guides>()
	const [docsLoading, setDocsLoading] = useState<boolean>(true)

	useEffect(() => {
		// fetch(`https://www.highlight.io/api/quickstart`)
		fetch(`http://localhost:3001/api/quickstart`)
			.then((res) => res.json())
			.then(setDocs)
			.catch(() => {
				message.error('Error loading docs...')
			})
			.finally(() => {
				setDocsLoading(false)
			})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (docsLoading) {
		// TODO: Loading state
		return <Box>Loading...</Box>
	}

	if (import.meta.env.DEV) {
		verifyDocsMapping(docs)
	}

	return (
		<>
			<LeadAlignLayout maxWidth={1000}>
				<div className={styles.flexLayout}>
					<div className={styles.leftColumn}>
						<div className={styles.fieldsBox}>
							<h3>Setup Status</h3>
							<ul className={styles.setupStepsContainer}>
								{steps.map((s) => (
									<li
										key={s.displayName}
										className={clsx(styles.flexLayout, {
											[styles.selected]: s.path === step,
										})}
										onClick={s.action ? s.action : () => {}}
									>
										<div
											className={clsx(
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
													className={clsx(
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
						{!data?.project || !data?.workspace || !docs ? (
							<Skeleton
								height={75}
								count={3}
								style={{ borderRadius: 8, marginBottom: 14 }}
							/>
						) : (
							<>
								{step === 'client' && (
									<ClientSetup
										project_id={projectId!}
										integrated={integrated}
										docs={docs.client}
									/>
								)}
								{step === 'backend' && (
									<BackendSetup
										projectData={data}
										integrated={isBackendIntegrated}
										docs={docs.server}
									/>
								)}
								{step === 'more' && (
									<MoreSetup
										project_id={projectId!}
										projectData={data}
										integrated={integrated}
										// docs={docs.other}
									/>
								)}
							</>
						)}
					</div>
				</div>
			</LeadAlignLayout>
		</>
	)
}

const ClientSetup = ({
	project_id,
	integrated,
	docs,
}: {
	project_id: string
	integrated: boolean
	docs: Guides['client']
}) => {
	// TODO: Rename from platform to framework
	const [framework, setFramework] = useLocalStorage<ClientFrameworkKey>(
		`selectedSetupClientFramework-${project_id}`,
		Object.keys(docs)[0] as ClientFrameworkKey,
	)
	const guide = docs[framework.split('.')[0].toLowerCase()]
	const frameworkKeys = Object.keys(docs) as ClientFrameworkKey[]

	return (
		<>
			<Helmet>
				<title>Setup: {framework}</title>
			</Helmet>

			<div className={styles.headingWrapper}>
				<h2>Your Highlight Snippet</h2>
			</div>
			<p className={layoutStyles.subTitle}>
				Setup Highlight in your web application!
			</p>

			<RadioGroup<ClientFrameworkLabel>
				style={{ marginTop: 20, marginBottom: 20 }}
				selectedLabel={CLIENT_FRAMEWORK_OPTIONS[framework]}
				labels={frameworkKeys.map((k) => CLIENT_FRAMEWORK_OPTIONS[k])}
				onSelect={(l) => {
					const frameworkKey = frameworkKeys.find(
						(k) => CLIENT_FRAMEWORK_OPTIONS[k] === l,
					)
					setFramework(frameworkKey!)
				}}
			/>

			<div className={styles.stepsContainer}>
				{guide.entries.map((entry, index) => {
					return (
						<Section title={entry.title} key={index} defaultOpen>
							<ReactMarkdown>{entry.content}</ReactMarkdown>
							{entry.code && (
								// Wrapper prevents code blocks from expanding width of the code
								// block beyond the containing element.
								<div style={{ maxWidth: 650 }}>
									<CodeBlock
										language={entry.code.language}
										onCopy={() => {
											analytics.track(
												'Copied Setup Code',
												{
													copied: 'script',
													language:
														entry.code?.language,
												},
											)
										}}
										text={entry.code.text}
									/>
								</div>
							)}
						</Section>
					)
				})}
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
						Please follow the setup instructions above to install
						Highlight. It should take less than a minute for us to
						detect installation.
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
				<Section
					title={
						<span className={styles.sectionTitleWithIcon}>
							Read the Docs
						</span>
					}
					id="slackAlerts"
				>
					<p>
						Interested in learning how Highlight can help you move
						faster? Check out our docs!
					</p>
					<p>Some things you'll learn more about are:</p>
					<ul>
						<li>
							<a
								href="https://www.highlight.io/docs/general/product-features/general-features/comments"
								target="_blank"
								rel="noreferrer"
							>
								Collaborating with comments
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/sdk/client#feedbackWidget"
								target="_blank"
								rel="noreferrer"
							>
								Collecting user feedback with retained context
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/recording-network-requests-and-responses"
								target="_blank"
								rel="noreferrer"
							>
								Debugging network requests
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/general/company/open-source/self-host-hobby"
								target="_blank"
								rel="noreferrer"
							>
								On-prem
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/general/product-features/error-monitoring/sourcemaps"
								target="_blank"
								rel="noreferrer"
							>
								Getting more useful error stack traces if you
								don't ship sourcemap
							</a>
						</li>
					</ul>

					<div className={styles.integrationContainer}>
						<ButtonLink
							anchor
							href="https://www.highlight.io/docs/general/welcome"
							trackingId="SetupPageDocs"
						>
							Read the Docs
						</ButtonLink>
					</div>
				</Section>
			</div>
		</>
	)
}

const BackendSetup = ({
	projectData,
	integrated,
	docs,
}: {
	projectData: GetProjectQuery | undefined
	integrated: boolean
	docs: Guides['server']
}) => {
	const [language, setLanguage] = useLocalStorage<BackendLanguageKey>(
		`selectedSetupLanguage-${projectData?.project?.id}`,
		Object.keys(docs)[0] as BackendLanguageKey,
	)
	const languageKeys = Object.keys(docs) as BackendLanguageKey[]

	return (
		<>
			<Helmet>
				<title>Setup: {language}</title>
			</Helmet>

			<div className={styles.headingWrapper}>
				<h2>Your Backend Integrations</h2>
			</div>
			<p className={layoutStyles.subTitle}>
				Setup Highlight in your backend!
			</p>

			<RadioGroup<BackendLanguageLabel>
				style={{ marginTop: 20, marginBottom: 20 }}
				selectedLabel={BACKEND_LANGUAGE_OPTIONS[language]}
				labels={languageKeys.map((k) => BACKEND_LANGUAGE_OPTIONS[k])}
				onSelect={(l) => {
					const languageKey = languageKeys.find(
						(k) => BACKEND_LANGUAGE_OPTIONS[k] === l,
					)
					setLanguage(languageKey!)
				}}
			/>

			<Framework
				docs={docs}
				language={language}
				integrated={integrated}
				projectData={projectData}
			/>
		</>
	)
}

const Framework: React.FC<{
	docs: Guides['server']
	integrated: boolean
	language: BackendLanguageKey
	projectData: GetProjectQuery | undefined
}> = ({ docs, integrated, language, projectData }) => {
	const [framework, setFramework] = useLocalStorage<BackendFrameworkKey>(
		`selectedSetupFramework-${projectData?.project?.id}`,
		Object.keys(docs[language])[0] as BackendFrameworkKey,
	)
	const guide = docs[language] && docs[language][framework]
	const frameworkKeys = Object.keys(docs[language]) as BackendFrameworkKey[]

	if (!guide) {
		setFramework(Object.keys(docs[language])[0] as BackendFrameworkKey)
		return null
	}

	const projectVerboseId =
		projectData?.project?.verbose_id || 'YOUR_PROJECT_ID'

	return (
		<>
			<VerticalRadioGroup<BackendFrameworkLabel>
				style={{ marginTop: 20, marginBottom: 20 }}
				selectedLabel={BACKEND_FRAMEWORK_OPTIONS[framework]}
				labels={frameworkKeys.map((k) => BACKEND_FRAMEWORK_OPTIONS[k])}
				onSelect={(f) => {
					const frameworkKey = frameworkKeys.find(
						(k) => BACKEND_FRAMEWORK_OPTIONS[k] === f,
					)
					setFramework(frameworkKey!)
				}}
			/>

			<div className={styles.stepsContainer}>
				{guide.entries.map((entry, index) => {
					return (
						<Section title={entry.title} key={index} defaultOpen>
							<ReactMarkdown>{entry.content}</ReactMarkdown>
							{entry.code && (
								// Wrapper prevents code blocks from expanding width of the code
								// block beyond the containing element.
								<div style={{ maxWidth: 650 }}>
									<CodeBlock
										language={entry.code.language}
										onCopy={() => {
											analytics.track(
												'Copied Setup Code',
												{
													copied: 'script',
													language:
														entry.code?.language,
												},
											)
										}}
										text={entry.code.text}
									/>
								</div>
							)}
						</Section>
					)
				})}

				<Section title="Frontend Configuration" defaultOpen>
					<p>
						Ensure that your client Highlight snippet is initialized
						with the below settings included.{' '}
					</p>
					<CodeBlock
						text={`H.init("${projectVerboseId}", {
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
						Please follow the setup instructions above to install
						Highlight on your backend. It should take less than a
						minute for us to detect installation.
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
						Interested in learning how Highlight can help you move
						faster? Check out our docs!
					</p>
					<p>Some things you'll learn more about are:</p>
					<ul>
						<li>
							<a
								href="https://www.highlight.io/docs/general/product-features/general-features/comments"
								target="_blank"
								rel="noreferrer"
							>
								Collaborating with comments
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/sdk/client#feedbackWidget"
								target="_blank"
								rel="noreferrer"
							>
								Collecting user feedback with retained context
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/recording-network-requests-and-responses"
								target="_blank"
								rel="noreferrer"
							>
								Debugging network requests
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/general/company/open-source/self-host-hobby"
								target="_blank"
								rel="noreferrer"
							>
								On-prem
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/general/product-features/error-monitoring/sourcemaps"
								target="_blank"
								rel="noreferrer"
							>
								Getting more useful error stack traces if you
								don't ship sourcemap
							</a>
						</li>
					</ul>

					<div className={styles.integrationContainer}>
						<ButtonLink
							anchor
							href="https://www.highlight.io/docs/general/welcome"
							trackingId="SetupPageDocs"
						>
							Read the Docs
						</ButtonLink>
					</div>
				</Section>
			</div>
		</>
	)
}

const MoreSetup = ({
	project_id,
	projectData,
	integrated,
}: {
	project_id: string
	projectData: GetProjectQuery | undefined
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
			<div className={styles.stepsContainer}>
				<Section
					title={
						<span className={styles.sectionTitleWithIcon}>
							Enable Slack Alerts
							{projectData?.workspace?.slack_webhook_channel ? (
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
						Supercharge your workflows and attach Highlight with the
						tools you use everyday such as:
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
						If you're not seeing sessions or errors on Highlight,
						chances are that requests to Highlight are being
						blocked. This can happen for different reasons such as a
						third-party browser extensions, browser configuration,
						or VPN settings.
					</p>
					<p>
						One way we can avoid this is by setting up proxy from
						your domain to Highlight. To do this, you will need
						access to your domain's DNS settings.
					</p>
					<div className={styles.integrationContainer}>
						<ButtonLink
							href="https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/proxying-highlight"
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
						Interested in learning how Highlight can help you move
						faster? Check out our docs!
					</p>
					<p>Some things you'll learn more about are:</p>
					<ul>
						<li>
							<a
								href="https://www.highlight.io/docs/general/product-features/general-features/comments"
								target="_blank"
								rel="noreferrer"
							>
								Collaborating with comments
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/recording-network-requests-and-responses"
								target="_blank"
								rel="noreferrer"
							>
								Debugging network requests
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/getting-started/self-host/self-hosted-hobby-guide"
								target="_blank"
								rel="noreferrer"
							>
								On-prem
							</a>
						</li>
						<li>
							<a
								href="https://www.highlight.io/docs/getting-started/fullstack-frameworks/next-js/env-variables"
								target="_blank"
								rel="noreferrer"
							>
								Getting more useful error stack traces if you
								don't ship sourcemap
							</a>
						</li>
					</ul>

					<div className={styles.integrationContainer}>
						<ButtonLink
							anchor
							href="https://highlight.io/docs"
							trackingId="SetupPageDocs"
						>
							Read the Docs
						</ButtonLink>
					</div>
				</Section>
			</div>
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

const verifyDocsMapping = (docs?: Guides) => {
	if (!docs) {
		return
	}

	for (const platform in docs) {
		console.assert(
			!!PLATFORM_OPTIONS[platform as keyof typeof PLATFORM_OPTIONS],
			`Mapping for docs platforms to PLATFORM_OPTIONS is broken for ${platform}`,
		)

		if (platform === 'server') {
			for (const language in (docs as any)[platform]) {
				console.assert(
					!!BACKEND_LANGUAGE_OPTIONS[
						language as keyof typeof BACKEND_LANGUAGE_OPTIONS
					],
					`Mapping for docs languages to LANGUAGE_OPTIONS is broken for ${language}`,
				)

				for (const framework in (docs as any)[platform][language]) {
					console.assert(
						!!BACKEND_FRAMEWORK_OPTIONS[
							framework as keyof typeof BACKEND_FRAMEWORK_OPTIONS
						],
						`Mapping for docs frameworks to FRAMEWORK_OPTIONS is broken for ${framework}`,
					)
				}
			}
		} else if (platform === 'client') {
			for (const language in (docs as any)[platform]) {
				console.assert(
					!!CLIENT_FRAMEWORK_OPTIONS[
						language as keyof typeof CLIENT_FRAMEWORK_OPTIONS
					],
					`Mapping for docs languages to CLIENT_FRAMEWORK_OPTIONS is broken for ${language}`,
				)
			}
		} else if (platform === 'other') {
			for (const language in (docs as any)[platform]) {
				console.assert(
					!!OTHER_OPTIONS[language as keyof typeof OTHER_OPTIONS],
					`Mapping for docs languages to OTHER_OPTIONS is broken for ${language}`,
				)
			}
		}
	}
}

// Copied from RadioGroup.tsx for now. Will refactor and break out to a separate
// component once designs are finalized.
export const VerticalRadioGroup = <T extends string | number>({
	onSelect,
	labels,
	selectedLabel,
	style,
}: {
	onSelect: (p: T) => void
	labels: T[]
	selectedLabel: T
	style?: React.CSSProperties
}) => {
	const labelDivs = labels.map((label, index) => {
		const isSelected = label === selectedLabel

		return (
			<Box
				key={index}
				border="secondary"
				borderRadius="6"
				backgroundColor={isSelected ? 'p10' : 'white'}
				cursor="pointer"
				display="flex"
				onClick={() => onSelect(label)}
				p="10"
			>
				<Text color={isSelected ? 'white' : undefined}>{label}</Text>
			</Box>
		)
	})
	return (
		<Box
			display="flex"
			flexDirection="column"
			style={{ maxWidth: 200, ...style }}
			gap="4"
		>
			{labelDivs}
		</Box>
	)
}

export default SetupPage
