import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { NextPage } from 'next'
import Link from 'next/link'
import { InlineWidget } from 'react-calendly'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import Navbar from '../../components/common/Navbar/Navbar'
import { Section } from '../../components/common/Section/Section'
import { Typography } from '../../components/common/Typography/Typography'
import { CompaniesReel } from '../../components/Home/CompaniesReel/CompaniesReel'
import { CustomerReviewTrack } from '../../components/Home/CustomerReviewTrack'
import styles from '../../components/Home/Home.module.scss'

import { Dialog, Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid'
import * as Slider from '@radix-ui/react-slider'
import { Fragment, useState } from 'react'
import { HeadlessTooltip } from '../../components/Competitors/ComparisonTable'

import {
	HiOfficeBuilding,
	HiPuzzle,
	HiReceiptTax,
	HiServer,
} from 'react-icons/hi'

import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import {
	enterprisePrices,
	freePrices,
	Prices,
	professionalPrices,
	selfHostPrices,
} from '../../components/Pricing/estimator_details'

const PricingPage: NextPage = () => {
	const [estimatorCategory, setEstimatorCategory] = useState<
		'Professional' | 'Enterprise' | 'SelfHost'
	>('Professional')

	return (
		<div>
			<Navbar />
			<div className="w-full px-10 mx-auto my-24">
				<div className="flex flex-col items-center text-center">
					<h1 className="max-w-3xl">
						Get the{' '}
						<span className="text-highlight-yellow">
							visibility
						</span>{' '}
						you need today.
					</h1>
					<Typography type="copy1" className="my-5 text-copy-on-dark">
						Fair and transparent pricing that scales with any
						organization.
					</Typography>
				</div>
				<PlanTable setEstimatorCategory={setEstimatorCategory} />
			</div>
			<div className="text-center my-16 px-16" id="overage">
				<h2>Estimate your bill</h2>
				<Typography type="copy1" className="my-10 text-copy-on-dark">
					Each of our plans comes with a pre-defined usage quota, and
					if you exceed that quota, we charge an additional fee. For
					custom plans,{' '}
					<span className="inline-block">
						<CalendlyModal className="underline">
							reach out to us.
						</CalendlyModal>
					</span>
				</Typography>
			</div>
			<div className="my-16">
				<PriceCalculator
					pricingTier={priceTiers[estimatorCategory]}
					setEstimatorCategory={setEstimatorCategory}
				/>
			</div>

			<Section>
				<CompaniesReel />
			</Section>
			<Section>
				<div className={styles.anchorFeature}>
					<div className={styles.anchorHead}>
						<Typography type="copy2" onDark>
							Don&apos;t take our word.{' '}
							<Link href="/customers">
								Read our customer review section →
							</Link>
						</Typography>
					</div>
				</div>
			</Section>
			<CustomerReviewTrack />
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
type Retention = typeof retentionOptions[number]
const retentionMultipliers: Record<Retention, number> = {
	'30 days': 1,
	'3 months': 1,
	'6 months': 1.5,
	'1 year': 2,
	'2 years': 2.5,
} as const

const tierOptions = ['Free', 'Professional', 'Enterprise', 'SelfHost'] as const
type TierName = typeof tierOptions[number]

type PricingTier = {
	label: string
	id?: string
	subText?: string //PlanTier name, if not same as label
	prices: Prices
	icon: JSX.Element
	features: {
		feature: string
		tooltip?: string
	}[]
	calculateUsage?: boolean
	contactUs?: boolean
	buttonLabel: string
	buttonLink?: string
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
		contactUs: true,
		buttonLabel: 'Contact us',
		calculateUsage: true,
	},
	SelfHost: {
		label: 'Self-Host',
		id: 'SelfHost',
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

const PlanTable = ({
	setEstimatorCategory,
}: {
	setEstimatorCategory: (value: any) => void
}) => {
	return (
		<div className="flex flex-col items-center w-full gap-6 mx-auto mt-16">
			{/* Pricing */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 justify-center">
				{Object.entries(priceTiers).map(([name, tier]) => (
					<PlanTier
						tier={tier}
						key={name}
						setEstimatorCategory={setEstimatorCategory}
					/>
				))}
			</div>
			<div className="flex-shrink w-48" />
		</div>
	)
}

const PlanTier = ({
	tier,
	setEstimatorCategory,
}: {
	tier: PricingTier
	setEstimatorCategory: (value: any) => void
}) => {
	const { features, calculateUsage } = tier

	return (
		<div
			className={
				'flex flex-col flex-grow border rounded-md min-[1190px]:min-w-[255px] basis-64 border-divider-on-dark p-4'
			}
		>
			<div className="border-divider-on-dark pb-4">
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
			{tier.contactUs && (
				<CalendlyModal className="w-full">
					<PrimaryButton className="w-full bg-white text-dark-background rounded-md text-center py-1">
						Contact us
					</PrimaryButton>
				</CalendlyModal>
			)}

			{!tier.contactUs && (
				<PrimaryButton className="bg-white text-dark-background rounded-md text-center py-1">
					{tier.buttonLabel}
				</PrimaryButton>
			)}
			<div className="flex flex-col gap-2.5 flex-grow my-4">
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
			<div className="pt-4">
				{calculateUsage && (
					<PrimaryButton
						onClick={(e) => {
							setEstimatorCategory(tier.id || tier.label)
							e.preventDefault()
							document.querySelector('#overage')?.scrollIntoView({
								behavior: 'smooth',
							})
							window.history.pushState({}, '', `#overage`)
						}}
						href="#overage"
						className="w-full bg-dark-background border border-copy-on-dark text-copy-on-dark rounded-md text-center py-1 hover:bg-white hover:text-dark-background transition-colors"
					>
						<Typography type="copy3" emphasis>
							Estimate {tier.label.toLowerCase()} bill
						</Typography>
					</PrimaryButton>
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

const PriceCalculator = ({
	pricingTier,
	setEstimatorCategory,
}: {
	pricingTier: PricingTier
	setEstimatorCategory: (value: any) => void
}) => {
	const defaultErrors = pricingTier.prices.Errors.free
	const defaultLogs = pricingTier.prices.Logs.free
	const defaultTraces = pricingTier.prices.Traces.free
	const defaultSessions = pricingTier.prices.Sessions.free

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
		const cost = pricingTier.prices[product]
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

	const base = pricingTier.prices.monthlyPrice

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
				<div className="flex flex-col w-[320px] h-full border-y-[1px] border-l-[1px] border-divider-on-dark rounded-l-lg p-4 gap-4">
					<div className="w-full">
						<ListboxOptions
							options={
								setEstimatorCategory !== undefined
									? ['Professional', 'Enterprise', 'SelfHost']
									: ['']
							}
							value={pricingTier.label}
							onChange={setEstimatorCategory}
						/>
					</div>

					<div className="flex flex-col justify-end h-full gap-2 border-[1px] border-divider-on-dark rounded-lg p-2">
						<div className="flex flex-col gap-1">
							<div className="flex justify-between">
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
								>
									Plan base fee
								</Typography>
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
									emphasis
								>
									${base}
								</Typography>
							</div>
							<div className="flex justify-between">
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
								>
									Session usage fee
								</Typography>
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
									emphasis
								>
									${sessionsCost}
								</Typography>
							</div>

							<div className="flex justify-between">
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
								>
									Error usage fee
								</Typography>
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
									emphasis
								>
									${errorsCost}
								</Typography>
							</div>

							<div className="flex justify-between">
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
								>
									Logging usage fee
								</Typography>
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
									emphasis
								>
									${loggingCost}
								</Typography>
							</div>

							<div className="flex justify-between">
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
								>
									Tracing usage fee
								</Typography>
								<Typography
									type="copy3"
									className="text-darker-copy-on-dark"
									emphasis
								>
									${tracesCost}
								</Typography>
							</div>
						</div>
						<div className="w-full h-[1px] rounded-full bg-divider-on-dark" />
						<div className="flex justify-between">
							<Typography
								type="copy3"
								className="text-darker-copy-on-dark"
							>
								Total estimate
							</Typography>
							<Typography
								type="copy3"
								className="text-white"
								emphasis
							>
								{formatPrice(
									base +
										sessionsCost +
										tracesCost +
										loggingCost +
										errorsCost,
									'never',
								)}
							</Typography>
						</div>
					</div>
				</div>
				<div className="flex flex-col p-4 gap-4 overflow-hidden border rounded-r-lg md:rounded-br-none border-divider-on-dark">
					<CalculatorRowDesktop
						title="Session Replay"
						product={'Sessions'}
						value={sessionUsage}
						cost={sessionsCost}
						retention={sessionRetention}
						onChange={setSessionUsage}
						onChangeRetention={setSessionRetention}
					/>
					<CalculatorRowDesktop
						title="Error Monitoring"
						product={'Errors'}
						value={errorUsage}
						cost={errorsCost}
						rangeMultiplier={100}
						retention={errorRetention}
						onChange={setErrorUsage}
						onChangeRetention={setErrorRetention}
					/>
					<CalculatorRowDesktop
						title="Logging"
						product={'Logs'}
						value={loggingUsage}
						cost={loggingCost}
						rangeMultiplier={10000}
						retention="30 days"
						onChange={setLoggingUsage}
					/>
					<CalculatorRowDesktop
						title="Traces"
						product={'Traces'}
						value={tracesUsage}
						cost={tracesCost}
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
	product,
	value,
	cost,
	rangeMultiplier = 1,
	retention,
	onChange,
	onChangeRetention,
}: {
	title: string
	product: 'Sessions' | 'Errors' | 'Logs' | 'Traces'
	value: number
	cost: number
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

				<div className="flex justify-between">
					<ListboxOptions
						options={
							onChangeRetention !== undefined
								? ['3 months', '6 months', '1 year', '2 years']
								: ['30 days']
						}
						title="Retention: "
						value={retention}
						onChange={onChangeRetention}
					/>

					<div className="flex items-center gap-2">
						<Typography
							type="copy3"
							className="text-darker-copy-on-dark"
						>
							Monthly ingested {product.toLowerCase()}:
						</Typography>
						<Typography
							type="copy4"
							emphasis
							className="text-copy-on-dark border-[1px] border-copy-on-light rounded-full px-3 py-[2px]"
						>
							{value.toLocaleString(undefined, {
								notation: 'compact',
							})}
						</Typography>
					</div>
				</div>
			</div>
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
				step={200000}
				value={[denormalize(Math.pow(normalize(value), 1 / 3))]}
				onValueChange={([value]) =>
					value != null &&
					onChange(
						Math.ceil(denormalize(Math.pow(normalize(value), 3))),
					)
				}
				className="relative items-center hidden w-full h-12 select-none md:flex touch-none group cursor-pointer"
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

const ListboxOptions = <T extends string>({
	options,
	value,
	title,
	onChange,
}: {
	options: readonly T[]
	value?: T
	title?: string
	onChange?: (value: T) => void
}) => {
	return (
		<Listbox value={value} onChange={onChange}>
			<div className="relative">
				<Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-dark-background border-[1px] border-copy-on-light z-40 py-2 pl-3 pr-10 text-left focus:outline-none sm:text-sm">
					<span className="block truncate text-center">
						<Typography
							type="copy3"
							className="text-copy-on-dark"
							emphasis
						>
							{title || ''}
							{value}
						</Typography>
					</span>
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

const CalendlyModal = ({
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
										<InlineWidget
											url="https://calendly.com/d/2gt-rw5-qg5/highlight-demo-call"
											styles={{
												width: '100%',
												height: '100%',
											}}
										/>

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

export default PricingPage
