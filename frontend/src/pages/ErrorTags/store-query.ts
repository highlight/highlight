const LOCALSTORAGE_KEY = 'error-tag-query'

export function setErrorTagsQuery(query: string) {
	localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(query))
}

export function getErrorTagsQuery() {
	return localStorage.getItem(LOCALSTORAGE_KEY)
}
