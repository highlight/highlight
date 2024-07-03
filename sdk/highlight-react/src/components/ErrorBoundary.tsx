import React, { ErrorInfo } from 'react'
import { ReportDialog, ReportDialogOptions } from './ReportDialog/ReportDialog'

export type FallbackRender = (errorData: {
	error: Error
	componentStack: string | null
	resetError(): void
}) => React.ReactElement

export type ErrorBoundaryProps = {
	children?: React.ReactNode
	/** If a Highlight report dialog should be rendered on error. Defaults to true. */
	showDialog?: boolean
	/** A custom dialog that you can provide to be shown when the ErrorBoundary is shown. */
	customDialog?: React.ReactNode
	/**
	 * Options to be passed into the Highlight report dialog.
	 * No-op if {@link showDialog} is false.
	 */
	dialogOptions?: ReportDialogOptions
	/**
	 * A fallback component that gets rendered when the error boundary encounters an error.
	 *
	 * Can either provide a React Component, or a function that returns React Component as
	 * a valid fallback prop. If a function is provided, the function will be called with
	 * the error, the component stack, and an function that resets the error boundary on error.
	 *
	 */
	fallback?: React.ReactElement | FallbackRender
	/** Called when the error boundary encounters an error */
	onError?(error: Error, componentStack: string): void
	/** Called on componentDidMount() */
	onMount?(): void
	/** Called if resetError() is called from the fallback render props function  */
	onReset?(error: Error | null, componentStack: string | null): void
	/** Called on componentWillUnmount() */
	onUnmount?(error: Error | null, componentStack: string | null): void
	/** Called before the error is captured by Highlight, allows for you to add tags or context using the scope */
	beforeCapture?(error: Error | null, componentStack: string | null): void
	/** Called after the report dialog's cancel button has been activated. */
	onAfterReportDialogCancelHandler?: () => void
	/** Called after the report dialog's submit button has been activated. */
	onAfterReportDialogSubmitHandler?: () => void
}

interface ErrorBoundaryState {
	componentStack: string | null
	error: Error | null
	showingDialog: boolean
}

const INITIAL_STATE: ErrorBoundaryState = {
	componentStack: null,
	error: null,
	showingDialog: false,
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	public state: ErrorBoundaryState = INITIAL_STATE

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		const { beforeCapture, onError, showDialog } = this.props

		if (beforeCapture) {
			beforeCapture(error, errorInfo.componentStack ?? null)
		}
		captureReactErrorBoundaryError(error, errorInfo)
		if (onError) {
			onError(error, errorInfo.componentStack ?? '')
		}
		if (showDialog !== false) {
			this.setState({ ...this.state, showingDialog: true })
		}

		// componentDidCatch is used over getDerivedStateFromError
		// so that componentStack is accessible through state.
		this.setState({
			error,
			componentStack: errorInfo.componentStack ?? null,
		})
	}

	public componentDidMount(): void {
		const { onMount } = this.props
		if (onMount) {
			onMount()
		}
	}

	public componentWillUnmount(): void {
		const { error, componentStack } = this.state
		const { onUnmount } = this.props
		if (onUnmount) {
			onUnmount(error, componentStack)
		}
	}

	resetErrorBoundary: () => void = () => {
		const { onReset } = this.props
		const { error, componentStack } = this.state
		if (onReset) {
			onReset(error, componentStack)
		}
		this.setState(INITIAL_STATE)
	}

	hideDialog: () => void = () => {
		this.setState({ ...this.state, showingDialog: false })
		;(
			this.props.onAfterReportDialogCancelHandler ||
			(() => {
				window.location.href = window.location.origin
			})
		)()
	}

	onReportDialogSubmitHandler: () => void = () => {
		if (this.props.onAfterReportDialogSubmitHandler) {
			this.props.onAfterReportDialogSubmitHandler()
		}
	}

	render() {
		const { fallback, children, customDialog } = this.props
		const { error, componentStack, showingDialog } = this.state

		if (error) {
			let element: React.ReactElement | undefined = undefined
			if (typeof fallback === 'function') {
				element = fallback({
					error,
					componentStack,
					resetError: this.resetErrorBoundary,
				})
			} else {
				element = fallback
			}

			if (React.isValidElement(element)) {
				return (
					<>
						{showingDialog && (
							<ReportDialog
								{...this.props.dialogOptions}
								onCloseHandler={this.hideDialog}
								onSubmitHandler={
									this.onReportDialogSubmitHandler
								}
							/>
						)}
						{element}
					</>
				)
			}

			if (fallback) {
				console.warn('fallback did not produce a valid ReactElement')
			}

			if (showingDialog && customDialog) {
				return customDialog
			}

			// Fail gracefully if no fallback provided or is not valid
			return (
				showingDialog && (
					<ReportDialog
						{...this.props.dialogOptions}
						onCloseHandler={this.hideDialog}
						onSubmitHandler={this.onReportDialogSubmitHandler}
					/>
				)
			)
		}

		if (typeof children === 'function') {
			return (children as any)()
		}

		return children
	}
}

/**
 * Logs react error boundary errors to Highlight.
 *
 * @param error An error captured by React Error Boundary
 * @param errorInfo The error details
 */
function captureReactErrorBoundaryError(
	error: Error,
	errorInfo: ErrorInfo,
): void {
	const component = getComponentNameFromStack(errorInfo.componentStack ?? '')
	if (!window.H) {
		console.warn('You need to install highlight.run.')
	} else {
		console.error(
			'Highlight ErrorBoundary caught an exception while rendering React component',
			{ error },
		)
		window.H.consume(error, {
			payload: { component },
			source: component,
			type: 'React.ErrorBoundary',
		})
	}
}

function getComponentNameFromStack(componentStack: string): string | undefined {
	const stack = componentStack.split('\n')

	if (stack.length < 1) {
		return undefined
	}

	const leafComponentLine = stack[1].trim()
	const tokens = leafComponentLine.split(' ')

	if (tokens.length !== 4) {
		return undefined
	}

	return `<${tokens[1]}>`
}

declare var window: any
