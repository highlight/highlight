import { DropdownIndicator } from '@components/DropdownIndicator/DropdownIndicator'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { useGetQuickFieldsOpensearchQuery } from '@graph/hooks'
import AsyncSelect from '@highlight-run/react-select/async'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { SharedSelectStyleProps } from '@pages/Sessions/SearchInputs/SearchInputUtil'
import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import { validateEmail } from '@util/string'
import { isUrl } from '@util/url/isUrl'
import classNames from 'classnames'
import _ from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import AnimateHeight from 'react-animate-height'
import { useHistory } from 'react-router-dom'
import { components, Styles } from 'react-select'

import styles from './QuickSearch.module.scss'

interface QuickSearchOption {
	type: string
	name: string
	value: string
	__typename: string
}

interface Suggestion {
	label: string
	tooltip: string | React.ReactNode
	options: QuickSearchOption[]
}

const SESSIONS_SEARCH = 'Sessions'
const ERRORS_SEARCH = 'Errors'
const ERROR_TYPE = 'error-field'
// keys where we should use the 'contains' verb rather than the 'is' default
const CONTAINS_KEYS = new Set<string>(['email', 'identifier'])
const RESULT_COUNT = 10
// number of previous searches to remember (drop the LRU)
const MAX_LAST_SEARCHES = 10

const getQueryFieldKey = (input: QuickSearchOption) => {
	// Event is a special case because we query it on the error group
	// instead of the error object
	if (input.type === ERROR_TYPE && input.name === 'event') {
		return 'error_Event'
	}
	return input.type.toLowerCase() + '_' + input.name.toLowerCase()
}

export const styleProps: Styles<any, false> = {
	...SharedSelectStyleProps,
	option: (provided, { isFocused }) => ({
		...provided,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		direction: 'ltr',
		textAlign: 'left',
		padding: '8px 12px',
		fontSize: '12px',
		color: 'var(--color-text-primary)',
		backgroundColor: isFocused ? 'var(--color-gray-200)' : 'none',
		'&:active': {
			backgroundColor: 'var(--color-gray-200)',
		},
		transition: 'all 0.2s ease-in-out',
	}),
	menu: (provided) => ({
		...provided,
		borderRadius: 'var(--border-radius)',
		boxShadow: 'var(--box-shadow)',
		border: '1px solid var(--color-gray-300)',
		minWidth: '400px',
		right: 0,
	}),
	menuList: (provided) => ({
		...provided,
		scrollbarWidth: 'none',
		padding: '0',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	}),
	input: (provided) => ({
		...provided,
		lineHeight: 'normal',
	}),
	control: (provided) => ({
		...provided,
		border: '1px solid var(--color-gray-300)',
		borderRadius: 'var(--border-radius)',
		boxShadow: '0',
		fontSize: '12px',
		background: 'none',
		flexDirection: 'row-reverse',
		minHeight: '28px',
		'&:hover': {
			borderColor: 'var(--color-purple) !important',
		},
		transition: 'all 0.2s ease-in-out',
		'&:focus-within': {
			boxShadow:
				'0 0 0 4px rgba(var(--color-purple-rgb), 0.2) !important',
			borderColor: 'var(--color-purple) !important',
		},
	}),
	valueContainer: (provided) => ({
		...provided,
		padding: '0 12px',
		height: '28px',
		cursor: 'text',
	}),
	noOptionsMessage: (provided) => ({
		...provided,
		fontSize: '12px',
	}),
	loadingMessage: (provided) => ({
		...provided,
		fontSize: '12px',
	}),
	loadingIndicator: (provided) => ({
		...provided,
		padding: '0',
		margin: '0 -2px 0 10px',
	}),
	placeholder: (provided) => ({
		...provided,
		color: 'var(--color-gray-600) !important',
		top: '53%',
		cursor: 'text',
	}),
}

const QuickSearch = () => {
	const history = useHistory()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [query, setQuery] = useState('')
	const [lastTyped, setLastTyped] = useState('')
	const [lastLoadedQuery, setLastLoadedQuery] = useState<string>()
	const [isTyping, setIsTyping] = useState(false)
	const {
		setSearchParams,
		setExistingParams,
		setShowStarredSessions,
		removeSelectedSegment,
		setQueryBuilderInput,
	} = useSearchContext()
	const selectRef = useRef<any>(null)
	const {
		isQuickSearchOpen: isMenuOpen,
		setIsQuickSearchOpen: setIsMenuOpen,
	} = useSearchContext()
	const [lastSearches, setLastSearches] = useLocalStorage<
		QuickSearchOption[]
	>('highlightQuickSearchLastSearches')
	const lastSessionSearches = lastSearches?.filter(
		(s) => s.type !== ERROR_TYPE,
	)
	const lastErrorSearches = lastSearches?.filter((s) => s.type === ERROR_TYPE)

	const addLastSearch = (field: QuickSearchOption) => {
		// remove existing duplicates
		const previous = (lastSearches || []).filter(
			(p) =>
				p.name != field.name ||
				p.type != field.type ||
				p.value != field.value,
		)
		setLastSearches([field, ...previous].slice(0, MAX_LAST_SEARCHES))
	}

	const { loading, refetch } = useGetQuickFieldsOpensearchQuery({
		variables: {
			project_id,
			count: RESULT_COUNT,
			query: '',
		},
		notifyOnNetworkStatusChange: true,
	})

	const getOption = (props: any) => {
		const {
			data: { name, value },
		} = props

		return (
			<div>
				<components.Option {...props}>
					<div className={styles.optionLabelContainer}>
						{!!name && (
							<div>
								<div className={styles.optionLabelType}>
									{`${name}: `}
								</div>
							</div>
						)}
						<TextHighlighter
							className={styles.optionLabelName}
							searchWords={query.split(' ')}
							autoEscape={true}
							textToHighlight={value}
						/>
					</div>
				</components.Option>
			</div>
		)
	}

	const getValueOptions = (
		input: string,
		callback: (s: Suggestion[]) => void,
	) => {
		refetch({
			project_id,
			count: RESULT_COUNT,
			query: input,
		})?.then((fetched) => {
			setLastLoadedQuery(input)
			const suggestions: Suggestion[] = []

			const sessionOptions: QuickSearchOption[] = []
			const errorOptions: QuickSearchOption[] = []
			fetched.data.quickFields_opensearch.forEach((item) => {
				const option = item as QuickSearchOption
				if (option.type === ERROR_TYPE) {
					errorOptions.push(option)
				} else {
					sessionOptions.push(option)
				}
			})

			// Show {RESULT_COUNT} total sessions + errors,
			// in equal proportion to the number of each returned.
			const sessionsCount = sessionOptions.length
			const errorsCount = errorOptions.length
			const totalCount = sessionsCount + errorsCount
			const shownSessions = Math.round(
				(sessionsCount / totalCount) * RESULT_COUNT,
			)
			const shownErrors = RESULT_COUNT - shownSessions

			suggestions.push({
				label: SESSIONS_SEARCH,
				tooltip: 'Fields recorded for sessions.',
				options: sessionOptions.slice(0, shownSessions),
			})

			suggestions.push({
				label: ERRORS_SEARCH,
				tooltip: 'Fields recorded for errors.',
				options: errorOptions.slice(0, shownErrors),
			})

			setIsTyping(false)
			callback(suggestions)
		})
	}

	const getDefaultField = (q: string): QuickSearchOption => {
		const field = {
			type: 'user',
			name: 'identifier',
			value: q,
			__typename: '',
		} as QuickSearchOption
		// simple pattern matching for the default
		if (validateEmail(q)) {
			field.type = 'user'
			field.name = 'email'
		}
		if (isUrl(q) || q.startsWith('/')) {
			field.type = 'session'
			field.name = 'visited-url'
		}
		return field
	}

	const onChange = (val: any) => {
		let field = val as QuickSearchOption
		// in case this was a quick copy-paste-enter
		// and we haven't had a chance to load the quick-fields match
		if (lastLoadedQuery !== query) {
			field = getDefaultField(query)
		}
		if (field.value.length) {
			addLastSearch(field)
		} else if (lastSearches?.length) {
			field = lastSearches[0]
		}

		if (field.type === ERROR_TYPE) {
			setQueryBuilderInput({
				type: 'errors',
				isAnd: true,
				rules: [[getQueryFieldKey(field), 'is', field.value]],
			})
			history.push(`/${project_id}/errors`)
		} else {
			let verb = 'is'
			if (CONTAINS_KEYS.has(field.name) || field.value.startsWith('/')) {
				verb = 'contains'
			}
			const searchParams = {
				...EmptySessionsSearchParams,
				query: JSON.stringify({
					isAnd: true,
					rules: [[getQueryFieldKey(field), verb, field.value]],
				}),
			}
			history.push(`/${project_id}/sessions`)
			setExistingParams(searchParams)
			setSearchParams(searchParams)
			setShowStarredSessions(false)
			removeSelectedSegment()
		}
		setLastLoadedQuery('')
	}

	// Ignore this so we have a consistent reference so debounce works.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const loadOptions = useMemo(() => _.debounce(getValueOptions, 300), [])

	const isLoading = loading || isTyping

	useEffect(() => {
		if (isMenuOpen) {
			selectRef?.current?.focus()
		} else {
			selectRef?.current?.blur()
		}
	}, [isMenuOpen])

	const defaultOptions = [
		{
			label: SESSIONS_SEARCH,
			tooltip: 'Search sessions.',
			options: lastTyped.length
				? [getDefaultField(lastTyped)]
				: lastSessionSearches?.length
				? lastSessionSearches
				: [],
		},
	]
	if (!lastTyped.length && lastErrorSearches?.length) {
		defaultOptions.push({
			label: ERRORS_SEARCH,
			tooltip: 'Search errors.',
			options: lastErrorSearches,
		})
	}

	return (
		<div className={styles.container}>
			<DropdownIndicator isLoading={isLoading} />
			<AsyncSelect
				ref={selectRef}
				loadOptions={(input, callback) => {
					loadOptions(input, (options) => {
						const def = getDefaultField(input)
						if (def.value.length) {
							if (options.length) {
								options[0].options.unshift(def)
							} else {
								options.unshift({
									label: SESSIONS_SEARCH,
									tooltip: 'Search by user identifier.',
									options: [def],
								})
							}
						}
						callback(options)
					})
				}}
				// @ts-expect-error
				styles={styleProps}
				isLoading={isLoading}
				isClearable={false}
				value={null}
				escapeClearsValue={true}
				onChange={onChange}
				className={classNames(styles.select, {
					[styles.menuIsOpen]: isMenuOpen,
				})}
				onMenuOpen={() => {
					setIsMenuOpen(true)
				}}
				onMenuClose={() => {
					setIsMenuOpen(false)
				}}
				noOptionsMessage={({ inputValue }) =>
					!inputValue ? null : `No results for "${inputValue}"`
				}
				placeholder="Search..."
				onInputChange={(newValue, actionMeta) => {
					if (actionMeta?.action === 'input-change') {
						setQuery(newValue)
					} else {
						setQuery('')
					}
					setIsTyping(newValue !== '')
					setLastTyped(newValue)
				}}
				components={{
					DropdownIndicator: () => (
						<div className={styles.dropdownPlaceholder}></div>
					),
					IndicatorSeparator: () => null,
					Option: getOption,
					GroupHeading: (props) => {
						return (
							<components.GroupHeading {...props}>
								<span className={styles.groupHeading}>
									{props.children}
								</span>
							</components.GroupHeading>
						)
					},
					LoadingIndicator: () => {
						return <></>
					},
					MenuList: (props: any) => {
						let height = 0
						if (Array.isArray(props.children)) {
							for (const c of props.children || []) {
								height += 35 + 35 * c.props.children.length
							}
						}
						return (
							<AnimateHeight
								key="animatedMenu"
								duration={300}
								height={height || 'auto'}
							>
								{props.children}
							</AnimateHeight>
						)
					},
				}}
				isSearchable
				defaultOptions={defaultOptions}
				maxMenuHeight={500}
				menuIsOpen={isMenuOpen === true ? true : undefined}
			/>
			<div
				className={classNames(styles.backdrop, {
					[styles.visible]: isMenuOpen,
				})}
			></div>
		</div>
	)
}

export default QuickSearch
