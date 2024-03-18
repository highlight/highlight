import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { NextPage } from 'next'
import Link from 'next/link'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import Navbar from '../../components/common/Navbar/Navbar'
import { Typography } from '../../components/common/Typography/Typography'

import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import * as Slider from '@radix-ui/react-slider'
import { Fragment, useState } from 'react'
import { HeadlessTooltip } from '../../components/Competitors/ComparisonTable'

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

const PricingPage: NextPage = () => {
	const [estimatorCategory, setEstimatorCategory] = useState(
		priceTiers.Professional,
	)

	return (
		<div>
			<Navbar />
			<div className="flex flex-col w-full px-10 mx-auto my-24">
				<div className="flex flex-col items-center text-center gap-9">
					<h1 className="max-w-3xl my-0">Pricing plans</h1>
				</div>
				<PlanTable />
			</div>
			<div
				className="flex flex-col items-center my-32 text-center gap-9"
				id="overage"
			>
				{/* Pay as you go */}
				<h2>
					Pay{' '}
					<span className="text-highlight-yellow">as you go.</span>
				</h2>
				<Typography type="copy1" onDark className="max-w-4xl">
					After reaching the free tier limits, we charge an additional
					usage-based fee for each product. The $50 base fee unlocks
					discounted volume pricing automatically. For custom plans,{' '}
					<a href="mailto:sales@highlight.io">reach out to us</a>.
				</Typography>
			</div>
			<PriceCalculator
				prices={estimatorCategory.prices}
				setEstimatorCategory={setEstimatorCategory}
			/>
			<FooterCallToAction />
			<Footer />
		</div>
	)
}

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
			<div className="p-4"></div>
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

const PriceCalculator = ({
	prices,
	setEstimatorCategory,
}: {
	prices: Prices
	setEstimatorCategory: (value: PricingTier) => void
}) => {
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
		<div className="flex justify-center w-full">
			{/* Price calculator */}
			<div className="flex items-center">
				<div className="flex flex-col p-4 gap-4 overflow-hidden border rounded-r-lg md:rounded-br-none border-divider-on-dark">
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
		<div className="flex border border-divider-on-dark rounded-lg">
			<div className="flex flex-col flex-1 gap-1 p-3 w-[920px]">
				<Typography
					type="copy4"
					emphasis
					className="rounded-full bg-blue-cta text-dark-background self-start inline-block md:hidden"
				>
					{formatPrice(cost)}
				</Typography>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-3">
						<RadioOptions
							title="Retention"
							options={
								onChangeRetention !== undefined
									? [
											'3 months',
											'6 months',
											'1 year',
											'2 years',
									  ]
									: ['30 days']
							}
							value={retention}
							onChange={onChangeRetention}
						/>
						<Typography type="copy3" emphasis>
							{title}
						</Typography>
					</div>
					<Typography type="copy2" emphasis>
						${cost}
					</Typography>
				</div>
				<RangedInput
					options={rangeOptions}
					value={value}
					unit={product}
					onChange={onChange}
				/>
			</div>
			{/* <div className="hidden border-l border-divider-on-dark md:inline-block"> */}
			{/* 	<CalculatorCostDisplay */}
			{/* 		heading="Usage (Monthly)" */}
			{/* 		cost={cost} */}
			{/* 		rate={{ */}
			{/* 			value: rate, */}
			{/* 			unit: prices[product].unit, */}
			{/* 			product, */}
			{/* 		}} */}
			{/* 	/> */}
			{/* </div> */}
		</div>
	)
}

const RangedInput = ({
	options,
	value,
	unit,
	onChange,
}: {
	options: number[]
	value: number
	unit: string
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
				className="relative items-center hidden w-full h-12 select-none md:flex touch-none group"
			>
				<Slider.Track className="relative flex-1 h-3 overflow-hidden rounded-full bg-divider-on-dark">
					<div
						className="absolute inset-y-0 left-0 h-full bg-white"
						style={{
							width: `${
								Math.pow(normalize(value), 1 / 3) * 100
							}%`,
						}}
					/>
				</Slider.Track>
				<Slider.Thumb className="relative w-6 h-6 border-[4px] hover:shadow-white/25 hover:shadow-[0_0_0_4px] outline-none bg-[#F5F5F5] border-dark-background rounded-full flex flex-col items-center transition-all" />
			</Slider.Root>
			<div className="flex items-center gap-2">
				<Typography
					type="copy4"
					emphasis
					className="text-copy-on-dark border-[1px] border-copy-on-light rounded-full px-3 py-[2px]"
				>
					{value.toLocaleString(undefined, {
						notation: 'compact',
					})}
				</Typography>
				<Typography type="copy3" className="text-darker-copy-on-dark">
					ingested {unit.toLowerCase()} per month
				</Typography>
			</div>
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
		<Listbox value={value} onChange={onChange}>
			<div className="relative">
				<Listbox.Button className="relative cursor-pointer rounded-lg bg-dark-background border-[1px] border-copy-on-light z-40 py-2 pl-3 pr-10 text-left focus:outline-none sm:text-sm">
					<span className="block truncate">{value}</span>
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
					<Listbox.Options className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-dark-background border border-copy-on-light py-1 sm:text-sm">
						{options.map((option, optionIdx) => (
							<Listbox.Option
								key={optionIdx}
								className={({ active }) =>
									`relative cursor-pointer select-none py-2 px-4 ${
										active
											? 'text-white font-bold'
											: 'text-copy-on-dark'
									}`
								}
								value={option}
							>
								{({ selected }) => (
									<>
										<span
											className={`block truncate ${
												selected
													? 'font-semibold'
													: 'font-normal'
											}`}
										>
											{option}
										</span>
									</>
								)}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</div>
		</Listbox>
	)
}

export default PricingPage
