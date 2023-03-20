import { LoadingOutlined } from '@ant-design/icons'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { useGetProjectQuery } from '@graph/hooks'
import { GetProjectQuery } from '@graph/operations'
import { Box, Stack, Text } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { useBackendIntegrated } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import { message, Spin } from 'antd'
import clsx from 'clsx'
import { capitalize } from 'lodash'
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

type Guide = {
	title: string
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
	const [docs, setDocs] = useState<Guides>()
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

	useEffect(() => {
		fetch(`https://www.highlight.io/api/quickstart`)
			.then((res) => res.json())
			.then((docs) => setDocs(docs))
			.catch(() => message.error('Error loading docs...'))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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
							<Stack gap="24">
								<Skeleton
									height={40}
									width={500}
									style={{ borderRadius: 8 }}
								/>
								<Skeleton
									height={20}
									width={400}
									style={{ borderRadius: 8 }}
								/>
								<Skeleton
									height={30}
									width={600}
									style={{ borderRadius: 8 }}
								/>
								<Skeleton
									height={150}
									count={3}
									width={700}
									style={{
										borderRadius: 8,
										marginBottom: 24,
									}}
								/>
							</Stack>
						) : (
							<>
								{step === 'client' && (
									<ClientSetup
										project_id={projectId!}
										projectVerboseId={
											data.project.verbose_id
										}
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
	projectVerboseId,
	integrated,
	docs,
}: {
	project_id: string
	projectVerboseId: string
	integrated: boolean
	docs: Guides['client']
}) => {
	const frameworkKeys = Object.keys(docs)
	const [framework, setFramework] = useLocalStorage<string>(
		`selectedSetupClientFramework-${project_id}`,
		frameworkKeys[0],
	)
	const guide = docs[framework]

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

			<RadioGroup<string>
				style={{ marginBottom: 20 }}
				selectedLabel={guide.title}
				labels={frameworkKeys.map((k) => docs[k].title)}
				onSelect={(l) => {
					const frameworkKey = frameworkKeys.find(
						(k) => docs[k].title === l,
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
										text={entry.code.text.replace(
											'<YOUR_PROJECT_ID>',
											projectVerboseId,
										)}
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
	const languageKeys = Object.keys(docs)
	const languageValues = languageKeys.map((k) => capitalize(k))
	const [language, setLanguage] = useLocalStorage<string>(
		`selectedSetupLanguage-${projectData?.project?.id}`,
		languageKeys[0],
	)

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

			<RadioGroup<string>
				style={{ marginBottom: 10 }}
				selectedLabel={capitalize(language)}
				labels={languageValues}
				onSelect={(l) => setLanguage(l.toLowerCase())}
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
	language: string
	projectData: GetProjectQuery | undefined
}> = ({ docs, integrated, language, projectData }) => {
	const frameworkKeys = Object.keys(docs[language])
	const [framework, setFramework] = useLocalStorage<string>(
		`selectedSetupFramework-${projectData?.project?.id}`,
		frameworkKeys[0],
	)
	const guide = docs[language] && docs[language][framework]

	if (!guide) {
		setFramework(frameworkKeys[0])
		return null
	}

	const projectVerboseId =
		projectData?.project?.verbose_id || '<YOUR_PROJECT_ID>'

	return (
		<>
			<RadioGroup<string>
				style={{ marginBottom: 20 }}
				selectedLabel={getBackendFrameworkTitle(language, guide.title)}
				labels={frameworkKeys.map((k) =>
					getBackendFrameworkTitle(language, docs[language][k].title),
				)}
				onSelect={(l) => {
					const frameworkKey = frameworkKeys.find(
						(k) =>
							getBackendFrameworkTitle(
								language,
								docs[language][k].title,
							) === l,
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
										text={entry.code.text.replace(
											'<YOUR_PROJECT_ID>',
											projectVerboseId,
										)}
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

const getBackendFrameworkTitle = (language: string, framework: string) => {
	const languageTitle = capitalize(language)

	if (framework.startsWith(`${languageTitle} `)) {
		// Clean up `Python Flask` to `Flask`
		framework = framework.replace(`${languageTitle} `, '')
	}
	return framework
}

// Copied from RadioGroup.tsx for now. Will refactor and break out to a separate
// component once designs are finalized.
export const RadioGroup = <T extends string | number>({
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
				border={isSelected ? 'primaryPressed' : 'secondary'}
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
		<Box display="flex" flexDirection="row" style={style} gap="6">
			{labelDivs}
		</Box>
	)
}

export default SetupPage
