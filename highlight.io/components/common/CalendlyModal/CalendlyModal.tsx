import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { useSearchParams } from 'next/navigation'
import { Fragment, useState } from 'react'
import { InlineWidget } from 'react-calendly'
import styles from '../../Docs/Docs.module.scss'
import { Typography } from '../Typography/Typography'

const CalendlyPopup = () => {
	const query = useSearchParams()
	return (
		<InlineWidget
			url="https://calendly.com/highlight-io/discussion"
			styles={{ width: '100%', height: '100%' }}
			utm={{
				utmCampaign: query?.get('utm_campaign') ?? '',
				utmSource: query?.get('utm_source') ?? '',
				utmMedium: query?.get('utm_medium') ?? '',
				utmContent: query?.get('utm_content') ?? '',
				utmTerm: query?.get('utm_term') ?? '',
			}}
		/>
	)
}

export const CalendlyModal = ({
	className,
	children,
}: React.PropsWithChildren<{ className?: string }>) => {
	const [calendlyOpen, setCalendlyOpen] = useState(false)

	return (
		<div>
			<button
				type="button"
				onClick={() => setCalendlyOpen(true)}
				className={className}
			>
				{children}
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
										<CalendlyPopup />

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
export const EnterpriseSelfHostCalendlyComponent = ({
	prefix,
}: {
	prefix: String
}) => {
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
