'use client'

import { Dialog, Transition } from '@headlessui/react'
import { ArrowRightCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import { useSearchParams } from 'next/navigation'
import { Fragment, useState } from 'react'
import { InlineWidget } from 'react-calendly'
import { setAttributionData } from '../../../utils/attribution'
import styles from '../../Docs/Docs.module.scss'
import { Typography } from '../Typography/Typography'

function Calendly() {
	const query = useSearchParams()
	const referrer = setAttributionData()
	const utm = {
		utmCampaign: referrer.utm_campaign ?? query?.get('utm_campaign') ?? '',
		utmSource: referrer.utm_source ?? query?.get('utm_source') ?? '',
		utmMedium: referrer.utm_medium ?? query?.get('utm_medium') ?? '',
		utmContent: referrer.utm_content ?? query?.get('utm_content') ?? '',
		utmTerm: referrer.utm_term ?? query?.get('utm_term') ?? '',
	}
	console.log({ utm })
	return (
		<InlineWidget
			url="https://calendly.com/highlight-io/discussion"
			styles={{ width: '100%', height: '100%' }}
			utm={utm}
		/>
	)
}

export function CalendlyModal({
	className,
	children,
}: React.PropsWithChildren<{ className?: string }>) {
	const [calendlyOpen, setCalendlyOpen] = useState(false)

	return (
		<div>
			<button
				type="button"
				onClick={() => setCalendlyOpen(true)}
				className={classNames(
					'flex items-center gap-1 transition-colors rounded active:brightness-50',
					className,
				)}
			>
				{children ?? (
					<div className={'flex items-center gap-1'}>
						<Typography type="copy2" emphasis>
							Request a Demo Call
						</Typography>
						<ArrowRightCircleIcon className="w-5 h-5" />
					</div>
				)}
			</button>

			<Transition appear show={calendlyOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-[999] w-screen h-screen"
					onClose={() => setCalendlyOpen(false)}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="fixed grid place-items-center inset-0 z-50 w-screen h-screen pointer-events-none">
									<div className="relative flex min-w-[320px] w-screen max-w-5xl min-[1000px]:h-[700px] h-[900px] transition-opacity max-[652px]:pt-14 pointer-events-auto">
										<Calendly />

										<button
											className="absolute grid w-10 h-10 rounded-full place-content-center bg-divider-on-dark max-[652px]:right-2 max-[652px]:top-2 right-10 top-16 hover:brightness-150 transition-all pointer-events-auto"
											onClick={() =>
												setCalendlyOpen(false)
											}
										>
											<XMarkIcon className="w-5 h-5" />
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</div>
	)
}

//Specific component created to allow for the CalendlyModal to be used in the enterpise self-host docs in an inline style
//Inline components are not possible in MDX (as far as I can tell)
export function EnterpriseSelfHostCalendlyComponent({
	prefix,
}: {
	prefix: String
}) {
	return (
		<div className={styles.contentRender}>
			<Typography type="copy2" onDark>
				{prefix}{' '}
				<span className="inline-block text-blue-cta font-semibold">
					<CalendlyModal> our booking link</CalendlyModal>
				</span>
				.
			</Typography>
		</div>
	)
}
