/// <reference types="zone.js" />

import { InstrumentationBase, isWrapped } from '@opentelemetry/instrumentation'

import * as api from '@opentelemetry/api'
import { hrTime } from '@opentelemetry/core'
import {
	EventName,
	ShouldPreventSpanCreation,
	UserInteractionInstrumentationConfig,
} from '@opentelemetry/instrumentation-user-interaction'
import { SpanData } from '@opentelemetry/instrumentation-user-interaction/build/src/internal-types'
import { getElementXPath } from '@opentelemetry/sdk-trace-web'
import { AsyncTask } from '@opentelemetry/instrumentation-user-interaction/build/esnext/internal-types'

const ZONE_CONTEXT_KEY = 'OT_ZONE_CONTEXT'
const EVENT_NAVIGATION_NAME = 'Navigation:'

function defaultShouldPreventSpanCreation() {
	return false
}

/**
 * This class represents a UserInteraction plugin for auto instrumentation. It
 * was pulled from the user contributed otel library and modified to work with
 * the Highlight SDK.
 */
export class UserInteractionInstrumentation extends InstrumentationBase {
	static readonly version = '0.1.0'
	static readonly moduleName: string = 'user-interaction'
	private _spansData = new WeakMap<api.Span, SpanData>()
	private _zonePatched?: boolean
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
	private _shouldPreventSpanCreation: ShouldPreventSpanCreation

	constructor(config: UserInteractionInstrumentationConfig = {}) {
		super(
			UserInteractionInstrumentation.moduleName,
			UserInteractionInstrumentation.version,
			config,
		)
		this._shouldPreventSpanCreation =
			typeof config?.shouldPreventSpanCreation === 'function'
				? config.shouldPreventSpanCreation
				: defaultShouldPreventSpanCreation
	}

	init() {}

	/**
	 * This will check if last task was timeout and will save the time to
	 * fix the user interaction when nothing happens
	 * This timeout comes from xhr plugin which is needed to collect information
	 * about last xhr main request from observer
	 * @param task
	 * @param span
	 */
	private _checkForTimeout(task: AsyncTask, span: api.Span) {
		const spanData = this._spansData.get(span)
		if (spanData) {
			if (task.source === 'setTimeout') {
				spanData.hrTimeLastTimeout = hrTime()
			} else if (
				task.source !== 'Promise.then' &&
				task.source !== 'setTimeout'
			) {
				spanData.hrTimeLastTimeout = undefined
			}
		}
	}

	/**
	 * Controls whether or not to create a span, based on the event type.
	 */
	protected _allowEventName(_: EventName): boolean {
		return true
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
	 * Decrement number of tasks that left in zone,
	 * This is needed to be able to end span when no more tasks left
	 * @param span
	 */
	private _decrementTask(span: api.Span) {
		const spanData = this._spansData.get(span)
		if (spanData) {
			spanData.taskCount--
			if (spanData.taskCount === 0) {
				this._tryToEndSpan(span, spanData.hrTimeLastTimeout)
			}
		}
	}

	/**
	 * Return the current span
	 * @param zone
	 * @private
	 */
	private _getCurrentSpan(zone: Zone): api.Span | undefined {
		const context: api.Context | undefined = zone.get(ZONE_CONTEXT_KEY)
		if (context) {
			return api.trace.getSpan(context)
		}
		return context
	}

	/**
	 * Increment number of tasks that are run within the same zone.
	 *     This is needed to be able to end span when no more tasks left
	 * @param span
	 */
	private _incrementTask(span: api.Span) {
		const spanData = this._spansData.get(span)
		if (spanData) {
			spanData.taskCount++
		}
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
	 * This is done when zone is not available
	 */
	private _patchAddEventListener() {
		const plugin = this
		let lastEventTimestamp = new Map<string, number>()

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

					// Ignore empty event type
					if (!event?.type) {
						return plugin._invokeListener(listener, this, args)
					}

					// Don't capture mousemove events too frequently
					if (
						Date.now() - (lastEventTimestamp.get(event.type) ?? 0) <
						1000 / 60
					) {
						return plugin._invokeListener(listener, this, args)
					}

					lastEventTimestamp.set(event.type, Date.now())

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
								// no zone so end span immediately
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
	 * This is done when zone is not available
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
	 * Patches the history api
	 */
	_patchHistoryApi() {
		this._unpatchHistoryApi()

		this._wrap(history, 'replaceState', this._patchHistoryMethod())
		this._wrap(history, 'pushState', this._patchHistoryMethod())
		this._wrap(history, 'back', this._patchHistoryMethod())
		this._wrap(history, 'forward', this._patchHistoryMethod())
		this._wrap(history, 'go', this._patchHistoryMethod())
	}

	/**
	 * Patches the certain history api method
	 */
	_patchHistoryMethod() {
		const plugin = this
		return (original: any) => {
			return function patchHistoryMethod(
				this: History,
				...args: unknown[]
			) {
				const url = `${location.pathname}${location.hash}${location.search}`
				const result = original.apply(this, args)
				const urlAfter = `${location.pathname}${location.hash}${location.search}`
				if (url !== urlAfter) {
					plugin._updateInteractionName(urlAfter)
				}
				return result
			}
		}
	}

	/**
	 * unpatch the history api methods
	 */
	_unpatchHistoryApi() {
		if (isWrapped(history.replaceState))
			this._unwrap(history, 'replaceState')
		if (isWrapped(history.pushState)) this._unwrap(history, 'pushState')
		if (isWrapped(history.back)) this._unwrap(history, 'back')
		if (isWrapped(history.forward)) this._unwrap(history, 'forward')
		if (isWrapped(history.go)) this._unwrap(history, 'go')
	}

	/**
	 * Updates interaction span name
	 * @param url
	 */
	_updateInteractionName(url: string) {
		const span: api.Span | undefined = api.trace.getSpan(
			api.context.active(),
		)
		if (span && typeof span.updateName === 'function') {
			span.updateName(`${EVENT_NAVIGATION_NAME} ${url}`)
		}
	}

	/**
	 * Patches zone cancel task - this is done to be able to correctly
	 * decrement the number of remaining tasks
	 */
	private _patchZoneCancelTask() {
		const plugin = this
		return (original: any) => {
			return function patchCancelTask<T extends Task>(
				this: Zone,
				task: AsyncTask,
			) {
				const currentZone = Zone.current
				const currentSpan = plugin._getCurrentSpan(currentZone)
				if (currentSpan && plugin._shouldCountTask(task, currentZone)) {
					plugin._decrementTask(currentSpan)
				}
				return original.call(this, task) as T
			}
		}
	}

	/**
	 * Patches zone schedule task - this is done to be able to correctly
	 * increment the number of tasks running within current zone but also to
	 * save time in case of timeout running from xhr plugin when waiting for
	 * main request from PerformanceResourceTiming
	 */
	private _patchZoneScheduleTask() {
		const plugin = this
		return (original: any) => {
			return function patchScheduleTask<T extends Task>(
				this: Zone,
				task: AsyncTask,
			) {
				const currentZone = Zone.current
				const currentSpan = plugin._getCurrentSpan(currentZone)
				if (currentSpan && plugin._shouldCountTask(task, currentZone)) {
					plugin._incrementTask(currentSpan)
					plugin._checkForTimeout(task, currentSpan)
				}
				return original.call(this, task) as T
			}
		}
	}

	/**
	 * Patches zone run task - this is done to be able to create a span when
	 * user interaction starts
	 * @private
	 */
	private _patchZoneRunTask() {
		const plugin = this
		return (
			original: (
				this: Zone,
				task: AsyncTask,
				applyThis?: any,
				applyArgs?: any,
			) => Zone,
		): ((
			this: Zone,
			task: AsyncTask,
			applyThis?: any,
			applyArgs?: any,
		) => Zone) => {
			return function patchRunTask(
				this: Zone,
				task: AsyncTask,
				applyThis?: any,
				applyArgs?: any,
			): Zone {
				const event =
					Array.isArray(applyArgs) && applyArgs[0] instanceof Event
						? applyArgs[0]
						: undefined
				const target = event?.target
				let span: api.Span | undefined
				const activeZone = this
				if (target) {
					span = plugin._createSpan(event)
					if (span) {
						plugin._incrementTask(span)
						return activeZone.run(() => {
							try {
								return api.context.with(
									api.trace.setSpan(
										api.context.active(),
										span!,
									),
									() => {
										const currentZone = Zone.current
										task._zone = currentZone
										return original.call(
											currentZone,
											task,
											applyThis,
											applyArgs,
										)
									},
								)
							} finally {
								plugin._decrementTask(span as api.Span)
							}
						})
					}
				} else {
					span = plugin._getCurrentSpan(activeZone)
				}

				try {
					return original.call(activeZone, task, applyThis, applyArgs)
				} finally {
					if (span && plugin._shouldCountTask(task, activeZone)) {
						plugin._decrementTask(span)
					}
				}
			}
		}
	}

	/**
	 * Decides if task should be counted.
	 * @param task
	 * @param currentZone
	 * @private
	 */
	private _shouldCountTask(task: AsyncTask, currentZone: Zone): boolean {
		if (task._zone) {
			currentZone = task._zone
		}
		if (!currentZone || !task.data || task.data.isPeriodic) {
			return false
		}
		const currentSpan = this._getCurrentSpan(currentZone)
		if (!currentSpan) {
			return false
		}
		if (!this._spansData.get(currentSpan)) {
			return false
		}
		return task.type === 'macroTask' || task.type === 'microTask'
	}

	/**
	 * Will try to end span when such span still exists.
	 * @param span
	 * @param endTime
	 * @private
	 */
	private _tryToEndSpan(span: api.Span, endTime?: api.HrTime) {
		if (span) {
			const spanData = this._spansData.get(span)
			if (spanData) {
				span.end(endTime)
				this._spansData.delete(span)
			}
		}
	}

	/**
	 * implements enable function
	 */
	override enable() {
		const ZoneWithPrototype = this._getZoneWithPrototype()
		this._diag.debug(
			'applying patch to',
			UserInteractionInstrumentation.moduleName,
			UserInteractionInstrumentation.version,
			'zone:',
			!!ZoneWithPrototype,
		)
		if (ZoneWithPrototype) {
			if (isWrapped(ZoneWithPrototype.prototype.runTask)) {
				this._unwrap(ZoneWithPrototype.prototype, 'runTask')
				this._diag.debug('removing previous patch from method runTask')
			}
			if (isWrapped(ZoneWithPrototype.prototype.scheduleTask)) {
				this._unwrap(ZoneWithPrototype.prototype, 'scheduleTask')
				this._diag.debug(
					'removing previous patch from method scheduleTask',
				)
			}
			if (isWrapped(ZoneWithPrototype.prototype.cancelTask)) {
				this._unwrap(ZoneWithPrototype.prototype, 'cancelTask')
				this._diag.debug(
					'removing previous patch from method cancelTask',
				)
			}

			this._zonePatched = true
			this._wrap(
				ZoneWithPrototype.prototype,
				'runTask',
				this._patchZoneRunTask(),
			)
			this._wrap(
				ZoneWithPrototype.prototype,
				'scheduleTask',
				this._patchZoneScheduleTask(),
			)
			this._wrap(
				ZoneWithPrototype.prototype,
				'cancelTask',
				this._patchZoneCancelTask(),
			)
		} else {
			this._zonePatched = false
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

		this._patchHistoryApi()
	}

	/**
	 * implements unpatch function
	 */
	override disable() {
		const ZoneWithPrototype = this._getZoneWithPrototype()
		this._diag.debug(
			'removing patch from',
			UserInteractionInstrumentation.moduleName,
			UserInteractionInstrumentation.version,
			'zone:',
			!!ZoneWithPrototype,
		)
		if (ZoneWithPrototype && this._zonePatched) {
			if (isWrapped(ZoneWithPrototype.prototype.runTask)) {
				this._unwrap(ZoneWithPrototype.prototype, 'runTask')
			}
			if (isWrapped(ZoneWithPrototype.prototype.scheduleTask)) {
				this._unwrap(ZoneWithPrototype.prototype, 'scheduleTask')
			}
			if (isWrapped(ZoneWithPrototype.prototype.cancelTask)) {
				this._unwrap(ZoneWithPrototype.prototype, 'cancelTask')
			}
		} else {
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
		this._unpatchHistoryApi()
	}

	/**
	 * returns Zone
	 */
	private _getZoneWithPrototype(): any | undefined {
		const _window: any = window as unknown as any
		return _window.Zone
	}
}
