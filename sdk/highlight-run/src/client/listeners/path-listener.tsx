// taken from: https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript/52809105#52809105
export const PathListener = (callback: (url: string) => void) => {
	callback(window.location.href)
	const initialPushState = history.pushState
	history.pushState = ((f) =>
		function pushState() {
			// @ts-ignore
			var ret = f.apply(this, arguments)
			window.dispatchEvent(new Event('pushstate'))
			window.dispatchEvent(new Event('locationchange'))
			return ret
		})(history.pushState)

	const initialReplaceState = history.replaceState
	history.replaceState = ((f) =>
		function replaceState() {
			// @ts-ignore
			var ret = f.apply(this, arguments)
			window.dispatchEvent(new Event('replacestate'))
			window.dispatchEvent(new Event('locationchange'))
			return ret
		})(history.replaceState)

	const onPopState = () => {
		window.dispatchEvent(new Event('locationchange'))
	}
	window.addEventListener('popstate', onPopState)

	const onLocationChange = function () {
		callback(window.location.href)
	}
	window.addEventListener('locationchange', onLocationChange)

	return () => {
		window.removeEventListener('popstate', onPopState)
		window.removeEventListener('locationchange', onLocationChange)
		history.pushState = initialPushState
		history.replaceState = initialReplaceState
	}
}
