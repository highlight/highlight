import React, { useRef, useState } from 'react'

export interface ReportDialogOptions {
	user?: {
		email?: string
		name?: string
	}
	title?: string
	subtitle?: string
	subtitle2?: string
	labelName?: string
	labelEmail?: string
	labelComments?: string
	placeholderComments?: string
	labelClose?: string
	labelSubmit?: string
	successMessage?: string
	successSubtitle?: string
	hideHighlightBranding?: boolean
}

type ReportDialogProps = ReportDialogOptions & {
	onCloseHandler?: () => void
	onSubmitHandler?: () => void
}

const ReportDialog = ({
	labelClose = 'Close',
	labelComments = 'What happened?',
	labelEmail = 'Email',
	labelName = 'Name',
	labelSubmit = 'Submit',
	subtitle2 = 'If you’d like to help, tell us what happened below.',
	subtitle = 'Our team has been notified.',
	successMessage = 'Your feedback has been sent. Thank you!',
	successSubtitle = "Thank you for sending us feedback. If you have any other concerns/questions, reach out to this application's support email.",
	title = 'It looks like we’re having issues.',
	placeholderComments = 'I typed in a name then clicked the button',
	user,
	onCloseHandler,
	onSubmitHandler,
	hideHighlightBranding = false,
}: ReportDialogProps) => {
	const [name, setName] = useState(user?.name || '')
	const [email, setEmail] = useState(user?.email || '')
	const [verbatim, setVerbatim] = useState('')
	const [sendingReport, setSendingReport] = useState(false)
	const [sentReport, setSentReport] = useState(false)
	// We want to record when the feedback started, not when the feedback is submitted. If we record the latter, the timing could be way off.
	const reportDialogOpenTime = useRef(new Date().toISOString())

	const handleSubmit = (event: React.SyntheticEvent) => {
		event.preventDefault()
		setSendingReport(true)

		if (window?.H?.addSessionFeedback) {
			window.H.addSessionFeedback({
				verbatim,
				userName: name,
				userEmail: email,
				timestampOverride: reportDialogOpenTime.current,
			})
		} else {
			console.warn(
				'Highlight is not initialized. Make sure highlight.run is installed and running.',
			)
		}
		// fake a loading state because addSessionFeedback is async
		new Promise((r) => window.setTimeout(r, 300)).then(() => {
			setSendingReport(false)
			setSentReport(true)
			if (onSubmitHandler) {
				onSubmitHandler()
			}
		})
	}

	return (
		<main className={`container`}>
			<div className={`card`}>
				<div
					className={`cardContents ${
						sentReport && 'cardContentsVisible'
					}`}
				>
					<h1 className={`title`}>{successMessage}</h1>
					<h4 className={`subtitle`}>{successSubtitle}</h4>
					<button
						className={`button confirmationButton`}
						onClick={onCloseHandler}
					>
						Close
					</button>
				</div>
				<div
					className={`cardContents ${
						!sentReport && 'cardContentsVisible'
					}`}
				>
					<div>
						<h1 className={`title`}>{title}</h1>
						<h2 className={`subtitle`}>
							{subtitle} {subtitle2}
						</h2>
					</div>
					<form className={`form`} onSubmit={handleSubmit}>
						<label>
							{labelName}
							<input
								type="text"
								value={name}
								name="name"
								autoFocus
								onChange={(e) => {
									setName(e.target.value)
								}}
							/>
						</label>

						<label>
							{labelEmail}
							<input
								type="email"
								value={email}
								name="email"
								onChange={(e) => {
									setEmail(e.target.value)
								}}
							/>
						</label>

						<label>
							{labelComments}
							<textarea
								value={verbatim}
								placeholder={placeholderComments}
								name="verbatim"
								rows={3}
								onChange={(e) => {
									setVerbatim(e.target.value)
								}}
							></textarea>
						</label>

						<div className={`formFooter`}>
							{!hideHighlightBranding && (
								<div className={`ad`}>
									<p className={`logoContainer`}>
										Crash reports powered by:
										{/*  eslint-disable-next-line react/jsx-no-target-blank */}
										{/* <a
											href="https://highlight.run"
											target="_blank"
										>
											<img
												src="https://app.highlight.run/logo-24x130.png"
												alt="Highlight"
												height="25"
												className={`logo`}
											/>
										</a> */}
									</p>
								</div>
							)}

							<div className={`formActionsContainer`}>
								<button
									type="submit"
									className={
										sendingReport
											? `button loadingButton`
											: 'button'
									}
								>
									{labelSubmit}
								</button>
								<button
									className={`button closeButton`}
									onClick={onCloseHandler}
									type="button"
								>
									{labelClose}
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</main>
	)
}

export default ReportDialog

declare var window: any
