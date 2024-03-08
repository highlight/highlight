import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { NextPage } from 'next'
import Link from 'next/link'
import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import Navbar from '../../components/common/Navbar/Navbar'
import { Typography } from '../../components/common/Typography/Typography'

import { Dialog, RadioGroup, Transition } from '@headlessui/react'
import * as Slider from '@radix-ui/react-slider'
import classNames from 'classnames'
import { Fragment, useState } from 'react'
import { HeadlessTooltip } from '../../components/Competitors/ComparisonTable'

import { Switch } from '@headlessui/react'
import {
	HiOfficeBuilding,
	HiPuzzle,
	HiReceiptTax,
	HiServer,
} from 'react-icons/hi'

import {
	enterprisePrices,
	freePrices,
	Prices,
	professionalPrices,
	selfHostPrices,
} from '../../components/Pricing/estimator_details'

const MyToggle = () => {
	const [enabled, setEnabled] = useState(false)

	return (
		<Switch
			checked={enabled}
			onChange={setEnabled}
			className={`relative border border-divider-on-dark inline-flex h-10 w-[280px] items-center rounded-md`}
		>
			<p className="absolute left-4 z-10">Billed Annually</p>
			<p className="absolute right-4 z-10">Billed Monthly</p>
			<span
				className={`${
					enabled ? 'right-0' : 'right-auto'
				} absolute inline-block h-[30px] w-[125px] transform rounded-full bg-purple-primary transition-all`}
			/>
		</Switch>
	)
}

const PricingPage: NextPage = () => {
	return (
		<div>
			<Navbar />
			<div className="flex flex-col w-full px-10 mx-auto my-24">
				<div className="flex flex-col items-center text-center gap-9">
					<h1 className="max-w-3xl my-0">Pricing plans</h1>
				</div>
				<PlanTable />
			</div>
			<FooterCallToAction />
			<Footer />
		</div>
	)
}

const docsUrl = '/docs'

// const Faqs: { question: string; answer: string; icon: string }[] = [
// 	{
// 		question: 'Do you offer a discount for non-profits?',
// 		answer: `We love supporting non-profits and offer a 75% discount for the lifetime of the account. To activate the discount, create a workplace on either the Standard or Pro plan. Then reach out to support and mention the discount.`,
// 		icon: TagLoyalty,
// 	},
// 	{
// 		question: 'How long does it take to setup Highlight?',
// 		answer: `It generally takes an engineer less than ten minutes to understand the concepts of Highlight and integrate the app into their workflow. For more information on setup, take a look at our <a href="${docsUrl}">docs</a>.`,
// 		icon: Stopwatch,
// 	},
// 	{
// 		question: 'Can I deploy Highlight on-premise?',
// 		answer: `Yes! To get a glimpse at how our hobby deployment process looks, take a look <a href="${docsUrl}/general/company/open-source/hosting/self-host-hobby">here</a>. To get a license key for a production deployment, contacts at <a href="mailto:sales@highlight.io">sales@highlight.io</a>.`,
// 		icon: Globe,
// 	},
// 	{
// 		question: "Is Highlight secure? Where's my data stored?",
// 		answer: `Highlight uses end-to-end encryption to keep your data safe while it’s in transit, and we also offer an on-prem solution if you want to keep customer data on your own servers. For more information, see our <a href="/#privacy">security section</a> and <a href="${docsUrl}" target="_blank">docs</a>. If we don't answer your question there, <a href="mailto:jay@highlight.io">let us know</a>.`,
// 		icon: Security,
// 	},
// 	{
// 		question: 'Do I need a credit card to sign up?',
// 		answer: `Absolutely not! We never ask for your credit card on sign up. If you start on a paid plan then 30 days after signing up you will be politely prompted to enter in your payment information. At anytime you can switch back to a free plan as long as your workplace has less than 6 seats.`,
// 		icon: CreditCard,
// 	},
// 	{
// 		question: 'How will you charge me?',
// 		answer: `We ask for a credit card. Your credit card information will never touch our servers as we use <a href="https://stripe.com/" target="_blank">Stripe</a> as our payments processor. For Enterprise customers we can do ACH and custom invoices if requested.`,
// 		icon: Wallet,
// 	},
// 	{
// 		question: 'How does billing work?',
// 		answer: `We charge by usage; or number of sessions collected per month. Our billing system uses prorated billing, meaning you only pay for what you use below each of our thresholds (see above). For example if you move to the Startup plan from the Basic plan in the middle of the month, then you will only be charged for the time you are on the paid plan.`,
// 		icon: ReceiptList,
// 	},
// 	{
// 		question: 'What counts as a session?',
// 		answer: `A session is contiguous instance of a user's presence on your app for less than 4 hours. That is, if a user is browsing your application for 3 minutes, then closes the tab, this counts as a single session.`,
// 		icon: PcPlayMedia,
// 	},
// 	{
// 		question: 'Can I cancel at anytime?',
// 		answer: `Definitely! You can cancel or downgrade your subscription at anytime. You can also delete your workplace in the settings page at anytime.`,
// 		icon: Delete,
// 	},
// ]
//

const retentionOptions = [
	'30 days',
	'3 months',
	'6 months',
	'1 year',
	'2 years',
] as const
type Retention = (typeof retentionOptions)[number]
const retentionMultipliers: Record<Retention, number> = {
	'30 days': 1,
	'3 months': 1,
	'6 months': 1.5,
	'1 year': 2,
	'2 years': 2.5,
} as const

const tierOptions = ['Free', 'Professional', 'Enterprise', 'SelfHost'] as const
type TierName = (typeof tierOptions)[number]

type PricingTier = {
	label: string
	subText?: string
	prices: Prices
	icon: JSX.Element
	features: {
		feature: string
		tooltip?: string
	}[]
	calculateUsage?: boolean
	buttonLabel: string
	buttonLink: string
}

const priceTiers: Record<TierName, PricingTier> = {
	Free: {
		label: 'Free',
		prices: freePrices,
		subText: 'Free forever',
		icon: (
			<HiReceiptTax className="text-darker-copy-on-dark w-8 h-8 -translate-x-1" />
		),
		features: [
			{
				feature: `500 monthly sessions`,
			},
			{
				feature: 'AI error grouping',
			},
			{
				feature: 'Unlimited seats',
			},
		],
		buttonLabel: 'Start free trial',
		buttonLink: 'https://app.highlight.io/sign_up',
	},
	Professional: {
		label: 'Professional',
		subText: 'base per project/month, billed annually',
		prices: professionalPrices,
		icon: <HiPuzzle className="text-[#0090FF] w-8 h-8 -translate-x-1" />,
		features: [
			{
				feature: `Filters for data ingest`,
			},
			{
				feature: 'Dozens of integrations',
			},
			{
				feature: 'Cheaper with higher volume',
			},
			{
				feature: 'Alerts and notifications',
			},
		],
		calculateUsage: true,
		buttonLabel: 'Start free trial',
		buttonLink: 'https://app.highlight.io/sign_up',
	},

	Enterprise: {
		label: 'Enterprise',
		subText: 'base per project/month, billed annually',
		prices: enterprisePrices,
		icon: (
			<HiOfficeBuilding className="text-white w-8 h-8 -translate-x-1" />
		),
		features: [
			{
				feature: 'Volume discounts',
				tooltip:
					'At higher volumes, we can heavily discount usage; reach out to learn more.',
			},
			{
				feature: 'SAML & SSO',
				tooltip:
					'Secure user management to ensure you can manage your team with your existing tooling.',
			},
			{
				feature: 'Custom Compliance Contracts',
				tooltip:
					'Custom contracts to abide by your compliance requirements; we handle these on a case-by-case basis.',
			},
			{
				feature: 'RBAC & Audit Logs',
				tooltip:
					'Infrastructure for auditing and adding fine-grained access controls.',
			},
			{
				feature: 'Data Export',
				tooltip:
					'Recurring or one-off exports of your observability data for offline analysis.',
			},
			{
				feature: 'Grafana Integration',
				tooltip:
					'Exposure to a Grafana instance for visualization of traces/metrics/logs',
			},
			{
				feature: 'Aggregate user reporting',
			},
		],
		buttonLabel: 'Contact Us',
		buttonLink: '',
		calculateUsage: true,
	},
	SelfHost: {
		label: 'Self-Host',
		subText: 'per project/month, billed annually',
		prices: selfHostPrices,
		icon: <HiServer className="text-[#E93D82] w-8 h-8 -translate-x-1" />,
		features: [],
		calculateUsage: true,
		buttonLabel: 'Learn More',
		buttonLink:
			'/docs/general/company/open-source/hosting/self-host-enterprise',
	},
}

const PlanTable = () => {
	return (
		<div className="flex flex-col items-center w-full gap-6 mx-auto mt-16">
			{/* Pricing */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 justify-center">
				{Object.entries(priceTiers).map(([name, tier]) => (
					<PlanTier tier={tier} key={name} />
				))}
			</div>
			<div className="flex-shrink w-48" />
		</div>
	)
}

const PlanTier = ({ tier }: { tier: PricingTier }) => {
	const { features, calculateUsage } = tier

	return (
		<div
			className={
				'flex flex-col flex-grow border rounded-md min-[1190px]:min-w-[255px] basis-64 border-divider-on-dark'
			}
		>
			<div className="p-4 border-divider-on-dark">
				<div className="flex flex-col">
					{tier.icon}
					<Typography className="mt-2" type="copy1" emphasis>
						{tier.label}
					</Typography>
					<h4 className="mt-0">${tier.prices.monthlyPrice}</h4>
					<Typography
						className="text-darker-copy-on-dark"
						type="copy4"
					>
						{tier.subText ?? ''}
					</Typography>
				</div>
			</div>
			<Link
				href={tier.buttonLink}
				className="bg-white rounded-md text-center mt-2 mx-4 py-1 hover:bg-copy-on-dark transition-colors"
			>
				<Typography
					className="text-dark-background"
					type="copy3"
					emphasis
				>
					{tier.buttonLabel}
				</Typography>
			</Link>
			<div className="p-4 flex flex-col gap-2.5 flex-grow">
				{features.map((feature, index) => (
					<div
						key={index}
						className="flex justify-between gap-1 items-start"
					>
						<Typography className="text-copy-on-dark" type="copy3">
							{feature.feature}
						</Typography>
						{feature.tooltip && (
							<HeadlessTooltip tooltip={feature.tooltip} />
						)}
					</div>
				))}
			</div>
			<div className="p-4">
				{calculateUsage && (
					<PriceCalculatorModal prices={tier.prices} />
				)}
			</div>
		</div>
	)
}

const formatNumber = (num: number, digits?: number) => {
	let si = [
			{ value: 1e9, symbol: 'B' },
			{ value: 1e6, symbol: 'M' },
			{ value: 1e3, symbol: 'K' },
		],
		i
	for (i = 0; i < si.length; i++) {
		if (num >= si[i].value) {
			return (
				(num / si[i].value)
					.toFixed(digits ?? 2)
					.replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
			)
		}
	}
	return num.toString()
}

const formatPrice = (
	price: number,
	signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero' | undefined,
) =>
	price.toLocaleString(undefined, {
		style: 'currency',
		currency: 'USD',
		signDisplay: signDisplay ?? 'always',
	})

const PriceCalculatorModal = ({ prices }: { prices: Prices }) => {
	let [isOpen, setIsOpen] = useState(false)

	function closeModal() {
		setIsOpen(false)
	}

	function openModal() {
		setIsOpen(true)
	}

	return (
		<>
			<PrimaryButton
				onClick={openModal}
				className="flex justify-center border border-copy-on-dark text-copy-on-dark bg-transparent text-center py-1 rounded-md"
			>
				<Typography className="text-copy-on-dark" type="copy3" emphasis>
					Estimate your bill
				</Typography>
			</PrimaryButton>

			<Transition appear show={isOpen} as={Fragment}>
				<Dialog as="div" className="relative" onClose={closeModal}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-dark-background bg-opacity-80 z-[125]" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto z-[150]">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="flex transform bg-dark-background translate-y-8 text-left align-middle shadow-xl transition-all rounded-lg">
									<PriceCalculator prices={prices} />
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	)
}

const PriceCalculator = ({ prices }: { prices: Prices }) => {
	const defaultErrors = prices.Errors.free
	const defaultLogs = prices.Logs.free
	const defaultTraces = prices.Traces.free
	const defaultSessions = prices.Sessions.free

	const [errorUsage, setErrorUsage] = useState<number>(defaultErrors)
	const [sessionUsage, setSessionUsage] = useState<number>(defaultSessions)
	const [loggingUsage, setLoggingUsage] = useState<number>(defaultLogs)
	const [tracesUsage, setTracesUsage] = useState<number>(defaultTraces)

	const [errorRetention, setErrorRetention] = useState<Retention>('3 months')
	const [sessionRetention, setSessionRetention] =
		useState<Retention>('3 months')

	const getUsagePrice = (
		usage: number,
		product: 'Sessions' | 'Errors' | 'Logs' | 'Traces',
		retention: Retention,
	) => {
		const cost = prices[product]
		let remainder = usage - cost.free
		let tier = 0
		let price = 0
		while (remainder > 0) {
			const item = cost.items[tier]
			if (!item) break
			const itemUsage = Math.min(remainder, item.usage ?? Infinity)
			if (item.constant) {
				price = item.rate
			} else {
				price += itemUsage * item.rate
			}
			remainder -= itemUsage
			tier += 1
		}
		return [
			Math.trunc(price * retentionMultipliers[retention] * 100) / 100,
			price
				? Math.trunc((price / (usage - cost.free)) * cost.unit * 100) /
				  100
				: 0,
		]
	}

	const base = prices.monthlyPrice

	const [errorsCost, errorsRate] = getUsagePrice(
		errorUsage - defaultErrors,
		'Errors',
		errorRetention,
	)
	const [sessionsCost, sessionsRate] = getUsagePrice(
		sessionUsage - defaultSessions,
		'Sessions',
		sessionRetention,
	)
	const [loggingCost, loggingRate] = getUsagePrice(
		loggingUsage - defaultLogs,
		'Logs',
		'30 days',
	)
	const [tracesCost, tracesRate] = getUsagePrice(
		tracesUsage - defaultTraces,
		'Traces',
		'30 days',
	)

	return (
		<div className="flex flex-col items-center w-full gap-10 mx-auto rounded-2xl">
			{/* Price calculator */}
			<div className="flex flex-col items-end w-full max-w-[1100px]">
				<div className="flex flex-col overflow-hidden border divide-y rounded-lg md:rounded-br-none divide-divider-on-dark border-divider-on-dark">
					<div className="hidden h-12 md:flex">
						<div className="flex items-center flex-1 border-r border-divider-on-dark px-7">
							<Typography type="copy2" emphasis>
								Product
							</Typography>
						</div>
						<div className="flex items-center justify-center w-[343px] px-7">
							<Typography type="copy2" emphasis>
								Monthy Cost Breakdown
							</Typography>
						</div>
					</div>
					<CalculatorRowDesktop
						title="Error Monitoring"
						description="Error monitoring usage is defined by the number of errors collected by Highlight per month. Our frontend/server SDKs send errors, but you can also send custom errors."
						product={'Errors'}
						prices={prices}
						value={errorUsage}
						cost={errorsCost}
						rate={errorsRate}
						includedRange={defaultErrors}
						rangeMultiplier={100}
						retention={errorRetention}
						onChange={setErrorUsage}
						onChangeRetention={setErrorRetention}
					/>
					<CalculatorRowDesktop
						title="Session Replay"
						description="Session replay usage is defined by the number of sessions collected per month. A session is defined by an instance of a user’s tab on your application. "
						product={'Sessions'}
						prices={prices}
						value={sessionUsage}
						cost={sessionsCost}
						rate={sessionsRate}
						includedRange={defaultSessions}
						retention={sessionRetention}
						onChange={setSessionUsage}
						onChangeRetention={setSessionRetention}
					/>
					<CalculatorRowDesktop
						title="Logging"
						description="Log usage is defined by the number of logs collected by highlight.io per month. A log is defined by a text field with attributes."
						product={'Logs'}
						prices={prices}
						value={loggingUsage}
						cost={loggingCost}
						rate={loggingRate}
						includedRange={defaultLogs}
						rangeMultiplier={10000}
						retention="30 days"
						onChange={setLoggingUsage}
					/>
					<CalculatorRowDesktop
						title="Traces"
						description="Tracing usage is defined by the number of spans collected per month. Traces consist of multiple spans, each instrumenting a single section of code with customizable attributes."
						product={'Traces'}
						prices={prices}
						value={tracesUsage}
						cost={tracesCost}
						rate={tracesRate}
						includedRange={defaultTraces}
						rangeMultiplier={10000}
						retention="30 days"
						onChange={setTracesUsage}
					/>
					<div className="block px-3 py-5 rounded-b-lg md:hidden">
						<Typography type="copy1" emphasis>
							Total:{' '}
							{formatPrice(
								sessionsCost +
									errorsCost +
									loggingCost +
									tracesCost,
							)}
						</Typography>
					</div>
				</div>
				<div className="hidden border border-t-0 rounded-b-lg md:block h-52 border-divider-on-dark">
					<CalculatorCostDisplay
						heading="Monthly Total"
						cost={
							base +
							sessionsCost +
							errorsCost +
							loggingCost +
							tracesCost
						}
						subtitle={'Includes base fee and usage charges.'}
					/>
				</div>
			</div>
		</div>
	)
}

const CalculatorRowDesktop = ({
	title,
	description,
	product,
	prices,
	value,
	cost,
	rate,
	includedRange,
	rangeMultiplier = 1,
	retention,
	onChange,
	onChangeRetention,
}: {
	title: string
	description: string
	product: 'Sessions' | 'Errors' | 'Logs' | 'Traces'
	prices: Prices
	value: number
	includedRange: number
	cost: number
	rate: number
	rangeMultiplier?: number
	retention: Retention
	onChange: (value: number) => void
	onChangeRetention?: (value: Retention) => void
}) => {
	const rangeOptions = [
		0, 500, 1_000, 5_000, 10_000, 100_000, 250_000, 500_000, 750_000,
		1_000_000, 10_000_000,
	].map((v) => v * rangeMultiplier)

	return (
		<div className="flex flex-row">
			<div className="flex flex-col flex-1 gap-1 px-3 py-5 md:px-7">
				<Typography
					type="copy4"
					emphasis
					className="rounded-full bg-blue-cta py-0.5 px-3 text-dark-background self-start inline-block md:hidden"
				>
					{formatPrice(cost)}
				</Typography>
				<Typography type="copy1" emphasis>
					{title}
				</Typography>
				<Typography type="copy3" className="mt-2.5">
					{description}
				</Typography>
				<div className="mt-2.5">
					<RadioOptions
						title="Retention"
						options={
							onChangeRetention !== undefined
								? ['3 months', '6 months', '1 year', '2 years']
								: ['30 days']
						}
						value={retention}
						onChange={onChangeRetention}
					/>
				</div>
				<div className="mt-2.5">
					<RangedInput
						options={rangeOptions}
						value={value}
						includedRange={includedRange}
						onChange={onChange}
					/>
				</div>
			</div>
			<div className="hidden border-l border-divider-on-dark md:inline-block">
				<CalculatorCostDisplay
					heading="Usage (Monthly)"
					cost={cost}
					rate={{
						value: rate,
						unit: prices[product].unit,
						product,
					}}
				/>
			</div>
		</div>
	)
}

export const RangedInput = ({
	options,
	value,
	includedRange = 0,
	onChange,
}: {
	options: number[]
	value: number
	includedRange?: number
	onChange: (value: number) => void
}) => {
	const sortedOptions = [...options].sort((a, b) => a - b)
	const min = sortedOptions[0] ?? 0
	const max = sortedOptions[sortedOptions.length - 1] ?? 100

	const snapValue = (value: number) => {
		const deltas = sortedOptions.map((v) => Math.abs(v - value))
		for (const [i, delta] of deltas.entries()) {
			if ((deltas[i + 1] ?? Infinity) > delta) return sortedOptions[i]
		}
		return sortedOptions[0]
	}

	const normalize = (value: number) => (value - min) / (max - min)
	const denormalize = (normal: number) => normal * (max - min) + min

	return (
		<>
			<div className="block md:hidden">
				<label className="flex flex-col gap-2">
					<Typography
						type="copy4"
						className=" text-darker-copy-on-dark"
					>
						Usage
					</Typography>
					<div className="relative">
						<select
							className="flex items-center justify-center w-full h-12 gap-2 text-center text-transparent transition-all border rounded-lg appearance-none cursor-pointer border-copy-on-light hover:bg-white/10 bg-dark-background"
							onChange={(ev) =>
								onChange(parseFloat(ev.target.value))
							}
						>
							{options.map((value, i) => (
								<option value={value} key={i}>
									{value.toLocaleString(undefined, {
										notation: 'compact',
									})}
								</option>
							))}
						</select>
						<div className="absolute inset-0 flex items-center justify-center w-full h-12 gap-2 transition-all border rounded-lg pointer-events-none border-copy-on-light hover:bg-white/10">
							<Typography type="copy2" emphasis onDark>
								{snapValue(value).toLocaleString(undefined, {
									notation: 'compact',
								})}
							</Typography>
							<ChevronDownIcon className="w-5 h-5 text-darker-copy-on-dark" />
						</div>
					</div>
				</label>
			</div>
			<Slider.Root
				min={min}
				max={max}
				step={500}
				value={[denormalize(Math.pow(normalize(value), 1 / 3))]}
				onValueChange={([value]) =>
					value != null &&
					onChange(
						Math.ceil(denormalize(Math.pow(normalize(value), 3))),
					)
				}
				className="relative items-center hidden w-full h-12 mt-4 select-none md:flex touch-none group"
			>
				<Typography
					type="copy4"
					className="text-darker-copy-on-dark absolute top-[-14px]"
				>
					Usage
				</Typography>
				<Slider.Track className="relative flex-1 h-3 overflow-hidden rounded-full bg-divider-on-dark">
					<div
						className="absolute inset-y-0 left-0 h-full bg-blue-cta/30"
						style={{
							width: `${
								Math.pow(normalize(value), 1 / 3) * 100
							}%`,
						}}
					/>
				</Slider.Track>
				<Slider.Thumb className="relative w-6 h-6 border-2 focus:border-blue-cta hover:shadow-white/25 hover:shadow-[0_0_0_4px] outline-none bg-[#F5F5F5] border-copy-on-dark rounded-full flex flex-col items-center transition-all">
					<div className="absolute top-[24px] w-2.5 h-2.5 rotate-45 rounded-sm -top-4 bg-blue-cta" />
					<div className="absolute top-[28px] h-5 px-1 py-0.5 mb-2 text-divider-on-dark font-semibold text-[10px] rounded-sm bottom-full bg-blue-cta">
						{value.toLocaleString(undefined, {
							notation: 'compact',
						})}
					</div>
				</Slider.Thumb>
			</Slider.Root>
		</>
	)
}

const CalculatorCostDisplay = ({
	cost,
	rate,
	heading,
	subtitle,
}: {
	cost: number
	heading: string
	subtitle?: string
	rate?: {
		value: number
		unit: number
		product: 'Sessions' | 'Errors' | 'Logs' | 'Traces'
	}
}) => {
	return (
		<div className="gap-4 grid flex-shrink-0 place-content-center place-items-center w-[343px] h-full">
			<div className="grid flex-shrink-0 place-content-center place-items-center w-[343px] h-full">
				<Typography type="copy3" emphasis onDark>
					{heading}
				</Typography>
				<span className="text-4xl font-semibold">
					{formatPrice(cost)}
				</span>
			</div>
			{rate ? (
				<div className="grid flex-shrink-0 place-content-center place-items-center w-[343px] h-full">
					<Typography type="copy4" onDark>
						Average rate: {formatPrice(rate.value, 'auto')} /{' '}
						{formatNumber(rate.unit)} {rate.product.toLowerCase()}
					</Typography>
				</div>
			) : null}
			{subtitle ? (
				<div className="grid flex-shrink-0 place-content-center place-items-center w-[343px] h-full">
					<Typography type="copy4" onDark>
						{subtitle}
					</Typography>
				</div>
			) : null}
		</div>
	)
}

const RadioOptions = <T extends string>({
	title,
	options,
	value,
	onChange,
}: {
	title: string
	options: readonly T[]
	value?: T
	onChange?: (value: T) => void
}) => {
	return (
		<RadioGroup
			value={value}
			onChange={onChange}
			className="flex flex-col gap-2"
		>
			<RadioGroup.Label className="">
				<Typography
					type="copy4"
					className="text-center text-darker-copy-on-dark"
				>
					{title}
				</Typography>
			</RadioGroup.Label>
			<div className="flex p-px rounded-[10px] gap-1 border-divider-on-dark">
				{options.map((option) => (
					<RadioGroup.Option value={option} key={option}>
						{({ checked }) => (
							<div className="cursor-pointer">
								<div
									className={classNames(
										'text-center px-2.5 py-1.5 select-none rounded-lg transition-colors',
										checked
											? 'text-dark-background bg-white'
											: 'text-white hover:bg-white/10',
									)}
								>
									<Typography type="copy3" emphasis>
										{option}
									</Typography>
								</div>
							</div>
						)}
					</RadioGroup.Option>
				))}
			</div>
		</RadioGroup>
	)
}

export default PricingPage
