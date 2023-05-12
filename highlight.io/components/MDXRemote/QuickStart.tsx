import {
	QuickStartContent,
	QuickStartStep,
} from '../QuickstartContent/QuickstartContent'

import { HighlightCodeBlock } from '../Docs/HighlightCodeBlock/HighlightCodeBlock'
import Markdown from 'markdown-to-jsx'
import { Typography } from '../common/Typography/Typography'
import classNames from 'classnames'
import styles from '../../components/Docs/Docs.module.scss'

type Props = { content: QuickStartContent }

export function QuickStart({ content: c }: Props) {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
			<Typography onDark type="copy1">
				{c.subtitle}
			</Typography>
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
									<Typography type="copy2" emphasis>
										{step.title}
									</Typography>
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
									{step.code && (
										<HighlightCodeBlock
											style={{
												position: 'sticky',
												top: '80px',
											}}
											language={step.code.language}
											text={step.code.text}
											showLineNumbers={false}
										/>
									)}
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
