export function GetBaseURL(): string {
	return (
		process.env.REACT_APP_FRONTEND_URI ||
		window.location.protocol + '//' + window.location.host
	)
}
