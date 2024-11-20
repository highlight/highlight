import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import Image from 'next/legacy/image'
import { CSSProperties, Fragment, Key, useState } from 'react'
import { CodeBlock } from 'react-code-blocks'
import highlightCodeTheme from '../../../components/common/CodeBlock/highlight-code-theme'
import CheckmarkIcon from '../../../public/images/checkmark_circle.svg'
import CopyIcon from '../../../public/images/document-duplicate.svg'
import { Typography } from '../../common/Typography/Typography'
import styles from '../Docs.module.scss'

export const HighlightCodeBlock = (props: {
	language: string
	text?: string | any
	copy?: string
	topbar?: boolean
	showLineNumbers?: boolean
	product?: any
	style?: CSSProperties
}) => {
	const [copied, setCopied] = useState(false)
	const [selected, setSelected] = useState(0)
	return (
		<div className={styles.codeBlock} style={props.style}>
			{props.topbar && (
				<div className={styles.codeBlockTopper}>
					{props.product.types && (
						<div className="w-28 ml-6">
							<Listbox value={selected} onChange={setSelected}>
								<div className="relative">
									<Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-dark-background py-2 my-[10px] pl-3 pr-4 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
										<Typography type="copy4" emphasis>
											<span className="block truncate">
												{props.product.types[selected]}
											</span>
										</Typography>
										<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
											<ChevronUpDownIcon
												className="h-5 w-5 text-gray-400"
												aria-hidden="true"
											/>
										</span>
									</Listbox.Button>
									<Transition
										as={Fragment}
										leave="transition ease-in duration-100"
										leaveFrom="opacity-100"
										leaveTo="opacity-0"
									>
										<Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md border-2 border-divider-on-dark bg-color-primary-500 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
											{props.product.types.map(
												(type: string, index: Key) => (
													<Listbox.Option
														key={index}
														className={({
															active,
														}) =>
															`relative cursor-pointer select-none mx-1 py-1 pl-2 pr-4 rounded-md ${
																active
																	? 'bg-divider-on-dark text-white'
																	: 'text-copy-on-dark'
															}`
														}
														value={index}
													>
														{({ selected }) => (
															<>
																<span
																	className={`block truncate ${
																		selected
																			? 'font-medium'
																			: 'font-normal'
																	}`}
																>
																	<Typography
																		type="copy4"
																		emphasis={
																			true
																		}
																	>
																		{type}
																	</Typography>
																</span>
															</>
														)}
													</Listbox.Option>
												),
											)}
										</Listbox.Options>
									</Transition>
								</div>
							</Listbox>
						</div>
					)}
				</div>
			)}
			<CodeBlock
				language={props.language}
				text={
					props.text?.at(0)?.props
						? props.text
								?.map((obj: any) => obj.props.children.at(0))
								.join('\n')
						: props.text || props.product.snippets[selected] || ''
				}
				showLineNumbers={props.showLineNumbers}
				theme={highlightCodeTheme}
			/>
			<div
				className={classNames(
					styles.codeCopyIcon,
					`${props.topbar ? 'mt-1' : ''}`,
				)}
				onClick={() => {
					navigator.clipboard.writeText(
						props.copy ?? props.text ?? '',
					)
					setCopied(true)
					setTimeout(() => setCopied(false), 1000)
				}}
			>
				<Image src={CopyIcon} alt="Copy" />
			</div>
			{copied && (
				<div
					className={classNames(
						styles.codeCopyIcon,
						styles.active,
						`${props.topbar ? 'mt-1' : ''}`,
					)}
				>
					<Image src={CheckmarkIcon} alt="Text Copied" />
				</div>
			)}
		</div>
	)
}
