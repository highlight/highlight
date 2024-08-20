import { toast } from '@components/Toaster'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useGetCommentTagsForProjectQuery,
	useGetWorkspaceAdminsByProjectIdLazyQuery,
	useSendEmailSignupMutation,
} from '@graph/hooks'
import { SampleBuggyButton } from '@highlight-run/react'
import { Box } from '@highlight-run/ui/components'
import DO_NOT_USE_Canvas from '@pages/Buttons/Canvas'
import { SourcemapErrorDetails } from '@pages/ErrorsV2/SourcemapErrorDetails/SourcemapErrorDetails'
import { H } from 'highlight.run'
import { useEffect, useState } from 'react'

import Logo from '@/static/logo.png'
import analytics from '@/util/analytics'

import commonStyles from '../../Common.module.css'
import styles from './Buttons.module.css'
import {
	CustomError,
	DefaultError,
	NestedError,
	RandomError,
	WebSocketEvent,
} from './ButtonsHelper'

export const Buttons = () => {
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	const [hasError, setHasError] = useState(false)
	const [showWebSocket, setShowWebSocket] = useState(false)
	const [email, setEmail] = useState('')
	const [sendEmail, { loading }] = useSendEmailSignupMutation()
	if (hasError) {
		throw new Error('this is a buttons error', {
			cause: { location: window.location.toString(), foo: ['bar'] },
		})
	}
	const [getWorkspaceAdmins] = useGetWorkspaceAdminsByProjectIdLazyQuery({
		variables: { project_id: '1' },
		fetchPolicy: 'network-only',
	})
	const [showBadComponent, setShowBadComponent] = useState(false)
	const {} = useGetCommentTagsForProjectQuery({
		variables: { project_id: '1' },
	})

	useEffect(() => {
		const interval = window.setInterval(() => {
			const element = document.querySelector(`#shadowDOM`)!
			const shadow =
				element.shadowRoot || element.attachShadow({ mode: 'open' })
			shadow.innerHTML = element.innerHTML

			const chart = document.createElement('div')
			chart.innerHTML = `<div class="mp-highcharts-root" data-highcharts-chart="0" style="width: 100%; height: 100%; overflow: hidden;"><div id="highcharts-t354ssk-0" dir="ltr" class="highcharts-container " style="position: relative; overflow: hidden; width: 410px; height: 275px; text-align: left; line-height: normal; z-index: 0; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); user-select: none; touch-action: manipulation; outline: none; font-family: &quot;Apercu Pro&quot;, &quot;Helvetica Neue&quot;, Helvetica, Tahoma, Geneva, Arial, sans-serif;"><svg version="1.1" class="highcharts-root" style="font-family: &quot;Apercu Pro&quot;, &quot;Helvetica Neue&quot;, Helvetica, Tahoma, Geneva, Arial, sans-serif; font-size: 12px;" xmlns="http://www.w3.org/2000/svg" width="410" height="275" viewBox="0 0 410 275"><desc>Created with Highcharts 10.1.0</desc><defs><clipPath id="highcharts-t354ssk-1-"><rect x="0" y="0" width="350" height="236" fill="none"></rect></clipPath><clipPath id="highcharts-t354ssk-2-"><rect x="50" y="10" width="350" height="236" fill="none"></rect></clipPath><clipPath id="highcharts-t354ssk-33-"><rect x="0" y="0" width="350" height="236" fill="none"></rect></clipPath><clipPath id="highcharts-t354ssk-34-"><rect x="0" y="0" width="338" height="410" fill="none"></rect></clipPath><clipPath id="highcharts-t354ssk-35-"><rect x="338" y="0" width="12" height="410" fill="none"></rect></clipPath><clipPath id="highcharts-t354ssk-36-"><rect x="350" y="0" width="0" height="410" fill="none"></rect></clipPath></defs><rect fill="none" class="highcharts-background" x="0" y="0" width="410" height="275" rx="0" ry="0"></rect><rect fill="none" class="highcharts-plot-background" x="50" y="10" width="350" height="236"></rect><rect fill="none" class="highcharts-plot-border" data-z-index="1" x="50" y="10" width="350" height="236"></rect><g class="highcharts-grid highcharts-xaxis-grid" data-z-index="1"><path fill="none" stroke-dasharray="none" data-z-index="1" class="highcharts-grid-line" d="M 49.5 10 L 49.5 246" opacity="1"></path><path fill="none" stroke-dasharray="none" data-z-index="1" class="highcharts-grid-line" d="M 170.5 10 L 170.5 246" opacity="1"></path><path fill="none" stroke-dasharray="none" data-z-index="1" class="highcharts-grid-line" d="M 290.5 10 L 290.5 246" opacity="1"></path></g><g class="highcharts-grid highcharts-yaxis-grid" data-z-index="1"><path fill="none" stroke-dasharray="none" data-z-index="1" class="highcharts-grid-line" d="M 50 199.5 L 400 199.5" opacity="1"></path><path fill="none" stroke-dasharray="none" data-z-index="1" class="highcharts-grid-line" d="M 50 136.5 L 400 136.5" opacity="1"></path><path fill="none" stroke-dasharray="none" data-z-index="1" class="highcharts-grid-line" d="M 50 73.5 L 400 73.5" opacity="1"></path><path fill="none" stroke-dasharray="none" data-z-index="1" class="highcharts-grid-line" d="M 50 9.5 L 400 9.5" opacity="1"></path></g><g class="highcharts-axis highcharts-xaxis" data-z-index="2"><path fill="none" class="highcharts-tick" stroke="#ccd6eb" stroke-width="1" d="M 49.5 246 L 49.5 252" opacity="1"></path><path fill="none" class="highcharts-tick" stroke="#ccd6eb" stroke-width="1" d="M 170.5 246 L 170.5 252" opacity="1"></path><path fill="none" class="highcharts-tick" stroke="#ccd6eb" stroke-width="1" d="M 290.5 246 L 290.5 252" opacity="1"></path><path fill="none" class="highcharts-axis-line" stroke="#ccd6eb" stroke-width="1" data-z-index="7" d="M 50 246.5 L 400 246.5"></path></g><g class="highcharts-axis highcharts-yaxis" data-z-index="2"><path fill="none" class="highcharts-axis-line" data-z-index="7" d="M 50 10 L 50 246"></path></g><g class="highcharts-series-group" data-z-index="3"><g class="highcharts-series highcharts-series-0 highcharts-line-series" data-z-index="0.1" opacity="1" transform="translate(50,10) scale(1 1)" clip-path="url(#highcharts-t354ssk-33-)"><path fill="none" d="M 0 37.86567164178999 L 12.068965517241 40.7842217484 L 24.137931034483 44.53304904051001 L 36.206896551724 48.78507462687 L 48.275862068966 54.043496801710006 L 60.344827586207 60.257995735609995 L 72.413793103448 67.68017057569 L 84.48275862069 76.3855010661 L 96.551724137931 85.59402985074999 L 108.62068965517 95.15479744135999 L 120.68965517241 104.36332622601 L 132.75862068966 113.29509594883 L 144.8275862069 121.67334754797 L 156.89655172414 129.22132196162 L 168.96551724138 135.96417910448 L 181.03448275862 142.606396588486 L 193.10344827586 149.147974413646 L 205.1724137931 155.68955223880602 L 217.24137931034 162.130490405117 L 229.31034482759 168.72238805970102 L 241.37931034483 175.03752665245202 L 253.44827586207 181.12622601279298 L 265.51724137931 187.416204690832 L 277.58620689655 193.328784648188 L 289.65517241379 199.769722814499 L 301.72413793103 205.85842217484 L 313.79310344828 213.054157782516 L 325.86206896552 220.702771855011 L 337.93103448276 236 L 350 234.5407249466951" class="highcharts-graph" data-z-index="1" stroke="#7856FF" stroke-width="2" stroke-dasharray="none" visibility="hidden"></path><path fill="none" d="M 0 37.86567164178999 L 12.068965517241 40.7842217484 L 24.137931034483 44.53304904051001 L 36.206896551724 48.78507462687 L 48.275862068966 54.043496801710006 L 60.344827586207 60.257995735609995 L 72.413793103448 67.68017057569 L 84.48275862069 76.3855010661 L 96.551724137931 85.59402985074999 L 108.62068965517 95.15479744135999 L 120.68965517241 104.36332622601 L 132.75862068966 113.29509594883 L 144.8275862069 121.67334754797 L 156.89655172414 129.22132196162 L 168.96551724138 135.96417910448 L 181.03448275862 142.606396588486 L 193.10344827586 149.147974413646 L 205.1724137931 155.68955223880602 L 217.24137931034 162.130490405117 L 229.31034482759 168.72238805970102 L 241.37931034483 175.03752665245202 L 253.44827586207 181.12622601279298 L 265.51724137931 187.416204690832 L 277.58620689655 193.328784648188 L 289.65517241379 199.769722814499 L 301.72413793103 205.85842217484 L 313.79310344828 213.054157782516 L 325.86206896552 220.702771855011 L 337.93103448276 236 L 350 234.5407249466951" class="highcharts-graph highcharts-zone-graph-0" data-z-index="1" stroke="#7856FF" stroke-width="2" stroke-dasharray="none" clip-path="url(#highcharts-t354ssk-34-)"></path><path fill="none" d="M 0 37.86567164178999 L 12.068965517241 40.7842217484 L 24.137931034483 44.53304904051001 L 36.206896551724 48.78507462687 L 48.275862068966 54.043496801710006 L 60.344827586207 60.257995735609995 L 72.413793103448 67.68017057569 L 84.48275862069 76.3855010661 L 96.551724137931 85.59402985074999 L 108.62068965517 95.15479744135999 L 120.68965517241 104.36332622601 L 132.75862068966 113.29509594883 L 144.8275862069 121.67334754797 L 156.89655172414 129.22132196162 L 168.96551724138 135.96417910448 L 181.03448275862 142.606396588486 L 193.10344827586 149.147974413646 L 205.1724137931 155.68955223880602 L 217.24137931034 162.130490405117 L 229.31034482759 168.72238805970102 L 241.37931034483 175.03752665245202 L 253.44827586207 181.12622601279298 L 265.51724137931 187.416204690832 L 277.58620689655 193.328784648188 L 289.65517241379 199.769722814499 L 301.72413793103 205.85842217484 L 313.79310344828 213.054157782516 L 325.86206896552 220.702771855011 L 337.93103448276 236 L 350 234.5407249466951" class="highcharts-graph highcharts-zone-graph-1" data-z-index="1" stroke="#7856FF" stroke-width="2" stroke-dasharray="2,6" clip-path="url(#highcharts-t354ssk-35-)"></path><path fill="none" d="M 0 37.86567164178999 L 12.068965517241 40.7842217484 L 24.137931034483 44.53304904051001 L 36.206896551724 48.78507462687 L 48.275862068966 54.043496801710006 L 60.344827586207 60.257995735609995 L 72.413793103448 67.68017057569 L 84.48275862069 76.3855010661 L 96.551724137931 85.59402985074999 L 108.62068965517 95.15479744135999 L 120.68965517241 104.36332622601 L 132.75862068966 113.29509594883 L 144.8275862069 121.67334754797 L 156.89655172414 129.22132196162 L 168.96551724138 135.96417910448 L 181.03448275862 142.606396588486 L 193.10344827586 149.147974413646 L 205.1724137931 155.68955223880602 L 217.24137931034 162.130490405117 L 229.31034482759 168.72238805970102 L 241.37931034483 175.03752665245202 L 253.44827586207 181.12622601279298 L 265.51724137931 187.416204690832 L 277.58620689655 193.328784648188 L 289.65517241379 199.769722814499 L 301.72413793103 205.85842217484 L 313.79310344828 213.054157782516 L 325.86206896552 220.702771855011 L 337.93103448276 236 L 350 234.5407249466951" class="highcharts-graph highcharts-zone-graph-2" data-z-index="1" stroke="#7856FF" stroke-width="2" stroke-dasharray="none" clip-path="url(#highcharts-t354ssk-36-)"></path><path fill="none" d="M 0 37.86567164178999 L 12.068965517241 40.7842217484 L 24.137931034483 44.53304904051001 L 36.206896551724 48.78507462687 L 48.275862068966 54.043496801710006 L 60.344827586207 60.257995735609995 L 72.413793103448 67.68017057569 L 84.48275862069 76.3855010661 L 96.551724137931 85.59402985074999 L 108.62068965517 95.15479744135999 L 120.68965517241 104.36332622601 L 132.75862068966 113.29509594883 L 144.8275862069 121.67334754797 L 156.89655172414 129.22132196162 L 168.96551724138 135.96417910448 L 181.03448275862 142.606396588486 L 193.10344827586 149.147974413646 L 205.1724137931 155.68955223880602 L 217.24137931034 162.130490405117 L 229.31034482759 168.72238805970102 L 241.37931034483 175.03752665245202 L 253.44827586207 181.12622601279298 L 265.51724137931 187.416204690832 L 277.58620689655 193.328784648188 L 289.65517241379 199.769722814499 L 301.72413793103 205.85842217484 L 313.79310344828 213.054157782516 L 325.86206896552 220.702771855011 L 337.93103448276 236 L 350 234.5407249466951" data-z-index="2" class="highcharts-tracker-line" stroke-linecap="round" stroke-linejoin="round" stroke="rgba(192,192,192,0.0001)" stroke-width="22" style="cursor: pointer;"></path></g><g class="highcharts-markers highcharts-series-0 highcharts-line-series highcharts-tracker" data-z-index="0.1" opacity="1" transform="translate(50,10) scale(1 1)" clip-path="none" style="cursor: pointer;"></g></g><text x="205" text-anchor="middle" class="highcharts-title" data-z-index="4" style="color: rgb(51, 51, 51); font-size: 18px; fill: rgb(51, 51, 51);" y="24"></text><text x="205" text-anchor="middle" class="highcharts-subtitle" data-z-index="4" style="color: rgb(102, 102, 102); fill: rgb(102, 102, 102);" y="24"></text><text x="10" text-anchor="start" class="highcharts-caption" data-z-index="4" style="color: rgb(102, 102, 102); fill: rgb(102, 102, 102);" y="279"></text><g class="highcharts-axis-labels highcharts-xaxis-labels" data-z-index="7"><text x="50" text-anchor="middle" transform="translate(0,0)" y="265" opacity="1" style="color: rgb(102, 102, 102); cursor: default; font-size: 11px; fill: rgb(102, 102, 102);">&lt; 1 Day</text><text x="170.68965517241" text-anchor="middle" transform="translate(0,0)" y="265" opacity="1" style="color: rgb(102, 102, 102); cursor: default; font-size: 11px; fill: rgb(102, 102, 102);">Day 10</text><text x="291.37931034483" text-anchor="middle" transform="translate(0,0)" y="265" opacity="1" style="color: rgb(102, 102, 102); cursor: default; font-size: 11px; fill: rgb(102, 102, 102);">Day 20</text></g><g class="highcharts-axis-labels highcharts-yaxis-labels" data-z-index="7"><text x="35" text-anchor="end" transform="translate(0,0)" y="203" opacity="1" style="color: rgb(102, 102, 102); cursor: default; font-size: 11px; fill: rgb(102, 102, 102);">25%</text><text x="35" text-anchor="end" transform="translate(0,0)" y="140" opacity="1" style="color: rgb(102, 102, 102); cursor: default; font-size: 11px; fill: rgb(102, 102, 102);">50%</text><text x="35" text-anchor="end" transform="translate(0,0)" y="77" opacity="1" style="color: rgb(102, 102, 102); cursor: default; font-size: 11px; fill: rgb(102, 102, 102);">75%</text><text x="35" text-anchor="end" transform="translate(0,0)" y="15" opacity="1" style="color: rgb(102, 102, 102); cursor: default; font-size: 11px; fill: rgb(102, 102, 102);">100%</text></g><g class="highcharts-control-points" data-z-index="99" clip-path="url(#highcharts-t354ssk-2-)"></g></svg></div></div>`

			const id = `id-${Math.random() * 1000}`
			shadow.querySelector(
				'#shadowNumber',
			)!.innerHTML = `<span id="${id}">special ${id}</span>`

			let nestedShadow: ShadowRoot = shadow
			for (let i = 0; i < 3; i++) {
				nestedShadow = nestedShadow
					.appendChild(document.createElement('div'))
					.attachShadow({ mode: 'open' })
				nestedShadow.innerHTML = `<a href="https://highlight.io/docs"> blog</a>`
				const a = nestedShadow.appendChild(document.createElement('a'))
				a.id = `id-${Math.random() * 1000}`
				a.href = 'https://highlight.io/docs'
				a.title = 'yo'
				a.target = '_blank'
				a.rel = 'noopener noreferrer'
				a.innerText = `link #${i}`
				a.appendChild(chart)

				const frag = new DocumentFragment()
				for (let j = 0; j < 3; j++) {
					const div = frag
						.appendChild(document.createElement('div'))
						.attachShadow({ mode: 'closed' })
					const a2 = document.createElement('a')
					a2.id = `id-${Math.random() * 1000}`
					a2.href = 'https://highlight.io/docs'
					a2.innerText = `shadow #${j}`
					div.appendChild(a2)
				}
				a.appendChild(frag)
			}
		}, 1000)
		return () => {
			window.clearInterval(interval)
		}
	}, [])

	const messageListener = (message: MessageEvent) => {
		console.log('Highlight[iframe]', { eventData: message.data })
	}
	useEffect(() => {
		window.addEventListener('message', messageListener)
		return () => window.removeEventListener('message', messageListener)
	}, [])

	return (
		<div className={styles.container}>
			<div className={styles.buttonBody}>
				<i className="mdi mdi-progress-check mdi-48px"></i>
				<iframe
					title="Introducing Superhuman"
					src="https://www.youtube.com/embed/JMsFfX6qTNI?rel=0"
					style={{ zIndex: 100 }}
				/>
				<iframe
					title="Highlight Landing"
					src={
						import.meta.env.DEV
							? 'http://localhost:4000/'
							: 'https://www.highlight.io/'
					}
					height={300}
					width={600}
					style={{ zIndex: 100 }}
				/>
				<div className="highlight-mask">
					This is masked. <img src={Logo} height={16} alt="masked" />
				</div>
				<div className="highlight-block">
					This is blocked.{' '}
					<img src={Logo} height={16} alt="blocked" />
				</div>
				<div className="highlight-ignore">
					This is ignored.{' '}
					<img src={Logo} height={16} alt="ignored" />
				</div>
				<button
					onClick={() => {
						for (const id of ['1', '2', '3']) {
							const elem = document.getElementById(`email-${id}`)!
							elem.innerText = `${(Math.random() + 1)
								.toString(36)
								.substring(7)} test@test.com ${(
								Math.random() + 1
							)
								.toString(36)
								.substring(7)}`
						}
						setEmail(
							`${(Math.random() + 1)
								.toString(36)
								.substring(7)} test@test.com ${(
								Math.random() + 1
							)
								.toString(36)
								.substring(7)}`,
						)
					}}
				>
					set email
				</button>
				<div>
					<b>hello, this is a b tag</b>
					<b key="email-1">{email}</b>
					<b id="email-1"></b>
				</div>
				<div>
					<b>hello, this is a b tag</b>
					<b key="email-2" data-hl-record>
						{email}
					</b>
					<b data-hl-record id="email-2"></b>
				</div>
				<div data-hl-record>
					<b>hello, this is a b tag</b>
					<b key="email-3">{email}</b>
					<b id="email-3"></b>
				</div>
			</div>
			<section id="shadowDOM" className="foo" title="yo">
				This is the shadow DOM.
				<div>
					hey
					<span>
						world<button>yo</button>
					</span>
					<span id="shadowNumber">123</span>
				</div>
			</section>
			<div className={styles.buttonBody}>
				<div>
					<button
						onClick={() => {
							setShowBadComponent(true)
						}}
					>
						Show Error Boundary
					</button>
					{showBadComponent && <BadComponent />}
				</div>
				<DO_NOT_USE_Canvas />
				<div>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							sendEmail({
								variables: {
									email: 'anothernewemail@newemail.com',
								},
							})
						}}
					>
						{loading ? 'loading...' : 'Send an email'}
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							setShowWebSocket((p) => !p)
						}}
					>
						Toggle WebSocket Event
					</button>
					{showWebSocket && <WebSocketEvent />}
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							DefaultError()
						}}
					>
						Throw an Error
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							RandomError()
						}}
					>
						Throw a randomized Error
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							NestedError('outer error')
						}}
					>
						Throw a nested Error
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							NestedError('outer error 2')
						}}
					>
						Throw a different nested error
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							console.error('boba')
						}}
					>
						Console Error
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							toast.success('Event has been created')
						}}
					>
						Toast
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={async () => {
							const p = (
								resolve: (value: void) => void,
								reject: (reason?: any) => void,
							) => {
								const rng = Math.random()
								if (rng < 0.2) {
									throw new Error(
										'third uncaught error in promise',
									)
								} else if (rng < 0.4) {
									return reject('what the')
								} else if (rng < 0.6) {
									return reject(new Error('oh my'))
								} else if (rng < 0.8) {
									return reject()
								}
								return resolve()
							}

							const promises = []
							for (let i = 0; i < 100; i++) {
								// unhandled promise rejection
								new Promise<void>(p)
								promises.push(new Promise<void>(p))
							}
							await Promise.allSettled(promises)
						}}
					>
						Async Error
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							setHasError(true)
						}}
					>
						H.consumeError()
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							H.consumeError(
								new Error('Highlight H.consumeError', {
									cause: {
										location: window.location.toString(),
										foo: 'bar',
									},
								}),
							)
						}}
					>
						H.error()
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							CustomError()
						}}
					>
						Throw a custom Error
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							analytics.track('foo')
						}}
					>
						analytics.track('foo')
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							H.track('bar')
						}}
					>
						H.track('bar')
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							H.stop()
						}}
					>
						Stop Recording
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							H.start({ forceNew: true })
						}}
					>
						H.Start force new session
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							H.track(
								'therewasonceahumblebumblebeeflyingthroughtheforestwhensuddenlyadropofwaterfullyencasedhimittookhimasecondtofigureoutthathesinaraindropsuddenlytheraindrophitthegroundasifhewasdivingintoapoolandheflewawaywithnofurtherissues',
							)
						}}
					>
						Track
					</button>
					<SampleBuggyButton />
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							H.track('thisIsLong', {
								longProperty:
									'This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. This is a long property over 2000 characters. We are going to truncate this on the client side so that we can log to our customers so they know why these long properties are getting truncated. ',
							})
						}}
					>
						Really long track property
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							const controller = new AbortController()
							setTimeout(() => controller.abort(), 1000)

							fetch(
								'https://javascript.info/article/fetch-abort/demo/hang',
								{
									signal: controller.signal,
								},
							).catch(() => {
								console.log('abort caught!')
							})
						}}
					>
						Abort!
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							H.track('thisIsInvalid', {
								// @ts-expect-error
								invalidProperty: { nestedProperty: true },
							})
						}}
					>
						Invalid type track property
					</button>
					<button
						className={commonStyles.submitButton}
						onClick={() => {
							getWorkspaceAdmins()
						}}
					>
						Private Graph Request
					</button>
				</div>
				<div>
					<button
						onClick={() => {
							fetch('https://pokeapi.co/api/v2/pokemon/ditto', {
								headers: {
									'Content-Type': 'application/json',
								},
							})
						}}
					>
						GET fetch('https://pokeapi.co/api/v2/pokemon/ditto')
					</button>
					<button
						onClick={() => {
							fetch('https://pokeapi.co/api/v2/pokemon/ditto', {
								headers: {
									'Content-Type': 'application/json',
									Authorization:
										'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
									Cookie: 'PHPSESSID=298zf09hf012fh2; csrftoken=u32t4o3tb3gg43; _gat=1',
									'Proxy-Authorization':
										'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
								},
							})
						}}
					>
						GET fetch('https://pokeapi.co/api/v2/pokemon/ditto')
						with sensitive headers
					</button>
					<button
						onClick={() => {
							fetch('https://pokeapi.co/api/v2/pokemon/ditto', {
								headers: {
									'Content-Type': 'application/json',
								},
								method: 'POST',
								body: '{"code":"SDFSDF"}',
							})
						}}
					>
						POST fetch('https://pokeapi.co/api/v2/pokemon/ditto')
					</button>
					<button
						onClick={() => {
							const http = new XMLHttpRequest()
							const url =
								'https://pokeapi.co/api/v2/pokemon/ditto'
							const params = '{"code":"SDFSDF"}'
							http.open('POST', url, true)

							//Send the proper header information along with the request
							http.setRequestHeader(
								'Content-type',
								'application/json',
							)

							http.onreadystatechange = function () {
								//Call a function when the state changes.
								if (
									http.readyState == 4 &&
									http.status == 200
								) {
									alert(http.responseText)
								}
							}
							http.send(params)
						}}
					>
						POST xhr('https://pokeapi.co/api/v2/pokemon/ditto')
					</button>
					<button
						onClick={async () => {
							await fetch('https://github.com/api')
						}}
					>
						GET fetch('https://github.com/api')
					</button>
				</div>
				<div>
					<button
						onClick={() => {
							const methods = [
								'assert',
								'count',
								'countReset',
								'debug',
								'dir',
								'dirxml',
								'error',
								'group',
								'groupCollapsed',
								'groupEnd',
								'info',
								'log',
								'table',
								'time',
								'timeEnd',
								'timeLog',
								'trace',
								'warn',
							]

							methods.forEach((method) => {
								// @ts-expect-error
								console[method]('HELLO WORLD')
							})
						}}
					>
						Console Log
					</button>
				</div>
			</div>

			<div className={styles.sourcemapErrors}>
				<h2>Sourcemap Errors UI</h2>

				<Box mb="24">
					<h3>Sourcemap_File_Missing_In_S3_And_URL</h3>
					<SourcemapErrorDetails
						error={
							Sourcemap_File_Missing_In_S3_And_URL.sourceMappingErrorMetadata
						}
					/>
				</Box>

				<Box mb="24">
					<h3>Missing_Source_Map_File_In_S3</h3>
					<SourcemapErrorDetails
						error={
							Missing_Source_Map_File_In_S3.sourceMappingErrorMetadata
						}
					/>
				</Box>

				<Box mb="24">
					<h3>File_Name_Missing_From_Source_Path</h3>
					<SourcemapErrorDetails
						error={
							File_Name_Missing_From_Source_Path.sourceMappingErrorMetadata
						}
					/>
				</Box>

				<Box mb="24">
					<h3>Error_Parsing_Stack_Trace_File_Url</h3>
					<SourcemapErrorDetails
						error={
							Error_Parsing_Stack_Trace_File_Url.sourceMappingErrorMetadata
						}
					/>
				</Box>

				<Box mb="24">
					<h3>Minified_File_Missing_In_S3_And_URL</h3>
					<SourcemapErrorDetails
						error={
							Minified_File_Missing_In_S3_And_URL.sourceMappingErrorMetadata
						}
					/>
				</Box>

				<Box mb="24">
					<h3>Minified_File_Larger</h3>
					<SourcemapErrorDetails
						error={Minified_File_Larger.sourceMappingErrorMetadata}
					/>
				</Box>

				<Box mb="24">
					<h3>Source_Map_File_Larger</h3>
					<SourcemapErrorDetails
						error={
							Source_Map_File_Larger.sourceMappingErrorMetadata
						}
					/>
				</Box>

				<Box mb="24">
					<h3>Invalid_SourceMapURL</h3>
					<SourcemapErrorDetails
						error={Invalid_SourceMapURL.sourceMappingErrorMetadata}
					/>
				</Box>

				<Box mb="24">
					<h3>Sourcemap_Library_Couldnt_Parse</h3>
					<SourcemapErrorDetails
						error={
							Sourcemap_Library_Couldnt_Parse.sourceMappingErrorMetadata
						}
					/>
				</Box>

				<Box mb="24">
					<h3>Sourcemap_Library_Couldnt_Retrieve_Source</h3>
					<SourcemapErrorDetails
						error={
							Sourcemap_Library_Couldnt_Retrieve_Source.sourceMappingErrorMetadata
						}
					/>
				</Box>

				<Box mb="24">
					<Box display="flex">
						{[
							'asdf',
							'highlight-mask',
							'highlight-block',
							'highlight-ignored',
						].map((c) => (
							<Box
								key={c}
								display="flex"
								flexDirection="column"
								cssClass={c}
								id={`video-test-${c}`}
								data-id={`video-test-${c}`}
							>
								<span>class `{c}`</span>
								<video
									controls={true}
									width="250"
									className={`asdf-${c}`}
								>
									<source
										src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
										type="video/webm"
									/>
									<source
										src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
										type="video/mp4"
									/>
								</video>
							</Box>
						))}
					</Box>
				</Box>

				<Box width="full" style={{ height: 200 }}>
					<div
						style={{
							backgroundImage:
								'url("https://www.highlight.io/images/quickstart/react.svg")',
							height: '24%',
						}}
					></div>
					<div
						style={{
							backgroundImage:
								'url("https://www.highlight.io/images/quickstart/react.svg")',
						}}
					></div>
				</Box>
			</div>
		</div>
	)
}

const BadComponent = () => (
	<div>
		{/* @ts-expect-error */}
		{badVariableAccess}
	</div>
)

const File_Name_Missing_From_Source_Path = {} as any

const Error_Parsing_Stack_Trace_File_Url = {} as any

const Minified_File_Missing_In_S3_And_URL = {
	fileName:
		'https://btloader.com/recovery?w=5170702742192128\u0026upapi=true',
	lineNumber: 4,
	functionName: '_s',
	columnNumber: 221192,
	error: 'error fetching file: https://btloader.com/recovery: status code not OK',
	sourceMappingErrorMetadata: {
		errorCode: 'Minified_File_Missing_In_S3_And_URL',
		stackTraceFileURL: 'https://btloader.com/recovery',
		sourcemapFetchStrategy: null,
		sourceMapURL: null,
		minifiedFetchStrategy: 'S3 and URL',
		actualMinifiedFetchedPath: 'recovery',
		minifiedLineNumber: null,
		minifiedColumnNumber: null,
		actualSourcemapFetchedPath: null,
		sourcemapFileSize: null,
		minifiedFileSize: null,
		mappedLineNumber: null,
		mappedColumnNumber: null,
	},
	lineContent: null,
	linesBefore: null,
	linesAfter: null,
} as any

const Minified_File_Larger = {} as any

const Source_Map_File_Larger = {} as any

const Invalid_SourceMapURL = {} as any

const Sourcemap_Library_Couldnt_Parse = {
	fileName: 'https://app.highlight.io/assets/index.e1f78689.js',
	lineNumber: 57,
	functionName: 'new yl',
	columnNumber: 196,
	error: "error parsing fetched source map: https://app.highlight.io/assets/index.e1f78689.js.map - \u003cnil\u003e, invalid character '\u003c' looking for beginning of value: invalid character '\u003c' looking for beginning of value",
	sourceMappingErrorMetadata: {
		errorCode: 'Sourcemap_Library_Couldnt_Parse',
		stackTraceFileURL: 'https://app.highlight.io/assets/index.e1f78689.js',
		sourcemapFetchStrategy: 'URL',
		sourceMapURL: 'https://app.highlight.io/assets/index.e1f78689.js.map',
		minifiedFetchStrategy: 'S3',
		actualMinifiedFetchedPath: 'assets/index.e1f78689.js',
		minifiedLineNumber: null,
		minifiedColumnNumber: null,
		actualSourcemapFetchedPath: 'assets/index.e1f78689.js.map',
		sourcemapFileSize: null,
		minifiedFileSize: 8676204,
		mappedLineNumber: null,
		mappedColumnNumber: null,
	},
	lineContent: null,
	linesBefore: null,
	linesAfter: null,
} as any

const Sourcemap_Library_Couldnt_Retrieve_Source = {
	fileName: 'https://app.posthog.com/static/recorder.js?v=1.36.0',
	lineNumber: 32,
	functionName: 'console.error',
	columnNumber: 9367,
	error: 'error extracting true error info from source map: https://app.posthog.com/static/recorder.js.map',
	sourceMappingErrorMetadata: {
		errorCode: 'Sourcemap_Library_Couldnt_Retrieve_Source',
		stackTraceFileURL: 'https://app.posthog.com/static/recorder.js',
		sourcemapFetchStrategy: 'S3',
		sourceMapURL: 'https://app.posthog.com/static/recorder.js.map',
		minifiedFetchStrategy: 'S3',
		actualMinifiedFetchedPath: 'static/recorder.js',
		minifiedLineNumber: null,
		minifiedColumnNumber: null,
		actualSourcemapFetchedPath: 'static/recorder.js.map',
		sourcemapFileSize: 251509,
		minifiedFileSize: 62577,
		mappedLineNumber: 32,
		mappedColumnNumber: 9367,
	},
	lineContent: null,
	linesBefore: null,
	linesAfter: null,
} as any

const Sourcemap_File_Missing_In_S3_And_URL = {
	fileName: 'https://widget.ybug.io/button/k2cyfzgsn9ha9xr2qsx0.js',
	lineNumber: 1,
	functionName: 'e.\u003ccomputed\u003e [as error]',
	columnNumber: 6914,
	error: 'error fetching source map file: https://widget.ybug.io/button/k2cyfzgsn9ha9xr2qsx0.js.map: status code not OK',
	sourceMappingErrorMetadata: {
		errorCode: 'Sourcemap_File_Missing_In_S3_And_URL',
		stackTraceFileURL:
			'https://widget.ybug.io/button/k2cyfzgsn9ha9xr2qsx0.js',
		sourcemapFetchStrategy: 'S3 and URL',
		sourceMapURL:
			'https://widget.ybug.io/button/k2cyfzgsn9ha9xr2qsx0.js.map',
		minifiedFetchStrategy: 'S3',
		actualMinifiedFetchedPath: 'button/k2cyfzgsn9ha9xr2qsx0.js',
		minifiedLineNumber: null,
		minifiedColumnNumber: null,
		actualSourcemapFetchedPath: 'button/k2cyfzgsn9ha9xr2qsx0.js.map',
		sourcemapFileSize: null,
		minifiedFileSize: 22040,
		mappedLineNumber: null,
		mappedColumnNumber: null,
	},
	lineContent: null,
	linesBefore: null,
	linesAfter: null,
} as any

const Missing_Source_Map_File_In_S3 = {
	fileName: 'webpack-internal:///./pages/joinBeta.jsx',
	lineNumber: 655,
	functionName: 'eval',
	columnNumber: 64,
	error: 'error fetching file: webpack-internal:///./pages/joinBeta.jsx: error getting source file: Get "webpack-internal:///./pages/joinBeta.jsx": unsupported protocol scheme "webpack-internal"',
	sourceMappingErrorMetadata: {
		errorCode: 'Minified_File_Missing_In_S3_And_URL',
		stackTraceFileURL: 'webpack-internal:///./pages/joinBeta.jsx',
		sourcemapFetchStrategy: null,
		sourceMapURL: null,
		minifiedFetchStrategy: 'S3 and URL',
		actualMinifiedFetchedPath: './pages/joinBeta.jsx',
		minifiedLineNumber: null,
		minifiedColumnNumber: null,
		actualSourcemapFetchedPath: null,
		sourcemapFileSize: null,
		minifiedFileSize: null,
		mappedLineNumber: null,
		mappedColumnNumber: null,
	},
	lineContent: null,
	linesBefore: null,
	linesAfter: null,
} as any

export default Buttons
