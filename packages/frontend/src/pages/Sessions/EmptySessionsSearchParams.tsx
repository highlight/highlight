import { Complete } from '../../util/types'
import { SearchParams } from './SearchContext/SearchContext'

export const EmptySessionsSearchParams: Complete<SearchParams> = {
	user_properties: [],
	identified: false,
	browser: undefined,
	date_range: undefined,
	excluded_properties: [],
	hide_viewed: false,
	length_range: undefined,
	os: undefined,
	referrer: undefined,
	track_properties: [],
	excluded_track_properties: [],
	visited_url: undefined,
	first_time: false,
	device_id: undefined,
	environments: [],
	app_versions: [],
	show_live_sessions: false,
	query: undefined,
	city: undefined,
}
