import {
	isWrapped,
	InstrumentationBase,
	InstrumentationConfig,
} from '@opentelemetry/instrumentation'

import * as api from '@opentelemetry/api'
import { getElementXPath } from '@opentelemetry/sdk-trace-web'
import {
	EventName,
	ShouldPreventSpanCreation,
	UserInteractionInstrumentationConfig,
} from '@opentelemetry/instrumentation-user-interaction'
import { SpanData } from '@opentelemetry/instrumentation-user-interaction/build/src/internal-types'

const DEFAULT_EVENT_NAMES = ['click', 'input', 'submit'] as const

function defaultShouldPreventSpanCreation() {
	return false
}

/**
 * This class represents a UserInteraction plugin for auto instrumentation. It
 * was pulled from the user contributed otel library and modified to work with
 * the Highlight SDK.
 */
export class UserInteractionInstrumentation extends InstrumentationBase {
	private _spansData = new WeakMap<api.Span, SpanData>()
	// for addEventListener/removeEventListener state
	private _wrappedListeners = new WeakMap<
		Function | EventListenerObject,
		Map<string, Map<HTMLElement, Function>>
	>()
	// for event bubbling
	private _eventsSpanMap: WeakMap<Event, api.Span> = new WeakMap<
		Event,
		api.Span
	>()
	private _eventNames: Set<EventName>
	private _shouldPreventSpanCreation: ShouldPreventSpanCreation

	constructor(config: UserInteractionInstrumentationConfig = {}) {
		super('user-interaction', '1.0.0', config)
		this._eventNames = new Set(
			(config?.eventNames ?? DEFAULT_EVENT_NAMES) as EventName[],
		)
		this._shouldPreventSpanCreation =
			typeof config?.shouldPreventSpanCreation === 'function'
				? config.shouldPreventSpanCreation
				: defaultShouldPreventSpanCreation
	}

	init() {}

	/**
	 * Controls whether or not to create a span, based on the event type.
	 */
	protected _allowEventName(eventName: EventName): boolean {
		return this._eventNames.has(eventName)
	}

	/**
	 * Creates a new span
	 * @param event
	 * @param parentSpan
	 */
	private _createSpan(
		event: Event | undefined,
		parentSpan?: api.Span,
	): api.Span | undefined {
		const element = event?.target
		const eventName = event?.type as EventName

		if (!(element instanceof HTMLElement)) {
			return undefined
		}
		if (!element.getAttribute) {
			return undefined
		}
		if (element.hasAttribute('disabled')) {
			return undefined
		}
		if (!this._allowEventName(eventName)) {
			return undefined
		}
		const xpath = getElementXPath(element, true)
		try {
			const span = this.tracer.startSpan(
				eventName,
				{
					attributes: {
						['event.type']: eventName,
						['event.tag']: element.tagName,
						['event.xpath']: xpath,
						['event.id']: element.id,
						['event.text']: element.textContent ?? '',
						['event.url']: window.location.href,
						['viewport.width']: window.innerWidth,
						['viewport.height']: window.innerHeight,
					},
				},
				parentSpan
					? api.trace.setSpan(api.context.active(), parentSpan)
					: undefined,
			)

			if (event instanceof MouseEvent) {
				span.setAttribute('event.x', event.clientX)
				span.setAttribute('event.y', event.clientY)

				span.setAttribute(
					'event.relativeX',
					event.clientX / window.innerWidth,
				)
				span.setAttribute(
					'event.relativeY',
					event.clientY / window.innerHeight,
				)

				if (eventName === 'scroll') {
					span.setAttribute('event.scrollX', window.scrollX)
					span.setAttribute('event.scrollY', window.scrollY)
				}
			}

			if (
				this._shouldPreventSpanCreation(eventName, element, span) ===
				true
			) {
				return undefined
			}

			this._spansData.set(span, {
				taskCount: 0,
			})

			return span
		} catch (e) {
			this._diag.error(
				'failed to start create new user interaction span',
				e,
			)
		}
		return undefined
	}

	/**
	 * Returns true iff we should use the patched callback; false if it's already been patched
	 */
	private addPatchedListener(
		on: HTMLElement,
		type: string,
		listener: Function | EventListenerObject,
		wrappedListener: Function,
	): boolean {
		let listener2Type = this._wrappedListeners.get(listener)
		if (!listener2Type) {
			listener2Type = new Map()
			this._wrappedListeners.set(listener, listener2Type)
		}
		let element2patched = listener2Type.get(type)
		if (!element2patched) {
			element2patched = new Map()
			listener2Type.set(type, element2patched)
		}
		if (element2patched.has(on)) {
			return false
		}
		element2patched.set(on, wrappedListener)
		return true
	}

	/**
	 * Returns the patched version of the callback (or undefined)
	 */
	private removePatchedListener(
		on: HTMLElement,
		type: string,
		listener: Function | EventListenerObject,
	): Function | undefined {
		const listener2Type = this._wrappedListeners.get(listener)
		if (!listener2Type) {
			return undefined
		}
		const element2patched = listener2Type.get(type)
		if (!element2patched) {
			return undefined
		}
		const patched = element2patched.get(on)
		if (patched) {
			element2patched.delete(on)
			if (element2patched.size === 0) {
				listener2Type.delete(type)
				if (listener2Type.size === 0) {
					this._wrappedListeners.delete(listener)
				}
			}
		}
		return patched
	}

	// utility method to deal with the Function|EventListener nature of addEventListener
	private _invokeListener(
		listener: Function | EventListenerObject,
		target: any,
		args: any[],
	): any {
		if (typeof listener === 'function') {
			return listener.apply(target, args)
		} else {
			return listener.handleEvent(args[0])
		}
	}

	/**
	 * This patches the addEventListener of HTMLElement to be able to
	 * auto instrument the click events
	 */
	private _patchAddEventListener() {
		const plugin = this
		let lastEventTimestamp = 0

		return (original: EventTarget['addEventListener']) => {
			return function addEventListenerPatched(
				this: HTMLElement,
				type: keyof HTMLElementEventMap,
				listener: EventListenerOrEventListenerObject | null,
				useCapture?: boolean | AddEventListenerOptions,
			) {
				// Forward calls with listener = null
				if (!listener) {
					return original.call(this, type, listener, useCapture)
				}

				// filter out null (typeof null === 'object')
				const once =
					useCapture &&
					typeof useCapture === 'object' &&
					useCapture.once
				const patchedListener = function (
					this: HTMLElement,
					...args: any[]
				) {
					let parentSpan: api.Span | undefined
					const event: Event | undefined = args[0]

					// Don't capture mousemove events too frequently
					if (
						event?.type === 'mousemove' &&
						Date.now() - lastEventTimestamp < 1000 / 60
					) {
						return original.call(this, type, listener, useCapture)
					}

					lastEventTimestamp = Date.now()

					if (event) {
						parentSpan = plugin._eventsSpanMap.get(event)
					}
					if (once) {
						plugin.removePatchedListener(this, type, listener)
					}
					const span = plugin._createSpan(event, parentSpan)
					if (span) {
						if (event) {
							plugin._eventsSpanMap.set(event, span)
						}
						return api.context.with(
							api.trace.setSpan(api.context.active(), span),
							() => {
								const result = plugin._invokeListener(
									listener,
									this,
									args,
								)
								span.end()
								return result
							},
						)
					} else {
						return plugin._invokeListener(listener, this, args)
					}
				}
				if (
					plugin.addPatchedListener(
						this,
						type,
						listener,
						patchedListener,
					)
				) {
					return original.call(
						this,
						type,
						patchedListener,
						useCapture,
					)
				}
			}
		}
	}

	/**
	 * This patches the removeEventListener of HTMLElement to handle the fact that
	 * we patched the original callbacks
	 */
	private _patchRemoveEventListener() {
		const plugin = this
		return (original: Function) => {
			return function removeEventListenerPatched(
				this: HTMLElement,
				type: any,
				listener: any,
				useCapture: any,
			) {
				const wrappedListener = plugin.removePatchedListener(
					this,
					type,
					listener,
				)
				if (wrappedListener) {
					return original.call(
						this,
						type,
						wrappedListener,
						useCapture,
					)
				} else {
					return original.call(this, type, listener, useCapture)
				}
			}
		}
	}

	/**
	 * Most browser provide event listener api via EventTarget in prototype chain.
	 * Exception to this is IE 11 which has it on the prototypes closest to EventTarget:
	 *
	 * * - has addEventListener in IE
	 * ** - has addEventListener in all other browsers
	 * ! - missing in IE
	 *
	 * HTMLElement -> Element -> Node * -> EventTarget **! -> Object
	 * Document -> Node * -> EventTarget **! -> Object
	 * Window * -> WindowProperties ! -> EventTarget **! -> Object
	 */
	private _getPatchableEventTargets(): EventTarget[] {
		return window.EventTarget
			? [EventTarget.prototype]
			: [Node.prototype, Window.prototype]
	}

	/**
	 * implements enable function
	 */
	override enable() {
		const targets = this._getPatchableEventTargets()
		targets.forEach((target) => {
			if (isWrapped(target.addEventListener)) {
				this._unwrap(target, 'addEventListener')
				this._diag.debug(
					'removing previous patch from method addEventListener',
				)
			}
			if (isWrapped(target.removeEventListener)) {
				this._unwrap(target, 'removeEventListener')
				this._diag.debug(
					'removing previous patch from method removeEventListener',
				)
			}
			this._wrap(
				target,
				'addEventListener',
				this._patchAddEventListener(),
			)
			this._wrap(
				target,
				'removeEventListener',
				this._patchRemoveEventListener(),
			)
		})
	}

	/**
	 * implements unpatch function
	 */
	override disable() {
		const targets = this._getPatchableEventTargets()
		targets.forEach((target) => {
			if (isWrapped(target.addEventListener)) {
				this._unwrap(target, 'addEventListener')
			}
			if (isWrapped(target.removeEventListener)) {
				this._unwrap(target, 'removeEventListener')
			}
		})
	}
}
