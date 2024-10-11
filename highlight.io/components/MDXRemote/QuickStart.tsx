import {
	QuickStartContent,
	QuickStartStep,
} from '../QuickstartContent/QuickstartContent'

import classNames from 'classnames'
import Markdown from 'markdown-to-jsx'
import styles from '../../components/Docs/Docs.module.scss'
import { HighlightCodeBlock } from '../Docs/HighlightCodeBlock/HighlightCodeBlock'
type Props = { content: QuickStartContent }

export function QuickStart({ content: c }: Props) {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
			<h2 className="quickStartH2">{c.subtitle}</h2>
			<div style={{ borderTop: '1px solid #EBFF5E', width: 200 }} />
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					marginTop: 10,
				}}
			>
				{c.entries.map((step: QuickStartStep, i: number) => {
					if (step.hidden) return null
					return (
						<div key={JSON.stringify(step)} className="flex gap-6">
							<div className="flex flex-col items-center flex-shrink-0 w-10">
								<div className="grid flex-shrink-0 w-8 h-8 rounded-full bg-divider-on-dark place-items-center">
									{i + 1}
								</div>
								<div className="w-0.5 flex-1 bg-divider-on-dark" />
							</div>
							<div className="grid gap-5 mb-[42px] flex-1 min-[1000px]:grid-cols-2 min-[1000px]:grid-flow-col">
								<div
									className={classNames(
										' flex flex-col gap-2',
										styles.quickStartSubtext,
									)}
								>
									<h3 className="quickStartH3">
										{step.title}
									</h3>
									<Markdown
										options={{
											forceBlock: true,
											overrides: {
												code: (props) => {
													return (
														<code
															className={
																styles.inlineCodeBlock
															}
														>
															{props.children}
														</code>
													)
												},
												ul: (props) => {
													return <div>hellooooo</div>
												},
											},
										}}
									>
										{step.content}
									</Markdown>
								</div>
								<div className="min-w-0">
									{step.code?.map((codeBlock) => {
										return (
											<HighlightCodeBlock
												key={codeBlock.key}
												style={{
													position: 'sticky',
													top: '80px',
												}}
												language={codeBlock.language}
												text={codeBlock.text}
												copy={codeBlock.copy}
												showLineNumbers={false}
											/>
										)
									})}
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
